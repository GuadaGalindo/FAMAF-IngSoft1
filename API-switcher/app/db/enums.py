from enum import Enum

class PlayerState(Enum):
    SEARCHING = "searching"
    PLAYING = "playing"
    WAITING = "waiting"

class GameStatus(Enum):
    waiting = "waiting"
    full = "full"
    in_game = "in game"
    finished = "finished"

class MovementType(Enum):
    MOV_01 = "mov01"
    MOV_02 = "mov02"
    MOV_03 = "mov03"
    MOV_04 = "mov04"
    MOV_05 = "mov05"
    MOV_06 = "mov06"
    MOV_07 = "mov07"

class FigTypeAndDifficulty(Enum):
    FIG_01 = ("fig01", "difficult")
    FIG_02 = ("fig02", "difficult")
    FIG_03 = ("fig03", "difficult")
    FIG_04 = ("fig04", "difficult")
    FIG_05 = ("fig05", "difficult")
    FIG_06 = ("fig06", "difficult")
    FIG_07 = ("fig07", "difficult")
    FIG_08 = ("fig08", "difficult")
    FIG_09 = ("fig09", "difficult")
    FIG_10 = ("fig10", "difficult")
    FIG_11 = ("fig11", "difficult")
    FIG_12 = ("fig12", "difficult")
    FIG_13 = ("fig13", "difficult")
    FIG_14 = ("fig14", "difficult")
    FIG_15 = ("fig15", "difficult")
    FIG_16 = ("fig16", "difficult")
    FIG_17 = ("fig17", "difficult")
    FIG_18 = ("fig18", "difficult")
    FIGE_01 = ("fige01", "easy")
    FIGE_02 = ("fige02", "easy")
    FIGE_03 = ("fige03", "easy")
    FIGE_04 = ("fige04", "easy")
    FIGE_05 = ("fige05", "easy")
    FIGE_06 = ("fige06", "easy")
    FIGE_07 = ("fige07", "easy")

class Colors(Enum):
    red = "red"
    blue = "blue"
    yellow = "yellow"
    green = "green"
    none = "none"
