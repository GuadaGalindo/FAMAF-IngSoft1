import Board from "../../components/Game/Board/Board";
import useBoard from "../../hooks/useBoard";
import useGame from "../../hooks/useGame";
import { getBoardStorage } from "../../utils/storageManagement";

function isEmptyBoard(board) {
  return (
    Array.isArray(board) &&
    board.every(
      (row) => Array.isArray(row) && row.every((cell) => cell === null)
    )
  );
}

export default function BoardContainer() {
  const { board } = useBoard();
  const { game } = useGame();
  const sessionBoard = getBoardStorage();
  const parsedSessionBoard = sessionBoard ?? board;
  const actualBoard =
    isEmptyBoard(board) && game.status === "in game"
      ? parsedSessionBoard
      : board;

  return <Board board={actualBoard} />;
}
