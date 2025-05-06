from app.schemas.game_schemas import GameSchemaIn, GameSchemaOut
from app.schemas.figure_card_schema import FigureCardSchema
from app.models.figure_card_model import FigureCard
from app.schemas.figure_schema import FigureInBoardSchema, FigureToDiscardSchema
from app.schemas.movement_schema import MovementSchema
from fastapi import APIRouter, HTTPException, Depends, status, Response
from sqlalchemy.orm import Session
from app.db.db import get_db
from app.db.enums import GameStatus, Colors
from app.schemas.player_schemas import PlayerGameSchemaOut
from app.models.game_models import Game
from app.models.player_models import Player
from app.dependencies.dependencies import get_game, get_player, check_name, get_game_status
from app.services.game_services import (search_player_in_game, is_player_host, remove_player_from_game,
                                        convert_game_to_schema, validate_game_capacity, add_player_to_game,
                                        validate_players_amount,  random_initial_turn,
                                        assign_next_turn, is_single_player_victory, is_out_of_figure_cards_victory, initialize_figure_decks,
                                        deal_figure_cards_to_player, clear_all_cards, end_game,
                                        has_partial_movement, remove_last_partial_movement, remove_all_partial_movements,
                                        calculate_partial_board, has_figure_card, erase_figure_card, get_real_card,
                                        get_real_figure_in_board, serialize_board, get_player_by_id, block_player, unlock_remaining_card)
from app.models.board_models import Board
from app.dependencies.dependencies import get_game, check_name, get_game_status
from app.services.movement_services import (deal_initial_movement_cards, deal_movement_cards,
                                            discard_movement_card, validate_movement,
                                            make_partial_move, reassign_all_movement_cards, delete_movement_cards_not_in_hand)
from app.services.figure_services import (get_figure_in_board)
from app.endpoints.websocket_endpoints import game_connection_managers
from app.services.auth_services import CustomHTTPBearer
from typing import List, Optional
import asyncio
import json
import logging


# with prefix we don't need to add /games to our endpoints urls
router = APIRouter(
    prefix="/games",
    tags=["Games"]
)

auth_scheme = CustomHTTPBearer()


@router.post("/", dependencies=[Depends(check_name)], response_model=GameSchemaOut)
async def create_game(game: GameSchemaIn, player: Player = Depends(auth_scheme), db: Session = Depends(get_db)):
    new_game = Game(
        name=game.name,
        player_amount=game.player_amount,
        host_id=player.id,
        forbidden_color=Colors.none
    )

    m_player = db.merge(player)
    new_game.players.append(m_player)

    db.add(new_game)
    db.commit()
    db.refresh(new_game)

    return new_game


@router.put("/{id_game}/join", summary="Join a game")
async def join_game(game: Game = Depends(get_game), player: Player = Depends(auth_scheme), db: Session = Depends(get_db)):
    """
    Join a player to an existing game.

    **Parameters:**
    - `id_game`: The ID of the game to join.

    - `id_player`: The ID of the player to join the game.
    """
    player = db.merge(player)

    validate_game_capacity(game)

    add_player_to_game(game, player, db)

    db.commit()
    db.refresh(game)
    db.refresh(player)

    asyncio.create_task(game_connection_managers[game.id].broadcast_connection(
        game=game, player_id=player.id, player_name=player.name))

    game_out = convert_game_to_schema(game)

    return {"message": f"{player.name} se unido a la partida", "game": game_out}


