import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import useGame from "../../../hooks/useGame";
import { fireEvent, render, screen } from "@testing-library/react";
import Board from "./Board";
import { ToastProvider } from "../../../context/toast-context";
import BoardProvider from "../../../context/board-data-context";
import useCard from "../../../hooks/useCard";


vi.mock("../../../hooks/useGame", () => ({
  default: vi.fn(() => {}),
}));

vi.mock("../../../hooks/useCard", () => ({
  default: vi.fn(() => {}),
}));

const test_board = [
  ["(0,0)", "(0,1)", "(0,2)", "(0,3)", "(0,4)", "(0,5)"],
  ["(1,0)", "(1,1)", "(1,2)", "(1,3)", "(1,4)", "(1,5)"],
  ["(2,0)", "(2,1)", "(2,2)", "(2,3)", "(2,4)", "(2,5)"],
  ["(3,0)", "(3,1)", "(3,2)", "(3,3)", "(3,4)", "(3,5)"],
  ["(4,0)", "(4,1)", "(4,2)", "(4,3)", "(4,4)", "(4,5)"],
  ["(5,0)", "(5,1)", "(5,2)", "(5,3)", "(5,4)", "(5,5)"],
];

describe("Board Tests", () => {
  beforeEach(() => {
    sessionStorage.setItem("id", "1");
  });

  afterEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
  });

  it("should highlight (4,0), (0,4), (0,0), (4,4) when using MOV01 on (2,2)", () => {
    useGame.mockReturnValue({
      game: {
        status: "in game",
        player_turn: 0,
        players: [{ id: 1 }],
      },
      movType: { movement_type: "mov01" },
    });

    useCard.mockReturnValue({
      focusedGroupId: "mov-card"
    })

    render(
      <ToastProvider>
        <BoardProvider>
          <Board board={test_board} />
        </BoardProvider>
      </ToastProvider>
    );

    const tile = screen.getByTestId("bg-(2,2)");

    fireEvent.click(tile);

    const tile_test_1 = screen.getByTestId("bg-(4,0)");
    const tile_test_2 = screen.getByTestId("bg-(0,4)");
    const tile_test_3 = screen.getByTestId("bg-(0,0)");
    const tile_test_4 = screen.getByTestId("bg-(4,4)");

    expect(tile_test_1).toHaveClass("move-highlight");
    expect(tile_test_2).toHaveClass("move-highlight");
    expect(tile_test_3).toHaveClass("move-highlight");
    expect(tile_test_4).toHaveClass("move-highlight");
  });

  it("should highlight (0,2), (4,2), (2,0), (2,4) when using MOV02 on (2,2)", () => {
    useGame.mockReturnValue({
      game: {
        status: "in game",
        player_turn: 0,
        players: [{ id: 1 }],
      },
      movType: { movement_type: "mov02" },
    });

    useCard.mockReturnValue({
      focusedGroupId: "mov-card"
    })

    render(
      <ToastProvider>
        <BoardProvider>
          <Board board={test_board} />
        </BoardProvider>
      </ToastProvider>
    );

    const tile = screen.getByTestId("bg-(2,2)");

    fireEvent.click(tile);

    const tile_test_1 = screen.getByTestId("bg-(0,2)");
    const tile_test_2 = screen.getByTestId("bg-(4,2)");
    const tile_test_3 = screen.getByTestId("bg-(2,0)");
    const tile_test_4 = screen.getByTestId("bg-(2,4)");

    expect(tile_test_1).toHaveClass("move-highlight");
    expect(tile_test_2).toHaveClass("move-highlight");
    expect(tile_test_3).toHaveClass("move-highlight");
    expect(tile_test_4).toHaveClass("move-highlight");
  });

  it("should highlight (1,2), (2,1), (2,3), (3,2) when using MOV03 on (2,2)", () => {
    useGame.mockReturnValue({
      game: {
        status: "in game",
        player_turn: 0,
        players: [{ id: 1 }],
      },
      movType: { movement_type: "mov03" },
    });

    useCard.mockReturnValue({
      focusedGroupId: "mov-card"
    })

    render(
      <ToastProvider>
        <BoardProvider>
          <Board board={test_board} />
        </BoardProvider>
      </ToastProvider>
    );

    const tile = screen.getByTestId("bg-(2,2)");

    fireEvent.click(tile);

    const tile_test_1 = screen.getByTestId("bg-(1,2)");
    const tile_test_2 = screen.getByTestId("bg-(2,1)");
    const tile_test_3 = screen.getByTestId("bg-(2,3)");
    const tile_test_4 = screen.getByTestId("bg-(3,2)");

    expect(tile_test_1).toHaveClass("move-highlight");
    expect(tile_test_2).toHaveClass("move-highlight");
    expect(tile_test_3).toHaveClass("move-highlight");
    expect(tile_test_4).toHaveClass("move-highlight");
  });

  it("should highlight (1,1), (1,3), (3,1), (3,3) when using MOV04 on (2,2)", () => {
    useGame.mockReturnValue({
      game: {
        status: "in game",
        player_turn: 0,
        players: [{ id: 1 }],
      },
      movType: { movement_type: "mov04" },
    });

    useCard.mockReturnValue({
      focusedGroupId: "mov-card"
    })

    render(
      <ToastProvider>
        <BoardProvider>
          <Board board={test_board} />
        </BoardProvider>
      </ToastProvider>
    );

    const tile = screen.getByTestId("bg-(2,2)");

    fireEvent.click(tile);

    const tile_test_1 = screen.getByTestId("bg-(1,1)");
    const tile_test_2 = screen.getByTestId("bg-(1,3)");
    const tile_test_3 = screen.getByTestId("bg-(3,1)");
    const tile_test_4 = screen.getByTestId("bg-(3,3)");

    expect(tile_test_1).toHaveClass("move-highlight");
    expect(tile_test_2).toHaveClass("move-highlight");
    expect(tile_test_3).toHaveClass("move-highlight");
    expect(tile_test_4).toHaveClass("move-highlight");
  });

  it("should highlight (1,0), (0,3), (3,4), (4,1) when using MOV05 on (2,2)", () => {
    useGame.mockReturnValue({
      game: {
        status: "in game",
        player_turn: 0,
        players: [{ id: 1 }],
      },
      movType: { movement_type: "mov05" },
    });

    useCard.mockReturnValue({
      focusedGroupId: "mov-card"
    })

    render(
      <ToastProvider>
        <BoardProvider>
          <Board board={test_board} />
        </BoardProvider>
      </ToastProvider>
    );

    const tile = screen.getByTestId("bg-(2,2)");

    fireEvent.click(tile);

    const tile_test_1 = screen.getByTestId("bg-(1,0)");
    const tile_test_2 = screen.getByTestId("bg-(0,3)");
    const tile_test_3 = screen.getByTestId("bg-(3,4)");
    const tile_test_4 = screen.getByTestId("bg-(4,1)");

    expect(tile_test_1).toHaveClass("move-highlight");
    expect(tile_test_2).toHaveClass("move-highlight");
    expect(tile_test_3).toHaveClass("move-highlight");
    expect(tile_test_4).toHaveClass("move-highlight");
  });

  it("should highlight (3,0), (0,1), (1,4), (4,3) when using MOV06 on (2,2)", () => {
    useGame.mockReturnValue({
      game: {
        status: "in game",
        player_turn: 0,
        players: [{ id: 1 }],
      },
      movType: { movement_type: "mov06" },
    });

    useCard.mockReturnValue({
      focusedGroupId: "mov-card"
    })

    render(
      <ToastProvider>
        <BoardProvider>
          <Board board={test_board} />
        </BoardProvider>
      </ToastProvider>
    );

    const tile = screen.getByTestId("bg-(2,2)");

    fireEvent.click(tile);

    const tile_test_1 = screen.getByTestId("bg-(3,0)");
    const tile_test_2 = screen.getByTestId("bg-(0,1)");
    const tile_test_3 = screen.getByTestId("bg-(1,4)");
    const tile_test_4 = screen.getByTestId("bg-(4,3)");

    expect(tile_test_1).toHaveClass("move-highlight");
    expect(tile_test_2).toHaveClass("move-highlight");
    expect(tile_test_3).toHaveClass("move-highlight");
    expect(tile_test_4).toHaveClass("move-highlight");
  });

  it("should highlight (0,4), (4,0) when using MOV07 on (0,0)", () => {
    useGame.mockReturnValue({
      game: {
        status: "in game",
        player_turn: 0,
        players: [{ id: 1 }],
      },
      movType: { movement_type: "mov07" },
    });

    useCard.mockReturnValue({
      focusedGroupId: "mov-card"
    })

    render(
      <ToastProvider>
        <BoardProvider>
          <Board board={test_board} />
        </BoardProvider>
      </ToastProvider>
    );

    const tile = screen.getByTestId("bg-(0,0)");

    fireEvent.click(tile);

    const tile_test_1 = screen.getByTestId("bg-(0,4)");
    const tile_test_2 = screen.getByTestId("bg-(4,0)");

    expect(tile_test_1).toHaveClass("move-highlight");
    expect(tile_test_2).toHaveClass("move-highlight");
  });

  it("should un-highlight tiles when user deselect selected tile", () => {
    useGame.mockReturnValue({
      game: {
        status: "in game",
        player_turn: 0,
        players: [{ id: 1 }],
      },
      movType: { movement_type: "mov07" },
    });

    render(
      <ToastProvider>
        <BoardProvider>
          <Board board={test_board} />
        </BoardProvider>
      </ToastProvider>
    );

    const tile = screen.getByTestId("bg-(0,0)");

    fireEvent.click(tile);
    fireEvent.click(tile);

    const tile_test_1 = screen.getByTestId("bg-(0,4)");
    const tile_test_2 = screen.getByTestId("bg-(4,0)");

    expect(tile_test_1).not.toHaveClass("move-highlight");
    expect(tile_test_2).not.toHaveClass("move-highlight");
  });
});
