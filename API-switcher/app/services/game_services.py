from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.models.game_models import Game
from app.models.player_models import Player
from app.schemas.game_schemas import GameSchemaOut
from app.schemas.player_schemas import PlayerGameSchemaOut
from app.db.enums import GameStatus
from app.schemas.movement_cards_schema import MovementCardSchema
from app.schemas.player_schemas import PlayerGameSchemaOut
from app.schemas.movement_schema import MovementSchema, Coordinate
from app.db.enums import GameStatus, FigTypeAndDifficulty
from app.services.movement_services import reassign_movement_card
from app.db.constants import AMOUNT_OF_FIGURES_DIFFICULT, AMOUNT_OF_FIGURES_EASY
import random
from typing import List
from app.schemas.board_schemas import BoardSchemaOut
from app.models.figure_card_model import FigureCard
from app.schemas.figure_schema import FigTypeAndDifficulty, FigureInBoardSchema, FigureToDiscardSchema
from app.schemas.figure_card_schema import FigureCardSchema
import logging


def validate_game_capacity(game: Game):
    """validates if the player can join the game based on the capacity set by the host"""
    if len(game.players) >= game.player_amount:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT,
                            detail="La partida ya cumple con el máximo de jugadores admitidos")


def add_player_to_game(game: Game, player: Player, db: Session):
    """impact changes to de database"""
    player.game_id = game.id

    if len(game.players) + 1 == game.player_amount:
        game.status = GameStatus.full


def search_player_in_game(player: Player, game: Game):
    """
    Searchs for a player inside the game.
    Handle exception if the player is not inside the game.
    """
    for pl in game.players:
        if pl.id == player.id:
            return

    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                        detail="El jugador no esta en la partida")


def is_player_host(player: Player, game: Game) -> bool:
    """
    Checks if the player is the game host.
    Returns true if the player is the game host, if not returns false.
    """
    return player.id == game.host_id


def update_game_in_db(db: Session, game: Game):
    """
    Updates game info in data base.
    Commits, refreshes and handles exceptions.
    """
    try:
        db.commit()
        db.refresh(game)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                            detail="Error actualizando la partida")


def remove_player_from_game(player: Player, game: Game, db: Session):
    """
    Deletes a player.
    """
    player.game_id = None

    if len(game.players) == game.player_amount and game.status != GameStatus.in_game:
        game.status = GameStatus.waiting

    if game.status == GameStatus.in_game:
        # we dont care anymore about this once the game is started
        # but we need the right player amount to calculate next turn
        game.player_amount -= 1


def convert_game_to_schema(game: Game) -> GameSchemaOut:
    """return the schema view of Game"""
    game_out = GameSchemaOut(id=game.id, name=game.name, player_amount=game.player_amount, status=game.status,
                             host_id=game.host_id, player_turn=game.player_turn, forbidden_color=game.forbidden_color)

    game_out.players = [PlayerGameSchemaOut(
        id=pl.id, name=pl.name, blocked=pl.blocked,

        movement_cards=[MovementCardSchema(
            movement_type=mc.movement_type.value,
            associated_player=mc.associated_player,
            in_hand=mc.in_hand
        ) for mc in pl.movement_cards],

        figure_cards=[FigureCardSchema(
            type=fc.type_and_difficulty.value,
            associated_player=fc.associated_player,
            blocked=fc.blocked
        ) for fc in pl.figure_cards if fc.in_hand]

    ) for pl in game.players]
    return game_out


def validate_players_amount(game: Game):
    if len(game.players) != game.player_amount:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT,
                            detail="La partida requiere la cantidad de jugadores especificada para ser iniciada")


def random_initial_turn(game: Game):
    game.player_turn = random.randint(0, game.player_amount - 1)


def assign_next_turn(game: Game):
    game.player_turn = (game.player_turn + 1) % game.player_amount


def is_single_player_victory(game: Game) -> bool:
    """ return true if there is only one player in the game """
    player_alone = game.status == GameStatus.in_game and game.player_amount == 1

    return player_alone


def is_out_of_figure_cards_victory(player: Player) -> bool:
    """ return true if the actual player is out of figure cards """
    return len(player.figure_cards) == 0


def end_game(game: Game, db: Session):
    game.status = GameStatus.finished
    game.player_amount = 0

    for player in game.players:
        player.game_id = None
        player.blocked = False
        clear_all_cards(player, db)
        
    db.delete(game)


