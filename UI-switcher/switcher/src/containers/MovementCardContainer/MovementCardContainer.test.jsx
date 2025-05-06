import { describe, it, expect, beforeEach, vi, afterAll } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import MovementCardContainer from "./MovementCardContainer";
import useGame from "../../hooks/useGame";
import { act } from "react";
import useFetch from "use-http";
import useBoard from "../../hooks/useBoard";
import { ToastProvider } from "../../context/toast-context";
import CardProvider from "../../context/card-context";

vi.mock("../../hooks/useGame");
vi.mock("../../assets/cards/movement/mov01.svg", () => ({
  default: "mov01.svg",
}));
vi.mock("../../assets/cards/movement/mov02.svg", () => ({
  default: "mov02.svg",
}));
vi.mock("../../assets/cards/movement/mov03.svg", () => ({
  default: "mov03.svg",
}));

vi.mock(import("react-router-dom"), async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useParams: () => ({ gameId: 1 }),
  };
});

vi.mock("use-http", () => ({
  default: vi.fn(() => ({
    put: vi.fn(),
    response: { ok: true },
  })),
}));

vi.mock("../../hooks/useGame", () => ({
  default: vi.fn(),
}));

vi.mock("../../hooks/useBoard", () => ({
  default: vi.fn(() => ({
    selectedTiles: [],
    cleanSelectedTiles: vi.fn(),
  })),
}));