@router.put("/{id_game}/quit")
async def quit_game(player: Player = Depends(auth_scheme), game: Game = Depends(get_game), db: Session = Depends(get_db)):
    player = db.merge(player)

    search_player_in_game(player, game)

    if is_player_host(player, game) and not game.status == GameStatus.in_game:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN,
                            detail="El jugador es el host, no puede abandonar")

    remove_player_from_game(player, game, db)

    clear_all_cards(player, db)

    player.blocked = False

    db.commit()
    db.refresh(game)
    db.refresh(player)

    asyncio.create_task(game_connection_managers[game.id].broadcast_disconnection(
        game=game, player_id=player.id, player_name=player.name))

    if is_single_player_victory(game):
        asyncio.create_task(game_connection_managers[game.id].broadcast_game_won(
            game, game.players[0]))

        end_game(game, db)

        db.commit()
        db.refresh(player)

    return {"message": f"{player.name} abandono la partida", "game": convert_game_to_schema(game)}


@router.put("/{id_game}/start", summary="Start a game", dependencies=[Depends(auth_scheme)])
async def start_game(game: Game = Depends(get_game), db: Session = Depends(get_db)):
    validate_players_amount(game)

    random_initial_turn(game)

    game.status = GameStatus.in_game

    deal_initial_movement_cards(db, game)

    initialize_figure_decks(game, db)

    for player in game.players:
        deal_figure_cards_to_player(player, db)

    board = Board(game.id)
    db.add(board)
    db.commit()
    db.refresh(board)

    game_out = convert_game_to_schema(game)

    player_name = game.players[game.player_turn].name

    asyncio.create_task(
        game_connection_managers[game.id].broadcast_game_start(game, player_name))

    asyncio.create_task(
        game_connection_managers[game.id].broadcast_board(game))

    asyncio.create_task(
        game_connection_managers[game.id].broadcast_figures_in_board(game)
    )

    return {"message": "La partida ha comenzado", "game": game_out}


@router.put("/{id_game}/finish-turn", summary="Finish a turn")
async def finish_turn(player: Player = Depends(auth_scheme), game: Game = Depends(get_game), db: Session = Depends(get_db)):
    if game.status is not GameStatus.in_game:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,
                            detail="El juego debe estar comenzado")

    player_turn_obj: Player = game.players[game.player_turn]

    if player.id != player_turn_obj.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN,
                            detail="Es necesario que sea tu turno para poder finalizarlo")

    reassign_all_movement_cards(player_turn_obj, db)

    deal_movement_cards(player_turn_obj, db)

    deal_figure_cards_to_player(player_turn_obj, db)

    assign_next_turn(game)

    remove_all_partial_movements(player_turn_obj, db)

    db.commit()
    db.refresh(game)
    db.refresh(player_turn_obj)

    game_out = convert_game_to_schema(game)

    # Actualizamos el tablero y el juego
    asyncio.create_task(
        game_connection_managers[game.id].broadcast_partial_board(game))
    asyncio.create_task(
        game_connection_managers[game.id].broadcast_figures_in_board(game))
    asyncio.create_task(
        game_connection_managers[game.id].broadcast_game(game))
    asyncio.create_task(
        game_connection_managers[game.id].broadcast_finish_turn(game, game.players[game.player_turn].name))
    asyncio.create_task(
        game_connection_managers[game.id].broadcast_partial_moves_in_board(game)
    )

    return {"message": "Turno finalizado", "game": game_out}


@router.put("/{id_game}/movement/back", summary="Cancel movement")
async def undo_movement(player: Player = Depends(auth_scheme), game: Game = Depends(get_game), db: Session = Depends(get_db)):
    player_turn_obj: Player = game.players[game.player_turn]

    if player.id != player_turn_obj.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN,
                            detail="Es necesario que sea tu turno para cancelar el movimiento")

    if has_partial_movement(player_turn_obj):

        if remove_last_partial_movement(player_turn_obj, db):

            # Una vez actualizada la base de datos, actualizamos el tablero y el juego
            asyncio.create_task(
                game_connection_managers[game.id].broadcast_partial_board(game))
            asyncio.create_task(
                game_connection_managers[game.id].broadcast_figures_in_board(game))
            asyncio.create_task(
                game_connection_managers[game.id].broadcast_game(game))
            asyncio.create_task(
                game_connection_managers[game.id].broadcast_partial_moves_in_board(game)
                )

            return Response(status_code=status.HTTP_204_NO_CONTENT)
    else:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,
                            detail="No hay movimientos parciales para eliminar")