def convert_board_to_schema(game: Game):
    board = game.board
    return BoardSchemaOut(color_distribution=board.color_distribution)


def initialize_figure_decks(game: Game, db: Session):
    diff_cards_per_player = AMOUNT_OF_FIGURES_DIFFICULT * 2 // game.player_amount
    easy_cards_per_player = AMOUNT_OF_FIGURES_EASY * 2 // game.player_amount

    easy_cards_in_deck = {
        type: 0 for type in FigTypeAndDifficulty if type.value[1] == "easy"}
    diff_cards_in_deck = {
        type: 0 for type in FigTypeAndDifficulty if type.value[1] == "difficult"}

    for player in game.players:
        for _ in range(easy_cards_per_player):
            card_type = random.choice(
                [type for type in FigTypeAndDifficulty if type.value[1] == "easy" and easy_cards_in_deck[type] < 2])
            easy_cards_in_deck[card_type] += 1
            card = FigureCard(type_and_difficulty=card_type,
                              associated_player=player.id, in_hand=False, blocked=False)
            db.add(card)

        for _ in range(diff_cards_per_player):
            card_type = random.choice(
                [type for type in FigTypeAndDifficulty if type.value[1] == "difficult" and diff_cards_in_deck[type] < 2])
            diff_cards_in_deck[card_type] += 1
            card = FigureCard(type_and_difficulty=card_type,
                              associated_player=player.id, in_hand=False, blocked=False)
            db.add(card)

    db.commit()
    db.refresh(game)


def deal_figure_cards_to_player(player: Player, db: Session):
    if not player.blocked:
        figure_cards_in_hand = len(
            [cards for cards in player.figure_cards if cards.in_hand])
        for _ in range(3 - figure_cards_in_hand):
            remaining_cards = [
                card for card in player.figure_cards if not card.in_hand]
            if len(remaining_cards) > 0:
                card = random.choice(remaining_cards)
                card.in_hand = True

        db.commit()
        db.refresh(player)


def clear_all_cards(player: Player, db: Session):
    m_player = db.merge(player)
    for card in m_player.movement_cards:
        db.delete(card)
    for card in m_player.figure_cards:
        db.delete(card)

    db.commit()
    db.refresh(m_player)


def is_player_in_turn(player: Player, game: Game):
    return player.id == game.players[game.player_turn].id


def has_partial_movement(player: Player):
    for movement in player.movements:
        if not movement.final_movement:
            return True
    return False


def remove_last_partial_movement(player: Player, db: Session) -> bool:
    partial_movements = [
        movement for movement in player.movements if not movement.final_movement]

    if not partial_movements or len(partial_movements) > 3:
        return False

    # Ordenar por id en orden descendente y obtener el último movimiento parcial
    if len(partial_movements) == 1:
        last_partial_movement = partial_movements[0]
    else:
        last_partial_movement = sorted(
            partial_movements, key=lambda m: m.id, reverse=True)[0]
    # Eliminar el movimiento de la base de datos

    reassign_movement_card(last_partial_movement, player, db)

    player.movements.remove(last_partial_movement)
    db.delete(last_partial_movement)
    db.commit()

    return True


def remove_all_partial_movements(player: Player, db: Session):
    partial_movements = [
        movement for movement in player.movements if not movement.final_movement]

    if not partial_movements:
        return

    for partial_movement in partial_movements:
        player.movements.remove(partial_movement)
        db.delete(partial_movement)

    db.commit()


def calculate_partial_board(game: Game):
    actual_player: Player = game.players[game.player_turn]

    actual_board = game.board
    partial_board = [fila[:] for fila in actual_board.color_distribution]

    player_partial_movs = [
        mov for mov in actual_player.movements if not mov.final_movement]
    player_partial_movs = sorted(player_partial_movs, key=lambda mov: mov.id)

    for mov in player_partial_movs:
        partial_board[mov.x1][mov.y1], partial_board[mov.x2][mov.y2] = (
            partial_board[mov.x2][mov.y2], partial_board[mov.x1][mov.y1]
        )

    board_sch = BoardSchemaOut(color_distribution=partial_board)

    return board_sch


