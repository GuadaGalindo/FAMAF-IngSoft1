import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import BoardProvider from "../../context/board-data-context";
import GameProvider from "../../context/game-data-context";
import { ToastProvider } from "../../context/toast-context";
import useBoard from "../../hooks/useBoard";
import useGame from "../../hooks/useGame";
import BoardContainer from "./BoardContainer";

vi.mock("../../hooks/useGame", () => ({
  default: vi.fn(),
}));

vi.mock("../../hooks/useBoard", () => ({
  default: vi.fn(),
}));

describe("Board test", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should render the Board and Tiles componets correctly in game", async () => {
    const mockGame = {
      id: 1,
      name: "Test Game",
      host_id: 1,
      status: "in game",
      players: [{ id: 1, name: "Player 1" }],
      player_amount: 4,
    };

    useGame.mockReturnValue({
      game: mockGame,
    });

    const mockBoard = [
      ["red", "red", "red", "red", "red", "red"],
      ["red", "red", "red", "blue", "blue", "blue"],
      ["blue", "blue", "blue", "blue", "blue", "blue"],
      ["yellow", "yellow", "yellow", "yellow", "yellow", "yellow"],
      ["yellow", "yellow", "yellow", "green", "green", "green"],
      ["green", "green", "green", "green", "green", "green"],
    ];

    useBoard.mockReturnValue({
      board: mockBoard,
      selectedTileIndex: { row: null, col: null },
      swapTiles: vi.fn(),
      possibleMoves: [],
      highlightTiles: [],
      highlightTilesPartialMove: [],
    });

    render(
      <ToastProvider>
        <BrowserRouter>
          <GameProvider>
            <BoardProvider>
              <BoardContainer />
            </BoardProvider>
          </GameProvider>
        </BrowserRouter>
      </ToastProvider>
    );

    const redTiles = screen.getAllByTestId("bg-red");
    expect(redTiles.length).toBe(9);

    const blueTiles = screen.getAllByTestId("bg-blue");
    expect(blueTiles.length).toBe(9);

    const yellowTiles = screen.getAllByTestId("bg-yellow");
    expect(yellowTiles.length).toBe(9);

    const greenTiles = screen.getAllByTestId("bg-green");
    expect(greenTiles.length).toBe(9);
  });

  it("should render amber tiles when game is waiting", async () => {
    const mockGame = {
      id: 1,
      name: "Test Game",
      host_id: 1,
      status: "waiting",
      players: [{ id: 1, name: "Player 1" }],
      player_amount: 4,
    };

    useGame.mockReturnValue({
      game: mockGame,
    });

    useBoard.mockReturnValue({
      swapTiles: vi.fn(),
      selectedTileIndex: { row: null, col: null },
      board: [
        [null, null, null, null, null, null],
        [null, null, null, null, null, null],
        [null, null, null, null, null, null],
        [null, null, null, null, null, null],
        [null, null, null, null, null, null],
        [null, null, null, null, null, null],
      ],
      possibleMoves: [],
      highlightTiles: [],
      highlightTilesPartialMove: [],
    });

    render(
      <ToastProvider>
        <BrowserRouter>
          <GameProvider>
            <BoardProvider>
              <BoardContainer />
            </BoardProvider>
          </GameProvider>
        </BrowserRouter>
      </ToastProvider>
    );

    const redTiles = screen.getAllByTestId("bg-amber-800");
    expect(redTiles.length).toBe(36);
  });

  it("should use session storage when board is empty and game is in progress", async () => {
    const mockGame = {
      id: 1,
      name: "Test Game",
      host_id: 1,
      status: "in game",
      players: [{ id: 1, name: "Player 1" }],
      player_amount: 4,
    };

    useGame.mockReturnValue({
      game: mockGame,
    });

    const mockSessionBoard = [
      ["red", "red", "red", "red", "red", "red"],
      ["red", "red", "red", "blue", "blue", "blue"],
      ["blue", "blue", "blue", "blue", "blue", "blue"],
      ["yellow", "yellow", "yellow", "yellow", "yellow", "yellow"],
      ["yellow", "yellow", "yellow", "green", "green", "green"],
      ["green", "green", "green", "green", "green", "green"],
    ];

    useBoard.mockReturnValue({
      board: [],
      selectedTileIndex: { row: null, col: null },
      swapTiles: vi.fn(),
      possibleMoves: [],
      highlightTiles: [],
      highlightTilesPartialMove: [],
    });

    sessionStorage.setItem("board", JSON.stringify(mockSessionBoard));

    render(
      <ToastProvider>
        <BrowserRouter>
          <GameProvider>
            <BoardProvider>
              <BoardContainer />
            </BoardProvider>
          </GameProvider>
        </BrowserRouter>
      </ToastProvider>
    );

    const redTiles = screen.getAllByTestId("bg-red");
    expect(redTiles.length).toBe(9);

    const blueTiles = screen.getAllByTestId("bg-blue");
    expect(blueTiles.length).toBe(9);

    const yellowTiles = screen.getAllByTestId("bg-yellow");
    expect(yellowTiles.length).toBe(9);

    const greenTiles = screen.getAllByTestId("bg-green");
    expect(greenTiles.length).toBe(9);
  });
});
