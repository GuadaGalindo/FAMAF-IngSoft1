import re
from fastapi import HTTPException, status, Depends, Body, Query
from typing import Optional
from sqlalchemy.orm import Session
from app.db.db import get_db
from app.models.game_models import Game
from app.models.player_models import Player
from app.schemas.game_schemas import GameSchemaIn, Annotated
from app.db.db import get_db
from app.db.enums import GameStatus
from typing import List
from app.schemas.game_schemas import GameSchemaOut
from app.services.game_services import convert_game_to_schema


def check_name(game: Annotated[GameSchemaIn, Body()]):
    if ((not game.name) or (len(game.name) > 20)):
        raise HTTPException(status_code=422, detail="Invalid name")
    if not re.match("^[a-zA-Z ]*$", game.name):
        raise HTTPException(
            status_code=422, detail="Name can only contain letters and spaces")


def get_player(id_player: int, db: Session = Depends(get_db)) -> Player:
    """dependency to get a player by ID"""
    player = db.query(Player).filter(Player.id == id_player).first()

    if not player:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                            detail=f"El jugador con id={id_player} no existe")

    return player


def get_game(id_game: int, db: Session = Depends(get_db)) -> Game:
    """dependency to get a game by ID"""
    game = db.query(Game).filter(Game.id == id_game).first()

    if not game:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Partida no encontrada")

    return game

def get_game_status(status: Optional[str] = Query(None, description="Filtra juegos por estado: (waiting, in_game, finished)")):
    valid_status = ["waiting", "in_game", "finished"]
    
    if status and status not in valid_status:
        raise HTTPException(status_code=404, detail="No games found")
    
    return status


def get_game_list() -> List[GameSchemaOut]:
    db = next(get_db())
    games = db.query(Game).filter(Game.status == GameStatus.waiting.value).all()
    games = list(map(convert_game_to_schema, games))
    return games
