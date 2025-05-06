from app.db.enums import FigTypeAndDifficulty
from pydantic import BaseModel
from app.schemas.movement_schema import Coordinate
from typing import List
from app.db.enums import Colors

class FigureInBoardSchema(BaseModel):
    fig : FigTypeAndDifficulty
    tiles: List[Coordinate]

    def __eq__(self, other):
        if isinstance(other, FigureInBoardSchema):
            return self.fig == other.fig and self.tiles == other.tiles
        return False
    
class FigureToDiscardSchema(BaseModel):

    figure_card: str
    associated_player: int
    figure_board: str
    clicked_x : int
    clicked_y : int