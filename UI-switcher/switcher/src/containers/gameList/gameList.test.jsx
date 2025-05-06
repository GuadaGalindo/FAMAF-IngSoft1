import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { describe, beforeEach, it, expect, vi, afterEach } from "vitest";
import { BrowserRouter } from "react-router-dom";
import WS from "vitest-websocket-mock";
import { GameList } from "./gameList";
import { act } from "react";
import { ToastProvider } from "../../context/toast-context";
import useFetch from "use-http";
import { BASE_URL_WS } from "../../config";

// create useNavigate simulation
const mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate, // simulated function
  };
});

vi.mock("use-http", () => ({
  default: vi.fn(() => ({
    put: vi.fn(),
    response: { ok: true },
  })),
}));

const mockInitialData = {
  type: "initial game list",
  payload: [
    {
      id: 1,
      name: "Game 1",
      status: "waiting",
      players: [
        { id: 1, name: "Player 1" },
        { id: 2, name: "Player 2" },
      ],
      player_amount: 4,
    },
    { id: 2, name: "Game 2", status: "waiting", players: [], player_amount: 3 },
  ],
};

// mock console.error to suppress error messages during tests
vi.spyOn(console, "error").mockImplementation(() => {});

describe("GameList test", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    WS.clean();
    sessionStorage.setItem("token", "123");
  });

  afterEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
  });

  it("should handle initial game list", async () => {
    const server = new WS(`${BASE_URL_WS}/games`);

    render(
      <ToastProvider>
        <BrowserRouter>
          <GameList />
        </BrowserRouter>
      </ToastProvider>
    );

    expect(screen.getByText("Listado de partidas")).toBeInTheDocument();
    expect(screen.getByText("Cargando...")).toBeInTheDocument();
    const createButton = screen.getByRole("button", { name: "Crear partida" });
    expect(createButton).toBeInTheDocument();

    await waitFor(() => expect(server.connected).toBeTruthy());

    const mockLastMessage = JSON.stringify(mockInitialData);

    act(() => {
      server.send(mockLastMessage);
    });

    await waitFor(() => {
      expect(screen.getByText("Game 1")).toBeInTheDocument();
      expect(screen.getByText("Jugadores: 2/4")).toBeInTheDocument();

      expect(screen.getByText("Game 2")).toBeInTheDocument();
      expect(screen.getByText("Jugadores: 0/3")).toBeInTheDocument();

      expect(screen.getByText("Listado de partidas")).toBeInTheDocument();
      expect(createButton).toBeInTheDocument();
      expect(
        screen.queryByText("En este momento no hay partidas disponibles")
      ).not.toBeInTheDocument();
      expect(screen.queryByText("¡Crea una!")).not.toBeInTheDocument();
    });
  });

  it("should display available games and handle game added messages", async () => {
    const server = new WS(`${BASE_URL_WS}/games`);

    render(
      <ToastProvider>
        <BrowserRouter>
          <GameList />
        </BrowserRouter>
      </ToastProvider>
    );

    // wait for the websocket server to be connected
    await waitFor(() => expect(server.connected).toBeTruthy());

    // message simulation
    const mockMessage = JSON.stringify({
      type: "game added",
      payload: {
        id: 1,
        name: "Test Game",
        player_amount: 4,
        players: [{ id: 1, name: "Player 1" }],
      },
    });

    // send simulated message to the server
    act(() => {
      server.send(mockMessage);
    });

    //wait for the new game to appear in the list
    await waitFor(() => {
      expect(screen.getByText("Test Game")).toBeInTheDocument();
    });

    // clear the server
    act(() => {
      server.close();
    });
  });

  it("should update the number of players when a player is added", async () => {
    const server = new WS(`${BASE_URL_WS}/games`);

    render(
      <ToastProvider>
        <BrowserRouter>
          <GameList />
        </BrowserRouter>
      </ToastProvider>
    );

    await waitFor(() => expect(server.connected).toBeTruthy());

    // add a game
    const addMessage = JSON.stringify({
      type: "game added",
      payload: {
        id: 1,
        name: "Test Game",
        player_amount: 4,
        players: [{ id: 1, name: "Player 1" }],
      },
    });

    act(() => {
      server.send(addMessage);
    });

    await waitFor(() => {
      expect(screen.getByText("Test Game")).toBeInTheDocument();
      expect(screen.getByText("Jugadores: 1/4")).toBeInTheDocument();
    });

    // add a player
    const updatePlayersMessage = JSON.stringify({
      type: "game updated",
      payload: {
        id: 1,
        name: "Test Game",
        status: "waiting",
        player_amount: 4,
        players: [
          { id: 1, name: "Player 1" },
          { id: 2, name: "Player 2" }, // new player
        ],
      },
    });

    act(() => {
      server.send(updatePlayersMessage);
    });

    // verify that the number of players is updated on the screen
    await waitFor(() => {
      expect(screen.getByText("Test Game")).toBeInTheDocument();
      expect(screen.getByText("Jugadores: 2/4")).toBeInTheDocument();
    });

    act(() => {
      server.close();
    });
  });

  it("should add again a game that had this path: waiting -> full -> waiting", async () => {
    const server = new WS(`${BASE_URL_WS}/games`);

    render(
      <ToastProvider>
        <BrowserRouter>
          <GameList />
        </BrowserRouter>
      </ToastProvider>
    );

    await waitFor(() => expect(server.connected).toBeTruthy());

    // add a game
    let lastMessage = JSON.stringify({
      type: "game added",
      payload: {
        id: 1,
        name: "Test Game",
        status: "waiting",
        player_amount: 4,
        players: [{ id: 1, name: "Player 1" }],
      },
    });

    act(() => {
      server.send(lastMessage);
    });

    await waitFor(() => {
      expect(screen.getByText("Test Game")).toBeInTheDocument();
      expect(screen.getByText("Jugadores: 1/4")).toBeInTheDocument();
    });

    // add a player
    lastMessage = JSON.stringify({
      type: "game updated",
      payload: {
        id: 1,
        name: "Test Game",
        status: "full",
        player_amount: 4,
        players: [
          { id: 1, name: "Player 1" },
          { id: 2, name: "Player 2" }, // new player
        ],
      },
    });

    act(() => {
      server.send(lastMessage);
    });

    // verify that the number of players is updated on the screen
    await waitFor(() => {
      expect(screen.queryByText("Test Game")).not.toBeInTheDocument();
      expect(screen.queryByText("Jugadores: 2/4")).not.toBeInTheDocument();
    });

    lastMessage = JSON.stringify({
      type: "game updated",
      payload: {
        id: 1,
        name: "Test Game",
        status: "waiting",
        player_amount: 4,
        players: [{ id: 1, name: "Player 1" }],
      },
    });

    act(() => {
      server.send(lastMessage);
    });

    // verify that the number of players is updated on the screen
    await waitFor(() => {
      expect(screen.getByText("Test Game")).toBeInTheDocument();
      expect(screen.getByText("Jugadores: 1/4")).toBeInTheDocument();
    });

    act(() => {
      server.close();
    });
  });

  it("should not show a game that had this path: waiting -> in game -> finished", async () => {
    const server = new WS(`${BASE_URL_WS}/games`);

    render(
      <ToastProvider>
        <BrowserRouter>
          <GameList />
        </BrowserRouter>
      </ToastProvider>
    );

    await waitFor(() => expect(server.connected).toBeTruthy());

    // add a game
    let lastMessage = JSON.stringify({
      type: "game added",
      payload: {
        id: 1,
        name: "Test Game",
        status: "waiting",
        player_amount: 4,
        players: [{ id: 1, name: "Player 1" }],
      },
    });

    act(() => {
      server.send(lastMessage);
    });

    await waitFor(() => {
      expect(screen.getByText("Test Game")).toBeInTheDocument();
      expect(screen.getByText("Jugadores: 1/4")).toBeInTheDocument();
    });

    // add a player
    lastMessage = JSON.stringify({
      type: "game updated",
      payload: {
        id: 1,
        name: "Test Game",
        status: "in game",
        player_amount: 4,
        players: [
          { id: 1, name: "Player 1" },
          { id: 2, name: "Player 2" }, // new player
        ],
      },
    });

    act(() => {
      server.send(lastMessage);
    });

    // verify that the number of players is updated on the screen
    await waitFor(() => {
      expect(screen.queryByText("Test Game")).not.toBeInTheDocument();
      expect(screen.queryByText("Jugadores: 2/4")).not.toBeInTheDocument();
    });

    lastMessage = JSON.stringify({
      type: "game updated",
      payload: {
        id: 1,
        name: "Test Game",
        status: "finished",
        player_amount: 4,
        players: [{ id: 1, name: "Player 1" }],
      },
    });

    act(() => {
      server.send(lastMessage);
    });

    // verify that the number of players is updated on the screen
    await waitFor(() => {
      expect(screen.queryByText("Test Game")).not.toBeInTheDocument();
      expect(screen.queryByText("Jugadores: 1/4")).not.toBeInTheDocument();
    });

    act(() => {
      server.close();
    });
  });

  it("should remove the game when a full update is received", async () => {
    const server = new WS(`${BASE_URL_WS}/games`);

    render(
      <ToastProvider>
        <BrowserRouter>
          <GameList />
        </BrowserRouter>
      </ToastProvider>
    );

    await waitFor(() => expect(server.connected).toBeTruthy());

    const mockLastMessage = JSON.stringify(mockInitialData);

    act(() => {
      server.send(mockLastMessage);
    });

    const lastMessage = JSON.stringify({
      type: "game updated",
      payload: {
        id: 1,
        status: "full",
        name: "Game 1",
        player_amount: 4,
        players: [],
      },
    });

    act(() => {
      server.send(lastMessage);
    });

    await waitFor(() =>
      expect(screen.queryByText("Game 1")).not.toBeInTheDocument()
    );

    act(() => {
      server.close();
    });
  });

  it("should remove the game when a in game update is received", async () => {
    const server = new WS(`${BASE_URL_WS}/games`);

    render(
      <ToastProvider>
        <BrowserRouter>
          <GameList />
        </BrowserRouter>
      </ToastProvider>
    );

    await waitFor(() => expect(server.connected).toBeTruthy());

    const mockLastMessage = JSON.stringify(mockInitialData);

    act(() => {
      server.send(mockLastMessage);
    });

    const lastMessage = JSON.stringify({
      type: "game updated",
      payload: {
        id: 1,
        status: "in game",
        name: "Game 1",
        player_amount: 4,
        players: [],
      },
    });

    act(() => {
      server.send(lastMessage);
    });

    await waitFor(() =>
      expect(screen.queryByText("Game 1")).not.toBeInTheDocument()
    );

    act(() => {
      server.close();
    });
  });

  it("should call joinGame and redirect to the lobby game page when the join button is clicked", async () => {
    const server = new WS(`${BASE_URL_WS}/games`);

    const mockPut = vi.fn().mockResolvedValue([]);

    useFetch.mockReturnValue({
      put: mockPut,
      response: { ok: true },
    });

    render(
      <ToastProvider>
        <BrowserRouter>
          <GameList />
        </BrowserRouter>
      </ToastProvider>
    );

    await waitFor(() => expect(server.connected).toBeTruthy());

    const mockLastMessage = JSON.stringify(mockInitialData);

    act(() => {
      server.send(mockLastMessage);
    });

    await waitFor(() => {
      const joinButton = screen.getAllByText("Unirse")[0];

      act(() => {
        // click on "Unirme" button simulation
        fireEvent.click(joinButton);
      });
    });

    // verify that the joinGame function has been called
    expect(mockPut).toHaveBeenCalledWith("/games/1/join");

    // verify that navigate to the game lobby
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/games/1");
    });
  });

  it("should display the 'Crear Partida' modal when button is clicked", async () => {
    render(
      <ToastProvider>
        <BrowserRouter>
          <GameList />
        </BrowserRouter>
      </ToastProvider>
    );

    const createButton = screen.getByText("Crear partida");

    act(() => {
      fireEvent.click(createButton);
    });

    // verify that the modal has been rendered
    expect(screen.getByText("Crear Partida")).toBeInTheDocument();
    expect(screen.getByText("Cancelar")).toBeInTheDocument();
  });

  it("should show 'Cargando...' when WebSocket is in CONNECTING state", async () => {
    const server = new WS(`${BASE_URL_WS}/games`);

    render(
      <ToastProvider>
        <BrowserRouter>
          <GameList />
        </BrowserRouter>
      </ToastProvider>
    );

    await waitFor(() => {
      expect(server.connected).toBeTruthy();
      expect(screen.getByText("Cargando...")).toBeInTheDocument();
      expect(
        screen.queryByText("No hay partidas disponibles")
      ).not.toBeInTheDocument();
    });
  });

  it("should show not show 'No tienes conexión' or 'Vuelve a intentarlo más tarde' when WebSocket is in OPEN state", async () => {
    const server = new WS(`${BASE_URL_WS}/games`);

    render(
      <ToastProvider>
        <BrowserRouter>
          <GameList />
        </BrowserRouter>
      </ToastProvider>
    );

    await waitFor(() => {
      expect(server.connected).toBeTruthy();

      expect(screen.queryByText("No tienes conexión.")).not.toBeInTheDocument();
      expect(
        screen.queryByText("Vuelve a intentarlo más tarde.")
      ).not.toBeInTheDocument();
    });
  });

  it("should show 'No tienes conexión' and not show 'Vuelve a intentarlo más tarde' or 'No hay partidas disponibles' when WebSocket is in CLOSED state", async () => {
    const server = new WS(`${BASE_URL_WS}/games`);

    render(
      <ToastProvider>
        <BrowserRouter>
          <GameList />
        </BrowserRouter>
      </ToastProvider>
    );

    act(() => {
      server.close();
    });

    await waitFor(() => {
      expect(server.closed).toBeTruthy();

      expect(screen.getByText("No tienes conexión.")).toBeInTheDocument();

      expect(
        screen.queryByText("Vuelve a intentarlo más tarde.")
      ).not.toBeInTheDocument();
      expect(
        screen.queryByText("No hay partidas disponibles")
      ).not.toBeInTheDocument();
    });
  });

  it("should not show game list after disconnection from WebSocket", async () => {
    const server = new WS(`${BASE_URL_WS}/games`);

    render(
      <ToastProvider>
        <BrowserRouter>
          <GameList />
        </BrowserRouter>
      </ToastProvider>
    );

    await waitFor(() => expect(server.connected).toBeTruthy());

    const mockLastMessage = JSON.stringify(mockInitialData);

    act(() => {
      server.send(mockLastMessage);
    });

    act(() => {
      server.close();
    });

    await waitFor(() => {
      expect(server.closed).toBeTruthy();

      expect(screen.getByText("No tienes conexión.")).toBeInTheDocument();

      expect(
        screen.queryByText("Vuelve a intentarlo más tarde.")
      ).not.toBeInTheDocument();
      expect(
        screen.queryByText("No hay partidas disponibles")
      ).not.toBeInTheDocument();
      expect(screen.queryByText("Game 1")).not.toBeInTheDocument();
      expect(screen.queryByText("Game 2")).not.toBeInTheDocument();
    });
  });
});
