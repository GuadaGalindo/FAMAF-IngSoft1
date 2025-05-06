import { useContext } from "react";
import { BoardContext } from "../context/board-data-context";

const useBoard = () => {
  const context = useContext(BoardContext);
  if (!context) {
    throw new Error("useBoard must be used within a GameProvider");
  }
  return context
};

export default useBoard;
