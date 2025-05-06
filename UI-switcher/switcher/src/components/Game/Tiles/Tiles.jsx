import { useEffect, useCallback } from "react";
import useBoard from "../../../hooks/useBoard";
import useGame from "../../../hooks/useGame";
import { useToast } from "../../../hooks/useToast";
import "./Tiles.css";
import { getAuthToken, getPlayerId } from "../../../utils/storageManagement";
import useFetch from "use-http";
import { BASE_URL_ENDPOINT, options } from "../../../config";
import useCard from "../../../hooks/useCard";


export default function Tiles({ row, rowIndex }) {
  const { game, movType, selectedFigureCard, addMessage } = useGame();
  const showToast = useToast();
  const {
    handleTileClick,
    selectedTiles,
    swapTiles,
    selectedTileIndex,
    handlePossibleMoves,
    possibleMoves,
    highlightTiles,
    handleFigureCardAction,
    highlightTilesPartialMove,
  } = useBoard();
  const { focusedGroupId, focusedCardId } = useCard();
  const playerTurnID = game?.players?.[game?.player_turn]?.id;
  const id = getPlayerId();
  const isPlayerTurn = playerTurnID?.toString() === id;
  const token = getAuthToken();
  const { put, response } = useFetch(BASE_URL_ENDPOINT, options(token));

  const fetchFigureData = useCallback(
    async (figureId, selectedFigureCard, x, y) => {
      try {
        const playerId = getPlayerId();
        const payload = {
          figure_card: selectedFigureCard[0],
          figure_board: figureId[0],
          associated_player: playerId,
          clicked_x: x,
          clicked_y:y,
        };

        const data = await put(`/games/${game.id}/figure/discard`, payload);

        if (!response.ok) {
          throw { status: response.status, detail: data.detail };
        }

        addMessage(data.message);
      } catch (e) {
        showToast(
          e?.status || "Error",
          e?.detail || "Error al descartar la figura. Intentalo nuevamente"
        );
      }
    },
    [addMessage, game.id, put, response.ok, response.status, showToast]
  );
  
  const fetchBlockFigure = useCallback(
    async (figureId, x, y) => {
      try {
        const payload = {
          figure_card: focusedCardId.type[0],
          figure_board: figureId[0],
          associated_player: focusedCardId.associated_player,
          clicked_x: x,
          clicked_y:y,
        };

        const data = await put(`/games/${game.id}/figure/block`, payload);

        if (!response.ok) {
          throw { status: response.status, detail: data.detail };
        }

        addMessage(data.message);
      } catch (e) {
        showToast(
          e?.status || "Error",
          e?.detail || "Error al bloquear la figura. Intentalo nuevamente"
        );
      }
    },
    [addMessage, game.id, put, response.ok, response.status, showToast, focusedCardId]
  );

  function handleClick(x, y) {
    if (game.status !== "in game" || !isPlayerTurn) {
      return;
    }
    
    if (focusedGroupId === null) {
      showToast(
        "No permitido",
        "Debes seleccionar una carta de movimiento o figura"
      );
    } else {
      if (focusedGroupId === "mov-card") {
        // si hay carta de movimiento seleccionada
        handlePossibleMoves(x, y, movType.movement_type);
        handleTileClick(x, y);
      } else if (focusedGroupId === "fig-card") {
        const figureData = handleFigureCardAction(x, y, selectedFigureCard);
        if (figureData) {
          fetchFigureData(figureData.figureId, figureData.selectedFigureCard, x, y);
        }
      } else {
        const figureData = handleFigureCardAction(x, y, selectedFigureCard);
        if (figureData) {
          fetchBlockFigure(figureData.figureId, x, y);
        }
      }
    }
  }

  useEffect(() => {
    swapTiles();
  }, [selectedTiles, swapTiles]);

  return row.map((color, colIndex) => {
    const isSelected =
      selectedTileIndex.row === rowIndex && selectedTileIndex.col === colIndex;

    const isHighlighted = highlightTiles.some(
      (tile) => tile.x === rowIndex && tile.y === colIndex
    );

    const isHighlightedPartialMove = highlightTilesPartialMove.some(
      (tile) => tile.x === rowIndex && tile.y === colIndex
    );

    const isPossibleMove = possibleMoves.some(
      (move) => move.row === rowIndex && move.col === colIndex
    );

    const tileClass = `tile bg-${
      game.status === "in game" ? color : "amber-800"
    } ${
      isPossibleMove
        ? "move-highlight"
        : isSelected
        ? "selected"
        : isHighlighted
        ? "highlighted"
        : ""
    } 
    ${(isHighlightedPartialMove && isHighlighted) ? 'partial-move-and-figure-highlight' : ''}
    ${isHighlightedPartialMove ? 'partial-move-highlight' : ''}`;
    
    


    return (
      <div
        data-testid={`bg-${game.status === "in game" ? color : "amber-800"}`}
        key={colIndex}
        className={tileClass}
        onClick={() => handleClick(rowIndex, colIndex)}
      >
        {isHighlightedPartialMove && <span>P</span>}
      </div>

    );
  });
}
