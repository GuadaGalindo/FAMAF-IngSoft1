import { createContext, useState, useCallback } from "react";
import calculatePossibleMoves from "../utils/possibleMoves";
import { useToast } from "../hooks/useToast";

const INITIAL_BOARD = [
  [null, null, null, null, null, null],
  [null, null, null, null, null, null],
  [null, null, null, null, null, null],
  [null, null, null, null, null, null],
  [null, null, null, null, null, null],
  [null, null, null, null, null, null],
];


export const BoardContext = createContext({
  board: INITIAL_BOARD,
  highlightTiles: [],
  highlightTilesPartialMove: [],
  selectedTiles: [],
  selectedTileIndex: {},
  possibleMoves: [],
  handleSetBoard: () => {},
  handleHighlightTiles: () => {},
  handleTileClick: () => {},
  swapTiles: () => {},
  undoMovement: () => {},
  cleanSelectedTiles: () => {},
  handlePossibleMoves: () => {},
  findFigureByCoordinates: () => {},
  handleFigureCardAction: () => {},
  handleHighlightTilesPartialMove: () => {},
});

export default function BoardProvider({ children }) {
  const [board, setBoard] = useState(INITIAL_BOARD);
  const [highlightTiles, setHighLightTiles] = useState([]);
  const [highlightTilesPartialMove, setHighLightTilesPartialMove] = useState([]);
  const [selectedTiles, setSelectedTiles] = useState([]);
  const [selectedTileIndex, setSelectedTileIndex] = useState({});
  const [history, setHistory] = useState([]);
  const [possibleMoves, setPossibleMoves] = useState([]);
  const showToast = useToast();

  const handleSetBoard = useCallback((data) => {
    setBoard(data);
  }, []);

  const handleTileClick = useCallback((rowIndex, colIndex) => {
    setSelectedTiles((prev) => {
      const newTile = { row: rowIndex, col: colIndex };

      const exists = prev.some(
        (tile) => tile.row === newTile.row && tile.col === newTile.col
      );

      if (!exists) {
        return [...prev, newTile];
      }

      setPossibleMoves([]);
      return [];
    });

    setSelectedTileIndex((prev) => {
      const newTileIndex = { row: rowIndex, col: colIndex };

      if (prev.row === newTileIndex.row && prev.col === newTileIndex.col) {
        return {};
      }

      return newTileIndex;
    });
  }, []);

  const handleHighlightTiles = useCallback((figures) => {
    setHighLightTiles(figures);
  }, []);

  const handleHighlightTilesPartialMove = useCallback((coord_list) => {
    setHighLightTilesPartialMove(coord_list);
  }, []);

  const swapTiles = useCallback(() => {
    if (selectedTiles.length === 2) {
      const [tile1, tile2] = selectedTiles;
      const newBoard = board.map((row) => [...row]);

      setHistory((prevHistory) => [...prevHistory, board]);

      const tempValue = newBoard[tile1.row][tile1.col];
      newBoard[tile1.row][tile1.col] = newBoard[tile2.row][tile2.col];
      newBoard[tile2.row][tile2.col] = tempValue;

      setBoard(newBoard);
      setSelectedTiles([]);
      setSelectedTileIndex({});
      setPossibleMoves([]);
    }
  }, [board, selectedTiles]);

  const undoMovement = useCallback(() => {
    setHistory((prevHistory) => {
      if (prevHistory.length > 0) {
        const lastBoardState = prevHistory[prevHistory.length - 1];
        setBoard(lastBoardState);
        return prevHistory.slice(0, -1);
      }
      return prevHistory;
    });
  }, []);

  const cleanSelectedTiles = useCallback(() => {
    setSelectedTiles([]);
    setSelectedTileIndex({});
    setPossibleMoves([]);
  }, []);

  const handlePossibleMoves = useCallback(
    (row, col, movType) => {
      if (selectedTiles.length < 1) {
        const newMoves = calculatePossibleMoves(row, col, movType);
        setPossibleMoves(newMoves);
      }
    },
    [selectedTiles.length]
  );

  const findFigureByCoordinates = useCallback((x, y, figures) => {
    for (let figure of figures) {
      for (let tile of figure.tiles) {
        if (tile.x === x && tile.y === y) {
          return figure.fig;
        }
      }
    }
    return null;
  }, []);

  const handleFigureCardAction = useCallback(
    (x, y, selectedFigureCard) => {
      const figures = JSON.parse(sessionStorage.getItem("figures")) || [];
      const figureId = findFigureByCoordinates(x, y, figures);

      if (figureId) {
        return { figureId, selectedFigureCard };
      } else {
        showToast("Error", "No hay ninguna figura en la posicion seleccionada");
      }
    },
    [findFigureByCoordinates, showToast]
  );

  const ctxValue = {
    board,
    highlightTiles,
    highlightTilesPartialMove,
    selectedTiles,
    selectedTileIndex,
    history,
    possibleMoves,
    handleSetBoard,
    handleHighlightTiles,
    handleTileClick,
    swapTiles,
    undoMovement,
    cleanSelectedTiles,
    handlePossibleMoves,
    findFigureByCoordinates,
    handleFigureCardAction,
    handleHighlightTilesPartialMove,
  };

  return (
    <BoardContext.Provider value={ctxValue}>{children}</BoardContext.Provider>
  );
}