@router.put("/{id_game}/movement/add", summary="Add a movement to the game")
async def add_movement(movement: MovementSchema, player: Player = Depends(auth_scheme), game: Game = Depends(get_game), db: Session = Depends(get_db)):

    if game.status is not GameStatus.in_game:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,
                            detail="El juego debe estar comenzado")

    player_turn_obj: Player = game.players[game.player_turn]

    if player.id != player_turn_obj.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN,
                            detail="Es necesario que sea tu turno para poder realizar un movimiento")

    validate_movement(movement, game)

    discard_movement_card(movement, player, db)

    make_partial_move(movement=movement, player=player, db=db)

    db.commit()
    db.refresh(player_turn_obj)

    asyncio.create_task(
        game_connection_managers[game.id].broadcast_partial_board(game))
    asyncio.create_task(
        game_connection_managers[game.id].broadcast_figures_in_board(game))
    asyncio.create_task(
        game_connection_managers[game.id].broadcast_game(game))
    asyncio.create_task(
        game_connection_managers[game.id].broadcast_partial_moves_in_board(game)
    )

    return {"message": f"Movimiento realizado por {player.name}"}


@router.get("/", response_model=List[GameSchemaOut], summary="Get games filtered by status", dependencies=[Depends(auth_scheme)])
def get_games(
    # Se utiliza la función modularizada
    status: Optional[str] = Depends(get_game_status),
    db: Session = Depends(get_db)
):
    """
    Retrieve games filtered by status.

    **Parameters:**
    - `status`: The status of the games to filter by (waiting, in_game, finished). Optional.

    **Returns:**
    - A list of games that match the given status, or all games if no status is provided.
    """
    if status:
        games = db.query(Game).filter(Game.status == status).all()
    else:
        games = db.query(Game).all()

    return games


@router.put("/{id_game}/figure/discard", summary="Discard a figure card")
async def discard_figure_card(figure_to_discard: FigureToDiscardSchema, player: Player = Depends(auth_scheme), db: Session = Depends(get_db), game: Game = Depends(get_game)):

    player_turn_obj: Player = game.players[game.player_turn]
    board = calculate_partial_board(game)

    figure_card = get_real_card(
        player=player_turn_obj, figure_to_discard=figure_to_discard, db=db, game=game)
    figure_in_board = get_real_figure_in_board(
        figure_to_discard=figure_to_discard, game=game)

    figure_color = board.color_distribution[figure_to_discard.clicked_x][figure_to_discard.clicked_y]

    # Verificar que la carta figura esta en la mano del jugador

    if player.id != player_turn_obj.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN,
                            detail="Es necesario que sea tu turno para poder descartar una carta")

    if figure_color == game.forbidden_color:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN,
                            detail="El color de la figura no puede ser el color prohibido")

    if not has_figure_card(figure_card_schema=figure_card, player=player_turn_obj):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN,
                            detail="La carta figura no esta en la mano del jugador")

    figure_type = figure_card.type.value
    # Verificar que la carta figura esta formada en el tablero

    if figure_in_board.fig not in [x.fig for x in get_figure_in_board(board=board, figure_type=figure_type, f_color=game.forbidden_color)]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN,
                            detail="La carta figura no esta formada en el tablero")

    # Actualizar el tablero en la bd
    game.board.color_distribution = serialize_board(board)

    # Actualizar el color prohibido
    game.forbidden_color = figure_color

    asyncio.create_task(
        game_connection_managers[game.id].broadcast_board(game))

    # Setear movimientos como finales
    for movement in player_turn_obj.movements:
        movement.final_movement = True

    delete_movement_cards_not_in_hand(player_turn_obj, db)

    # Registrar la carta figura en el descarte
    erase_figure_card(player=player_turn_obj, figure=figure_card, db=db)

    db.commit()
    db.refresh(player_turn_obj)

    cards_in_hand = [
        card for card in player_turn_obj.figure_cards if card.in_hand]

    if len(cards_in_hand) == 1:
        unlock_remaining_card(player_turn_obj, db)

    if not len(cards_in_hand) and player_turn_obj.blocked:
        player_turn_obj.blocked = False

    db.commit()
    db.refresh(game)
    db.refresh(player_turn_obj)

    asyncio.create_task(
        game_connection_managers[game.id].broadcast_game(game))

    # El color prohibido ha cambiado: reenviar todas las figuras formadas en el tablero.
    asyncio.create_task(
        game_connection_managers[game.id].broadcast_figures_in_board(game)
    )

    asyncio.create_task(
        game_connection_managers[game.id].broadcast_partial_moves_in_board(game) #
    )

    if is_out_of_figure_cards_victory(player_turn_obj):

        asyncio.create_task(game_connection_managers[game.id].broadcast_game_won(
            game, player_turn_obj))

        end_game(game, db)

    db.commit()
    db.refresh(player_turn_obj)

    return {"message": "Carta figura descartada con exito"}


