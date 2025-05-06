import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import Tiles from "./Tiles";
import { act } from "react";
import useBoard from "../../../hooks/useBoard";
import useGame from "../../../hooks/useGame";
import { ToastProvider } from "../../../context/toast-context";
import useCard from "../../../hooks/useCard";

vi.mock("../../../hooks/useBoard", () => ({
  default: vi.fn(() => {}),
}));

vi.mock("../../../hooks/useGame", () => ({
  default: vi.fn(() => {}),
}));

vi.mock("../../../hooks/useCard", () => ({
  default: vi.fn(() => {}),
}));

describe("Tile tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.setItem("id", "1");
  });

  afterEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
  });

  it("should not let user click when game status is not in game", () => {
    const mockHandleTileClick = vi.fn();

    useBoard.mockReturnValue({
      handleTileClick: mockHandleTileClick,
      selectedTileIndex: { row: null, col: null },
      swapTiles: vi.fn(),
      possibleMoves: [],
      highlightTiles: [],
      highlightTilesPartialMove: [],
    });

    useGame.mockReturnValue({
      game: {
        status: "waiting", // "full" | "finished"
      },
    });

    useCard.mockReturnValue({
      focusedGroupId: "mov-card"
    })

    render(<Tiles row={[null]} rowIndex={0} />);

    const tile = screen.getByTestId("bg-amber-800");

    act(() => {
      tile.click();
    });

    expect(mockHandleTileClick).not.toBeCalled();
  });

  it("should not let user click when game status is in game and movType is empty", () => {
    const mockHandleTileClick = vi.fn();

    useBoard.mockReturnValue({
      handleTileClick: mockHandleTileClick,
      selectedTileIndex: { row: null, col: null },
      swapTiles: vi.fn(),
      possibleMoves: [],
      highlightTiles: [],
      highlightTilesPartialMove: [],
    });

    useGame.mockReturnValue({
      game: {
        status: "in game",
      },
      movType: {},
    });

    useCard.mockReturnValue({
      focusedGroupId: "mov-card"
    })

    render(
      <ToastProvider>
        <Tiles row={["red"]} rowIndex={0} />
      </ToastProvider>
    );

    const tile = screen.getByTestId("bg-red");

    act(() => {
      tile.click();
    });

    expect(mockHandleTileClick).not.toBeCalled();
  });

  it("should set the class 'selected' when the user clicks on a tile", () => {
    const mockHandleTileClick = vi.fn();

    useBoard.mockReturnValue({
      handleTileClick: mockHandleTileClick,
      selectedTileIndex: { row: 0, col: 0 },
      swapTiles: vi.fn(),
      possibleMoves: [],
      highlightTiles: [],
      highlightTilesPartialMove: [],
    });

    useGame.mockReturnValue({
      game: {
        status: "in game",
      },
      movType: { mock: 1 }, // filling movType with any data
    });

    useCard.mockReturnValue({
      focusedGroupId: "mov-card"
    })

    render(
      <ToastProvider>
        <Tiles row={["red"]} rowIndex={0} />
      </ToastProvider>
    );

    const tile = screen.getByTestId("bg-red");

    act(() => {
      tile.click();
    });

    expect(tile.className).toContain("selected");
  });

  it("should call handleTileClick focusedGroupId = 'mov-card' when the user click on a tile", () => {
    const mockHandleTileClick = vi.fn();

    useBoard.mockReturnValue({
      handleTileClick: mockHandleTileClick,
      selectedTileIndex: { row: null, col: null },
      swapTiles: vi.fn(),
      handlePossibleMoves: vi.fn(),
      possibleMoves: [],
      highlightTiles: [],
      highlightTilesPartialMove: [],
    });

    useGame.mockReturnValue({
      game: {
        status: "in game",
        player_turn: 0,
        players: [{ id: 1 }],
      },
      movType: { mock: 1 }, // filling movType with any data
    });

    useCard.mockReturnValue({
      focusedGroupId: "mov-card"
    })

    render(
      <ToastProvider>
        <Tiles row={["red"]} rowIndex={0} />
      </ToastProvider>
    );

    const tile = screen.getByTestId("bg-red");

    act(() => {
      tile.click();
    });

    expect(mockHandleTileClick).toBeCalledWith(0, 0);
  });

  it("should not let user click on a tile when it is not his turn", () => {
    const mockHandleTileClick = vi.fn();

    useBoard.mockReturnValue({
      handleTileClick: mockHandleTileClick,
      selectedTileIndex: { row: null, col: null },
      swapTiles: vi.fn(),
      possibleMoves: [],
      highlightTiles: [],
      highlightTilesPartialMove: [],
    });

    useGame.mockReturnValue({
      game: {
        status: "in game",
        player_turn: 1,
        players: [{ id: 1 }],
      },
      movType: { mock: 1 }, // filling movType with any data
    });

    render(
      <ToastProvider>
        <Tiles row={["red"]} rowIndex={0} />
      </ToastProvider>
    );

    const tile = screen.getByTestId("bg-red");

    act(() => {
      tile.click();
    });

    expect(mockHandleTileClick).not.toBeCalled();
  });

  it("should call handleFigureCardAction on focusedGroupId = 'fig-card' when the user click on a tile", () => {
    const mockHandleFigureCardAction = vi.fn();

    useBoard.mockReturnValue({
      handleFigureCardAction: mockHandleFigureCardAction,
      selectedTileIndex: { row: null, col: null },
      swapTiles: vi.fn(),
      handlePossibleMoves: vi.fn(),
      possibleMoves: [],
      highlightTiles: [],
      highlightTilesPartialMove: [],
    });

    useGame.mockReturnValue({
      game: {
        status: "in game",
        player_turn: 0,
        players: [{ id: 1 }],
      },
      movType: { mock: 1 }, // filling movType with any data
      selectedFigureCard: "mockSelectedFigureCard"
    });

    useCard.mockReturnValue({
      focusedGroupId: "fig-card"
    })

    render(
      <ToastProvider>
        <Tiles row={["red"]} rowIndex={0} />
      </ToastProvider>
    );

    const tile = screen.getByTestId("bg-red");

    act(() => {
      tile.click();
    });

    expect(mockHandleFigureCardAction).toBeCalledWith(0, 0, "mockSelectedFigureCard");
  });

  it("should call handleFigureCardAction on focusedGroupId = 'opponent-fig-card-0' when the user click on a tile", () => {
    const mockHandleFigureCardAction = vi.fn();

    useBoard.mockReturnValue({
      handleFigureCardAction: mockHandleFigureCardAction,
      selectedTileIndex: { row: null, col: null },
      swapTiles: vi.fn(),
      handlePossibleMoves: vi.fn(),
      possibleMoves: [],
      highlightTiles: [],
      highlightTilesPartialMove: [],
    });

    useGame.mockReturnValue({
      game: {
        status: "in game",
        player_turn: 0,
        players: [{ id: 1 }],
      },
      movType: { mock: 1 }, // filling movType with any data
      selectedFigureCard: "mockSelectedFigureCard"
    });

    useCard.mockReturnValue({
      focusedGroupId: "opponent-fig-card-0"
    })

    render(
      <ToastProvider>
        <Tiles row={["red"]} rowIndex={0} />
      </ToastProvider>
    );

    const tile = screen.getByTestId("bg-red");

    act(() => {
      tile.click();
    });

    expect(mockHandleFigureCardAction).toBeCalledWith(0, 0, "mockSelectedFigureCard");
  });
});