describe("MovementCardContainer test", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.setItem("id", "1");
  });

  afterAll(() => {
    sessionStorage.clear();
  });

  it("Should display no cards when there are no cards", () => {
    const mockGame = {
      players: [
        { id: 1, name: "player1", movement_cards: [] },
        { id: 2, name: "player2", movement_cards: [] },
      ],
    };

    useGame.mockReturnValue({
      game: mockGame,
    });

    render(<MovementCardContainer />);
    const movCardElement = screen.queryAllByAltText("carta movimiento");
    expect(movCardElement).toHaveLength(0);
  });

  it("Should display cards when there are cards", async () => {
    const mockGame = {
      players: [
        {
          id: 1,
          name: "juan",
          movement_cards: [
            { movement_type: "mov01", associated_player: 1, in_hand: true },
            { movement_type: "mov02", associated_player: 1, in_hand: true },
            { movement_type: "mov03", associated_player: 1, in_hand: true },
          ],
        },
        { id: 2, name: "pedro", movement_cards: [] },
      ],
    };

    useGame.mockReturnValue({
      game: mockGame,
    });

    render(<MovementCardContainer />);

    const movCardElement = screen.getAllByRole("img", {
      name: "carta movimiento",
    });
    expect(movCardElement).toHaveLength(3);
    movCardElement.forEach((element) => expect(element).toBeInTheDocument());
  });

  it("should apply 'focused' state when a movement card is clicked", () => {
    const mockGame = {
      status: "in game",
      player_turn: 0,
      players: [
        {
          id: 1,
          name: "juan",
          status: "in game",
          movement_cards: [
            { movement_type: "mov01", associated_player: 1, in_hand: true },
            { movement_type: "mov02", associated_player: 1, in_hand: true },
            { movement_type: "mov03", associated_player: 1, in_hand: true },
          ],
        },
        { id: 2, name: "pedro", movement_cards: [] },
      ],
    };

    useGame.mockReturnValue({
      game: mockGame,
      handleSetMovType: vi.fn(),
      cleanMovType: vi.fn(),
    });

    render(
      <CardProvider>
        <MovementCardContainer />
      </CardProvider>
    );

    const movCardElement = screen
      .getAllByRole("img", {
        name: "carta movimiento",
      })
      .at(0);

    act(() => {
      movCardElement.click();
    });

    expect(movCardElement.parentElement.className).toContain("focused");
  });

  it("should not let user click card if it is not his turn", () => {
    const mockGame = {
      status: "in game",
      player_turn: 2,
      players: [
        {
          id: 1,
          name: "juan",
          status: "in game",
          movement_cards: [
            { movement_type: "mov01", associated_player: 1, in_hand: true },
            { movement_type: "mov02", associated_player: 1, in_hand: true },
            { movement_type: "mov03", associated_player: 1, in_hand: true },
          ],
        },
        { id: 2, name: "pedro", movement_cards: [] },
      ],
    };

    useGame.mockReturnValue({
      game: mockGame,
      handleSetMovType: vi.fn(),
      cleanMovType: vi.fn(),
    });

    render(
      <CardProvider>
        <MovementCardContainer />
      </CardProvider>
    );

    const movCardElement = screen
      .getAllByRole("img", {
        name: "carta movimiento",
      })
      .at(0);

    act(() => {
      movCardElement.click();
    });

    expect(movCardElement.parentElement.className).not.toContain("focused");
  });

  it("should remove 'focused' state when a movement card is in 'focused' state is clicked", () => {
    const mockGame = {
      status: "in game",
      players: [
        {
          id: 1,
          name: "juan",
          status: "in game",
          movement_cards: [
            { movement_type: "mov01", associated_player: 1, in_hand: true },
            { movement_type: "mov02", associated_player: 1, in_hand: true },
            { movement_type: "mov03", associated_player: 1, in_hand: true },
          ],
        },
        { id: 2, name: "pedro", movement_cards: [] },
      ],
    };

    useGame.mockReturnValue({
      game: mockGame,
      handleSetMovType: vi.fn(),
    });

    render(
      <CardProvider>
        <MovementCardContainer />
      </CardProvider>
    );

    const movCardElement = screen
      .getAllByRole("img", {
        name: "carta movimiento",
      })
      .at(0);

    act(() => {
      movCardElement.click();
      movCardElement.click();
    });

    expect(movCardElement.parentElement.className).not.toContain("focused");
  });

  it("should remove 'focused' state to 'card 1' when 'card 2' is clicked and give selected state to that card", () => {
    const mockGame = {
      status: "in game",
      player_turn: 0,
      players: [
        {
          id: 1,
          name: "juan",
          status: "in game",
          movement_cards: [
            { movement_type: "mov01", associated_player: 1, in_hand: true },
            { movement_type: "mov02", associated_player: 1, in_hand: true },
            { movement_type: "mov03", associated_player: 1, in_hand: true },
          ],
        },
        { id: 2, name: "pedro", movement_cards: [] },
      ],
    };

    useGame.mockReturnValue({
      game: mockGame,
      handleSetMovType: vi.fn(),
    });

    render(
      <CardProvider>
        <MovementCardContainer />
      </CardProvider>
    );

    const movCard1 = screen
      .getAllByRole("img", {
        name: "carta movimiento",
      })
      .at(0);

    const movCard2 = screen
      .getAllByRole("img", {
        name: "carta movimiento",
      })
      .at(1);

    act(() => {
      movCard1.click();
      movCard2.click();
    });

    expect(movCard1.parentElement.className).not.toContain("focused");
    expect(movCard2.parentElement.className).toContain("focused");
  });

  it("should fetch add movement endpoint with successful response and add the message response to message state", async () => {
    const mockGame = {
      status: "in game",
      players: [
        {
          id: 1,
          name: "juan",
          movement_cards: [
            { movement_type: "mov01", associated_player: 1, in_hand: true },
            { movement_type: "mov02", associated_player: 1, in_hand: true },
            { movement_type: "mov03", associated_player: 1, in_hand: true },
          ],
        },
        { id: 2, name: "pedro", movement_cards: [] },
      ],
    };

    const mockAddMessage = vi.fn();

    useGame.mockReturnValue({
      game: mockGame,
      movType: { movement_type: "mov01", associated_player: 1, in_hand: true },
      handleSetMovType: vi.fn(),
      cleanMovType: vi.fn(),
      addMessage: mockAddMessage,
    });

    useBoard.mockReturnValue({
      board: [],
      selectedTiles: [
        { row: 0, col: 0 },
        { row: 0, col: 1 },
      ],
      cleanSelectedTiles: vi.fn(),
    });

    const mockPut = vi.fn().mockResolvedValue({
      message: "MOV SUCCESS",
    });

    useFetch.mockReturnValue({
      put: mockPut,
      response: { ok: true },
    });

    render(
      <ToastProvider>
        <CardProvider>
          <MovementCardContainer />
        </CardProvider>
      </ToastProvider>
    );

    const movCard1 = screen
      .queryAllByRole("img", {
        name: "carta movimiento",
      })
      .at(0);

    act(() => {
      movCard1.click();
    });

    await waitFor(() => {
      expect(mockPut).toBeCalledWith("/games/1/movement/add", {
        movement_card: {
          associated_player: 1,
          in_hand: true,
          movement_type: "mov01",
        },
        piece_1_coordinates: {
          x: 0,
          y: 0,
        },
        piece_2_coordinates: {
          x: 0,
          y: 1,
        },
      });
    });

    expect(mockAddMessage).toBeCalledWith("MOV SUCCESS");
  });

  it("should throw an error on unsuccessful fetch and undo the movement", async () => {
    const mockGame = {
      status: "in game",
      player_turn: 0,
      players: [
        {
          id: 1,
          name: "juan",
          movement_cards: [
            { movement_type: "mov01", associated_player: 1, in_hand: true },
            { movement_type: "mov02", associated_player: 1, in_hand: true },
            { movement_type: "mov03", associated_player: 1, in_hand: true },
          ],
        },
        { id: 2, name: "pedro", movement_cards: [] },
      ],
    };

    useGame.mockReturnValue({
      game: mockGame,
      movType: { movement_type: "mov01", associated_player: 1, in_hand: true },
      cleanMovType: vi.fn(),
      handleSetMovType: vi.fn(),
    });

    const mockUndoMovement = vi.fn();

    useBoard.mockReturnValue({
      board: [],
      selectedTiles: [
        { row: 0, col: 0 },
        { row: 0, col: 1 },
      ],
      undoMovement: mockUndoMovement,
      cleanSelectedTiles: vi.fn(),
    });

    const mockPut = vi.fn();

    useFetch.mockReturnValue({
      put: mockPut,
      response: { ok: false },
    });

    render(
      <ToastProvider>
        <MovementCardContainer />
      </ToastProvider>
    );

    const movCard1 = screen
      .queryAllByRole("img", {
        name: "carta movimiento",
      })
      .at(0);

    act(() => {
      movCard1.click();
    });

    await waitFor(() => {
      expect(mockPut).toBeCalledWith("/games/1/movement/add", {
        movement_card: {
          associated_player: 1,
          in_hand: true,
          movement_type: "mov01",
        },
        piece_1_coordinates: {
          x: 0,
          y: 0,
        },
        piece_2_coordinates: {
          x: 0,
          y: 1,
        },
      });
    });

    expect(mockUndoMovement).toBeCalled();
  });
});