@router.put("/{id_game}/figure/block", summary="Block a figure card")
async def block_figure_card(figure_to_block: FigureToDiscardSchema, player: Player = Depends(auth_scheme), db: Session = Depends(get_db), game: Game = Depends(get_game)):

    player_turn_obj: Player = game.players[game.player_turn]

    if player.id != player_turn_obj.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN,
                            detail="Es necesario que sea tu turno para poder bloquear a otro jugador")

    player_to_block = get_player_by_id(figure_to_block.associated_player, game)

    if player_to_block.blocked == True:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN,
                            detail="El jugador ya esta bloqueado")

    if len([cards for cards in player_to_block.figure_cards if cards.in_hand]) == 1:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN,
                            detail="El jugador solo tiene una carta figura, no puede ser bloqueado")

    if game.players[game.player_turn].id == player_to_block.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN,
                            detail="No puedes bloquear tu propia carta")
    board = calculate_partial_board(game)

    figure_card = get_real_card(
        player=player_to_block, figure_to_discard=figure_to_block, db=db, game=game)
    figure_in_board = get_real_figure_in_board(
        figure_to_discard=figure_to_block, game=game)

    figure_color = board.color_distribution[figure_to_block.clicked_x][figure_to_block.clicked_y]

    if figure_color == game.forbidden_color:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN,
                            detail="El color de la figura no puede ser el color prohibido")

    if not has_figure_card(figure_card_schema=figure_card, player=player_to_block):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN,
                            detail="La carta figura no esta en la mano del jugador a bloquear")

    figure_type = figure_card.type.value

    # Verificar que la carta figura esta formada en el tablero
    if figure_in_board.fig not in [x.fig for x in get_figure_in_board(board=board, figure_type=figure_type, f_color=game.forbidden_color)]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN,
                            detail="La carta figura no esta formada en el tablero")

    # Actualizar el tablero en la bd
    game.board.color_distribution = serialize_board(board)

    # Actualizar el color prohibido
    game.forbidden_color = figure_color

    asyncio.create_task(
        game_connection_managers[game.id].broadcast_board(game))

    # Setear movimientos como finales
    for movement in player_turn_obj.movements:
        movement.final_movement = True

    delete_movement_cards_not_in_hand(player_turn_obj, db)

    # Actually bloquear al jugador
    block_player(figure_card, player_to_block, db)

    asyncio.create_task(
        game_connection_managers[game.id].broadcast_game(game))

    asyncio.create_task(
        game_connection_managers[game.id].broadcast_figures_in_board(game)
    )
    asyncio.create_task(
        game_connection_managers[game.id].broadcast_partial_moves_in_board(game) #
    )

    return {"message": f"Bloqueaste a {player_to_block.name}!"}
