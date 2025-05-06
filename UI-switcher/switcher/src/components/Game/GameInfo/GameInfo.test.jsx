import { render, screen, waitFor } from "@testing-library/react";
import WS from "vitest-websocket-mock";
import { describe, beforeEach, it, expect, vi } from "vitest";
import GameContainer from "../../../containers/GameContainer/GameContainer";
import { BrowserRouter } from "react-router-dom";
import { act } from "react";
import GameProvider from "../../../context/game-data-context";
import { BASE_URL_WS } from "../../../config";
import { ToastProvider } from "../../../context/toast-context";

vi.mock(import("react-router-dom"), async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useParams: () => ({ gameId: 1 }),
  };
});

describe("GameInfo test", () => {
  beforeEach(() => {
    // reset the server before each test
    WS.clean();
    vi.clearAllMocks();
    sessionStorage.setItem("token", "123");
    sessionStorage.setItem("id", "1");
  });

  it("should filter out the current player's card", async () => {
    const server = new WS(`${BASE_URL_WS}/games/1`);

    // render the GameContainer component
    render(
      <ToastProvider>
        <BrowserRouter>
          <GameProvider>
            <GameContainer />
          </GameProvider>
        </BrowserRouter>
      </ToastProvider>
    );

    await waitFor(() => expect(server.connected).toBeTruthy());

    const mockMessage = {
      payload: {
        id: 1,
        name: "Test Game",
        player_amount: 3,
        status: "in game",
        host_id: 1,
        player_turn: 0,
        players: [
            { id: 1, name: "Jug 1" },
            { id: 2, name: "Jug 2" },
            { id: 3, name: "Jug 3" },
        ],
      }
    };

    act(() => {
      server.send(JSON.stringify(mockMessage));
    });

    // verify that the player's own cards are not displayed
    expect(screen.queryByText("Jug 1")).toBeInTheDocument();
    
    // verify that the cards of the rest are displayed
    expect(screen.getByText("Jug 2")).toBeInTheDocument();
    expect(screen.getByText("Jug 3")).toBeInTheDocument();

    act(() => {
      server.close();
    });

  });

  it("should highlight only the cards of the player in turn", async () => {
    const server = new WS(`${BASE_URL_WS}/games/1`);

    render(
      <ToastProvider>
        <BrowserRouter>
          <GameProvider>
            <GameContainer />
          </GameProvider>
        </BrowserRouter>
      </ToastProvider>
    );

    await waitFor(() => expect(server.connected).toBeTruthy());

    const mockMessage = {
      payload: {
        id: 1,
        name: "Test Game 4",
        player_amount: 4,
        status: "in game",
        host_id: 1,
        player_turn: 1,
        players: [
            { id: 1, name: "Jug 1" },
            { id: 2, name: "Jug 2" },
            { id: 3, name: "Jug 3" },
            { id: 4, name: "Jug 4" },
        ],
      }
    };

    act(() => {
      server.send(JSON.stringify(mockMessage));
    });

    // verify that the card of the player in turn (jug 2) is highlighted
    const playerCardInTurn = screen.getByTestId("2-player-info");
    expect(playerCardInTurn).toHaveStyle("background-color: rgb(255, 255, 255)"); // highlighted background

    // verify that the card of the players not in turn (jug 3, jug 4) is not highlighted
    const playerCardNotInTurn3 = screen.getByTestId("3-player-info");
    expect(playerCardNotInTurn3).toHaveStyle("background-color: rgba(0, 0, 0, 0)"); 
    const playerCardNotInTurn4 = screen.getByTestId("4-player-info");
    expect(playerCardNotInTurn4).toHaveStyle("background-color: rgba(0, 0, 0, 0)"); 

    // notice that "jug 1" is not highlighted because his cards are not shown

    act(() => {
      server.close();
    });

  });

  it("should render the name of the game and the other players when the game is 'in game'", async () => {
    const server = new WS(`${BASE_URL_WS}/games/1`);

    render(
      <ToastProvider>
        <BrowserRouter>
          <GameProvider>
            <GameContainer />
          </GameProvider>
        </BrowserRouter>
      </ToastProvider>
    );

    await waitFor(() => expect(server.connected).toBeTruthy());

    const mockMessage = {
      payload: {
        id: 1,
        name: "Partida nueva",
        player_amount: 4,
        status: "in game",
        host_id: 1,
        player_turn: 1,
        players: [
            { id: 1, name: "Jug 1" },
            { id: 2, name: "Jug 2" },
            { id: 3, name: "Jug 3" },
            { id: 4, name: "Jug 4" },
        ],
      }
    };

    act(() => {
      server.send(JSON.stringify(mockMessage));
    });

    const gameNameElement = screen.getByText("Partida: Partida nueva");
 
    await waitFor(() => {
      expect(gameNameElement).toBeInTheDocument();
      expect(screen.getByText("Jug 2")).toBeInTheDocument();
      expect(screen.getByText("Jug 3")).toBeInTheDocument();
      expect(screen.getByText("Jug 4")).toBeInTheDocument();
    }); 

    act(() => {
      server.close();
    });

  });

  it("should render the name of the game and the game info when the game is 'waiting'", async () => {
    const server = new WS(`${BASE_URL_WS}/games/1`);

    render(
      <ToastProvider>
        <BrowserRouter>
          <GameProvider>
            <GameContainer />
          </GameProvider>
        </BrowserRouter>
      </ToastProvider>
    );

    await waitFor(() => expect(server.connected).toBeTruthy());

    const mockMessage = {
      payload: {
        id: 1,
        name: "Partida nueva",
        player_amount: 4,
        status: "waiting",
        host_id: 1,
        player_turn: 1,
        players: [
            { id: 1, name: "Jug 1" },
            { id: 2, name: "Jug 2" },
            { id: 3, name: "Jug 3" },
        ],
      }
    };

    act(() => {
      server.send(JSON.stringify(mockMessage));
    });

    const gameNameElement = screen.getByText("Partida: Partida nueva");
 
    await waitFor(() => {
      expect(gameNameElement).toBeInTheDocument();
      expect(screen.getByText("Cant. de jugadores:")).toBeInTheDocument();
      expect(screen.getByText("3/4")).toBeInTheDocument();
      expect(screen.getByText("Jugadores:")).toBeInTheDocument();
      expect(screen.getByText("Jug 1 , Jug 2 , Jug 3")).toBeInTheDocument();
    }); 

    act(() => {
      server.close();
    });

  });
  
});