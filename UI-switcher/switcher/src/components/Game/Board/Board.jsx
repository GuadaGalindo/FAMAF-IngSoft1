import Tiles from "../Tiles/Tiles";
import "./Board.css";

export default function Board({ board }) {
  return (
    <div className="d-flex justify-content-center align-items-center">
      <div className="tablero">
        {board.map((row, rowIndex) => (
          <Tiles key={rowIndex} row={row} rowIndex={rowIndex} />
        ))}
      </div>
    </div>
  );
}