def verify_discard_blocked_card_condition(player: Player, figure_card: FigureCard):
    """
    We verify that the blocked player does not have more than two cards in_hand
    """
    if player.blocked and figure_card.blocked:
        if len(player.figure_cards) > 1:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No puedes descartar una carta bloqueada."
            )
    elif not player.blocked and figure_card.blocked:
        raise HTTPException(
            status_code=status.HTTP_412_PRECONDITION_FAILED,
            detail="Caso borde que no deberia pasar nunca."
        )


def has_figure_card(player: Player, figure_card_schema: FigureCardSchema) -> bool:
    """
    Verifica si el jugador tiene la carta de figura en mano comparando con el esquema dado.

    Args:
    - player: El jugador que se está verificando.
    - figure_card_schema: El esquema de la carta de figura a comparar.

    Returns:
    - True si la carta figura está en la mano del jugador, False de lo contrario.
    """
    filtered_cards = [card for card in player.figure_cards if card.in_hand and card.type_and_difficulty ==
                      figure_card_schema.type and card.associated_player == figure_card_schema.associated_player]

    if not filtered_cards:
        return False

    if len(filtered_cards) > 1:
        return True

    for card in filtered_cards:
        verify_discard_blocked_card_condition(player, card)

    return True


# Es posible que esta funcion no la saque de la base de datos, dejo constancia de un momento de demencia
# donde solo se hicieron unitest para esta funcion y no para el endpoint que la llama
# queda a futuro testear correctamente el endpoint, por cuestiones de tiempo y salud mental solo se hicieron test unitarios


def erase_figure_card(player: Player, figure: FigureCardSchema, db: Session):
    figure_card = next(
        (
            card for card in player.figure_cards if card.type_and_difficulty == figure.type and card.in_hand and not card.blocked),
        None
    )

    if not figure_card:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,
                            detail="Figure card not found in player's hand")
    player.figure_cards.remove(figure_card)
    db.delete(figure_card)


def get_real_FigType(ugly: str) -> (FigTypeAndDifficulty | None):
    for fig in FigTypeAndDifficulty:
        if fig.value[0] == ugly:
            return fig
    return None


def get_real_card(player: Player, figure_to_discard: FigureToDiscardSchema, db: Session, game: Game):
    real_type = get_real_FigType(figure_to_discard.figure_card)
    if real_type:
        return FigureCardSchema(type=real_type, associated_player=figure_to_discard.associated_player, blocked=False)


def get_real_figure_in_board(figure_to_discard: FigureToDiscardSchema, game: Game):
    real_type = get_real_FigType(ugly=figure_to_discard.figure_board)
    if real_type:
        return FigureInBoardSchema(fig=real_type, tiles=[])


def serialize_board(board: BoardSchemaOut):
    return [[color.value for color in row] for row in board.color_distribution]


def get_player_by_id(id: int, game: Game):
    for player in game.players:
        if player.id == id:
            return player
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                        detail="El jugador no esta en la partida")


def block_player(figure: FigureCardSchema, player: Player, db: Session):
    m_player = db.merge(player)
    m_player.blocked = True
    figure_card = next((card for card in m_player.figure_cards if card.type_and_difficulty ==
                       figure.type and card.in_hand), None)  # ojo aca
    figure_card.blocked = True

    db.commit()
    db.refresh(m_player)


def unlock_remaining_card(player: Player, db: Session):
    m_player = db.merge(player)

    if m_player.blocked:
        figure_card = next(
            (card for card in m_player.figure_cards if card.in_hand), None)  # ojo aca
        figure_card.blocked = False

    db.commit()
    db.refresh(m_player)

def get_move_tiles(game:Game) -> List[Coordinate]:
    player_in_turn_obj : Player = game.players[game.player_turn]
    player_partial_movs = [
        mov for mov in player_in_turn_obj.movements if not mov.final_movement]
    
    player_partial_movs = sorted(player_partial_movs, key=lambda mov: mov.id)

    partial_mov_tiles = []

    for mov in player_partial_movs:
        cord_1 = Coordinate(x=mov.x1, y=mov.y1)
        cord_2 = Coordinate(x=mov.x2, y=mov.y2)
        if cord_1 not in partial_mov_tiles:
            partial_mov_tiles.append(cord_1)

        if cord_2 not in partial_mov_tiles:
            partial_mov_tiles.append(cord_2)
        
    return partial_mov_tiles

