import { render, screen, waitFor } from "@testing-library/react";
import { act, renderHook } from "react";
import { BrowserRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import WS from "vitest-websocket-mock";
import { BASE_URL_WS } from "../../config";
import BoardProvider from "../../context/board-data-context";
import GameProvider from "../../context/game-data-context";
import { ToastProvider } from "../../context/toast-context";
import GameContainer from "./GameContainer";
import useFetch from "use-http";
import useWinnerNotification from "../../hooks/useWinnerNotification";

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

describe("GameContainer WebSocket test", () => {
  beforeEach(() => {
    // reset the server before each test
    WS.clean();
    vi.clearAllMocks();
    sessionStorage.clear();
    sessionStorage.setItem("id", "1");
  });

  afterEach(() => {
    sessionStorage.clear();
  });

 /* it.only("should handle game update messages", async () => {
    const server = new WS(`${BASE_URL_WS}/games/1`);

    // render the GameContainer component
    render(
      <ToastProvider>
        <BrowserRouter>
          <GameProvider>
            <BoardProvider>
              <GameContainer />
            </BoardProvider>
          </GameProvider>
        </BrowserRouter>
      </ToastProvider>
    );

    await waitFor(() => expect(server.connected).toBeTruthy());

    const mockMessage = {
      payload: {
        id: 1,
        name: "Test Game",
        player_amount: 4,
        status: "waiting",
        host_id: 1,
        player_turn: 0,
        players: [{ id: 1, name: "Player 1", movement_cards: [] }],
      },
      message: "Player 1 se ha unido",
    };

    act(() => {
      server.send(JSON.stringify(mockMessage));
    });

    const gameNameElement = screen.getByText("Partida: Test Game");

    await waitFor(() => {
      expect(gameNameElement).toBeInTheDocument();
      expect(screen.getByText("1/4")).toBeInTheDocument();
      expect(screen.getByText("Player 1")).toBeInTheDocument();
    });

    const newMockMessage = { ...mockMessage };
    newMockMessage.payload.players.push({ id: 2, name: "Player 2" });
    newMockMessage.message = "Player 2 se ha unido";

    act(() => {
      server.send(JSON.stringify(newMockMessage));
    });

    await waitFor(() => {
      expect(gameNameElement).toBeInTheDocument();
      expect(screen.getByText("2/4")).toBeInTheDocument();
      expect(screen.getByText("Player 1 , Player 2")).toBeInTheDocument();
    });

    act(() => {
      server.close();
    });
  });

  it("should handle WebSocket error messages gracefully", async () => {
    // mock console.error to track error handling
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    const server = new WS(`${BASE_URL_WS}/games/1`);

    render(
      <ToastProvider>
        <BrowserRouter>
          <GameProvider>
            <BoardProvider>
              <GameContainer />
            </BoardProvider>
          </GameProvider>
        </BrowserRouter>
      </ToastProvider>
    );

    await waitFor(() => expect(server.connected).toBeTruthy());

    // send an invalid JSON message
    act(() => {
      server.send("invalid json string");
    });

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalled(); // check if console.error was called
    });

    consoleErrorSpy.mockRestore(); // restore original console.error
  });*/

  // render tests

  it('should not render any MovCard componentimage when the game is not "in game"', async () => {
    const server = new WS(`${BASE_URL_WS}/games/1`);

    render(
      <ToastProvider>
        <BrowserRouter>
          <GameProvider>
            <BoardProvider>
              <GameContainer />
            </BoardProvider>
          </GameProvider>
        </BrowserRouter>
      </ToastProvider>
    );

    await waitFor(() => expect(server.connected).toBeTruthy());

    const mockMessage = {
      payload: {
        id: 1,
        name: "Test Game",
        player_amount: 4,
        status: "waiting",
        host_id: 1,
        player_turn: 0,
        players: [{ id: 1, name: "Player 1", movement_cards: [] }],
      },
      message: "Player 1 se ha unido",
    };

    act(() => {
      server.send(JSON.stringify(mockMessage));
    });

    const movCardElement = screen.queryAllByAltText("carta movimiento");
    expect(movCardElement).toHaveLength(0);

    act(() => {
      server.close();
    });
  });

  it('should not render any FigCard component image when the game is not "in game"', async () => {
    const server = new WS(`${BASE_URL_WS}/games/1`);

    render(
      <ToastProvider>
        <BrowserRouter>
          <GameProvider>
            <BoardProvider>
              <GameContainer />
            </BoardProvider>
          </GameProvider>
        </BrowserRouter>
      </ToastProvider>
    );

    await waitFor(() => expect(server.connected).toBeTruthy());

    const mockMessage = {
      payload: {
        id: 1,
        name: "Test Game",
        player_amount: 4,
        status: "waiting",
        host_id: 1,
        player_turn: 0,
        players: [{ id: 1, name: "Player 1", movement_cards: [] }],
      },
      message: "Player 1 se ha unido",
    };

    act(() => {
      server.send(JSON.stringify(mockMessage));
    });

    const figCardElement = screen.queryAllByAltText("img", {
      name: "carta figura",
    });
    expect(figCardElement).toHaveLength(0);

    act(() => {
      server.close();
    });
  });

  it("should swap tiles when user selects two tiles", async () => {
    const server = new WS(`${BASE_URL_WS}/games/1`);
    sessionStorage.setItem("id", 1);

    const mockPut = vi.fn();

    useFetch.mockReturnValue({
      put: mockPut,
      response: { ok: true },
    });

    render(
      <ToastProvider>
        <GameProvider>
          <BoardProvider>
            <BrowserRouter>
              <GameContainer />
            </BrowserRouter>
          </BoardProvider>
        </GameProvider>
      </ToastProvider>
    );

    await waitFor(() => {
      expect(server.connected).toBeTruthy();
    });

    const mockMessage = {
      type: "not board",
      payload: {
        id: 1,
        name: "Test Game",
        player_amount: 4,
        status: "in game",
        host_id: 1,
        player_turn: 0,
        players: [
          {
            id: 1,
            name: "Player 1",
            movement_cards: [
              { movement_type: "mov01", associated_player: 1, in_hand: true },
            ],
          },
        ],
      },
    };

    const boardMessage = {
      type: "board",
      payload: {
        color_distribution: [["red", "blue"]],
      },
    };

    act(() => {
      server.send(JSON.stringify(mockMessage));
      server.send(JSON.stringify(boardMessage));
    });

    let tile1 = screen.getByTestId("bg-red");
    let tile2 = screen.getByTestId("bg-blue");
    const movCardElement = screen.getByRole("img", {
      name: "carta movimiento",
    });

    act(() => {
      movCardElement.click();
    });

    act(() => {
      tile1.click();
      setTimeout(() => {}, 1000); // simulates user "thinking" time
      tile2.click();
    });

    tile1 = screen.getByTestId("bg-red");
    tile2 = screen.getByTestId("bg-blue");

    // expect tile 2 to be before than tile 1 in the element (successful swap)
    expect(tile2.compareDocumentPosition(tile1)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING
    );

    await waitFor(() => {
      expect(mockPut).toBeCalled();
    });

    // expect tile 1 to not be before tile 2 in the element (successful swap)
    expect(tile1.compareDocumentPosition(tile2)).not.toBe(
      Node.DOCUMENT_POSITION_FOLLOWING
    );
  });

  it("should undo movement on unsuccessful fetch after user selected two tiles", async () => {
    const server = new WS(`${BASE_URL_WS}/games/1`);
    sessionStorage.setItem("id", 1);

    const mockPut = vi.fn();

    useFetch.mockReturnValue({
      put: mockPut,
      response: { ok: false },
    });

    render(
      <ToastProvider>
        <GameProvider>
          <BoardProvider>
            <BrowserRouter>
              <GameContainer />
            </BrowserRouter>
          </BoardProvider>
        </GameProvider>
      </ToastProvider>
    );

    await waitFor(() => {
      expect(server.connected).toBeTruthy();
    });

    const mockMessage = {
      type: "not board",
      payload: {
        id: 1,
        name: "Test Game",
        player_amount: 4,
        status: "in game",
        host_id: 1,
        player_turn: 0,
        players: [
          {
            id: 1,
            name: "Player 1",
            movement_cards: [
              { movement_type: "mov01", associated_player: 1, in_hand: true },
            ],
          },
        ],
      },
    };

    const boardMessage = {
      type: "board",
      payload: {
        color_distribution: [["red", "blue"]],
      },
    };

    act(() => {
      server.send(JSON.stringify(mockMessage));
      server.send(JSON.stringify(boardMessage));
    });

    let tile1 = screen.getByTestId("bg-red");
    let tile2 = screen.getByTestId("bg-blue");
    const movCardElement = screen.getByRole("img", {
      name: "carta movimiento",
    });

    act(() => {
      movCardElement.click();
    });

    act(() => {
      tile1.click();
      setTimeout(() => {}, 1000); // simulates user "thinking" time
      tile2.click();
    });

    tile1 = screen.getByTestId("bg-red");
    tile2 = screen.getByTestId("bg-blue");

    // expect tile 2 to be before tile 1 in the element (successful swap)
    expect(tile2.compareDocumentPosition(tile1)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING
    );

    await waitFor(() => {
      expect(mockPut).toBeCalled();
    });

    tile1 = screen.getByTestId("bg-red");
    tile2 = screen.getByTestId("bg-blue");

    // expect tile 1 to be before tile 2 in the element (undo movement successful)
    expect(tile1.compareDocumentPosition(tile2)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING
    );
  });

  // test useWinnerNotification

  it('should set winner message when current player wins', async () => {
    const server = new WS(`${BASE_URL_WS}/games/1`);
    sessionStorage.setItem("id", 1);

    const mockPut = vi.fn();

    useFetch.mockReturnValue({
      put: mockPut,
      response: { ok: false },
    });

    render(
      <ToastProvider>
        <GameProvider>
          <BoardProvider>
            <BrowserRouter>
              <GameContainer />
            </BrowserRouter>
          </BoardProvider>
        </GameProvider>
      </ToastProvider>
    );

    await waitFor(() => {
      expect(server.connected).toBeTruthy();
    });

    const mockMessage = {
      type: "game won",
      payload: {
        player_id: 1
      }
    };

    act(() => {
      server.send(JSON.stringify(mockMessage));
    });

    expect(screen.getByText("Ganaste ¡Felicitaciones!")).toBeInTheDocument();
  });


  it('should set message when another player wins', async () => {
    const server = new WS(`${BASE_URL_WS}/games/1`);
    sessionStorage.setItem("id", 1);

    const mockPut = vi.fn();

    useFetch.mockReturnValue({
      put: mockPut,
      response: { ok: false },
    });

    render(
      <ToastProvider>
        <GameProvider>
          <BoardProvider>
            <BrowserRouter>
              <GameContainer />
            </BrowserRouter>
          </BoardProvider>
        </GameProvider>
      </ToastProvider>
    );

    await waitFor(() => {
      expect(server.connected).toBeTruthy();
    });

    const mockMessage = {
      type: "game won",
      payload: {
        player_id: 2
      },
      message: "Expected Winner Message"
    };

    act(() => {
      server.send(JSON.stringify(mockMessage));
    });

    expect(screen.getByText("Expected Winner Message")).toBeInTheDocument();
  });
});
