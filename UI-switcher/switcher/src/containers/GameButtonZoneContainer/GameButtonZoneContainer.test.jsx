import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import WS from "vitest-websocket-mock";
import { act } from "react";
import GameProvider from "../../context/game-data-context";
import { BrowserRouter } from "react-router-dom";
import GameButtonZoneContainer from "./GameButtonZoneContainer";
import useGame from "../../hooks/useGame";
import useFetch from "use-http";
import { ToastProvider } from "../../context/toast-context";

const mockNavigate = vi.fn();
vi.mock(import("react-router-dom"), async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock("../../hooks/useGame", () => ({
  default: vi.fn(),
}));

vi.mock("use-http", () => ({
  default: vi.fn(() => ({
    put: vi.fn(),
    response: { ok: true },
  })),
}));

describe("GameContainer buttons test", () => {
  beforeEach(() => {
    WS.clean();
    sessionStorage.setItem("token", "123");
    sessionStorage.setItem("id", "1");
  });

  it("should display 'Iniciar partida' not enabled button when game is waiting and player is host", async () => {
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

    render(
      <BrowserRouter>
        <GameProvider>
          <GameButtonZoneContainer />
        </GameProvider>
      </BrowserRouter>
    );

    const startButton = screen.getByRole("button", { name: "Iniciar partida" });

    await waitFor(() => {
      expect(startButton).toBeInTheDocument();
      expect(startButton).not.toBeEnabled();
    });
  });

  it("should display 'Iniciar partida' button enabled when game is full and player is host", async () => {
    const mockGame = {
      id: 1,
      name: "Test Game",
      host_id: 1,
      status: "full",
      players: [{ id: 1, name: "Player 1" }],
      player_amount: 4,
    };

    useGame.mockReturnValue({
      game: mockGame,
    });

    render(
      <BrowserRouter>
        <GameProvider>
          <GameButtonZoneContainer />
        </GameProvider>
      </BrowserRouter>
    );

    const startButton = screen.getByRole("button", { name: "Iniciar partida" });

    await waitFor(() => {
      expect(startButton).toBeInTheDocument();
      expect(startButton).toBeEnabled();
    });
  });

  it("should not display 'Iniciar partida' button when game is in game", async () => {
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

    render(
      <BrowserRouter>
        <GameProvider>
          <GameButtonZoneContainer />
        </GameProvider>
      </BrowserRouter>
    );

    const startButton = screen.queryByRole("button", {
      name: "Iniciar partida",
    });

    await waitFor(() => {
      expect(startButton).not.toBeInTheDocument();
    });
  });

  it("should not display 'Iniciar partida' button when player isnt host", async () => {
    const mockGame = {
      id: 1,
      name: "Test Game",
      host_id: 2,
      status: "waiting",
      players: [{ id: 1, name: "Player 1" }],
      player_amount: 4,
    };

    useGame.mockReturnValue({
      game: mockGame,
    });

    render(
      <BrowserRouter>
        <GameProvider>
          <GameButtonZoneContainer />
        </GameProvider>
      </BrowserRouter>
    );

    const startButton = screen.queryByRole("button", {
      name: "Iniciar partida",
    });

    await waitFor(() => {
      expect(startButton).not.toBeInTheDocument();
    });
  });

  it("should display 'Abandonar' button when game is in game", async () => {
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

    render(
      <BrowserRouter>
        <GameProvider>
          <GameButtonZoneContainer />
        </GameProvider>
      </BrowserRouter>
    );

    const quitButton = screen.getByRole("button", { name: "Abandonar" });

    await waitFor(() => {
      expect(quitButton).toBeInTheDocument();
      expect(quitButton).toBeEnabled();
    });
  });

  it("should display 'Abandonar' button when game isnt in game and player isnt host", async () => {
    const mockGame = {
      id: 1,
      name: "Test Game",
      host_id: 2,
      status: "waiting",
      players: [{ id: 1, name: "Player 1" }],
      player_amount: 4,
    };

    useGame.mockReturnValue({
      game: mockGame,
    });

    render(
      <BrowserRouter>
        <GameProvider>
          <GameButtonZoneContainer />
        </GameProvider>
      </BrowserRouter>
    );

    const quitButton = screen.getByRole("button", { name: "Abandonar" });

    await waitFor(() => {
      expect(quitButton).toBeInTheDocument();
      expect(quitButton).toBeEnabled();
    });
  });

  it("should not display 'Abandonar' button when game isnt in game and player is host", async () => {
    const mockGame = {
      id: 1,
      name: "Test Game",
      host_id: 1,
      status: "full",
      players: [{ id: 1, name: "Player 1" }],
      player_amount: 4,
    };

    useGame.mockReturnValue({
      game: mockGame,
    });

    render(
      <BrowserRouter>
        <GameProvider>
          <GameButtonZoneContainer />
        </GameProvider>
      </BrowserRouter>
    );

    const quitButton = screen.queryByRole("button", { name: "Abandonar" });

    await waitFor(() => {
      expect(quitButton).not.toBeInTheDocument();
    });
  });

  it("should call abandonGame and redirect to the lobby game page when the 'Abandonar' button is clicked on successful fetch", async () => {
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

    const mockPut = vi.fn().mockResolvedValue({});

    const mockResponse = {
      ok: true,
    };

    useFetch.mockReturnValue({
      put: mockPut,
      response: mockResponse,
    });

    render(
      <BrowserRouter>
        <GameProvider>
          <GameButtonZoneContainer />
        </GameProvider>
      </BrowserRouter>
    );

    const quitButton = screen.getByText("Abandonar");

    act(() => {
      fireEvent.click(quitButton);
    });

    expect(mockPut).toBeCalledWith("/games/1/quit");

    await waitFor(() => {
      expect(mockNavigate).toBeCalledWith("/games");
    });
  });

  it("should call abandonGame and show an error message when the 'Abandonar' button is clicked on unsuccessful fetch", async () => {
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

    const mockPut = vi.fn().mockResolvedValue({});

    const mockResponse = {
      ok: false,
    };

    useFetch.mockReturnValue({
      put: mockPut,
      response: mockResponse,
    });

    render(
      <ToastProvider>
        <GameButtonZoneContainer />
      </ToastProvider>
    );

    const quitButton = screen.getByText("Abandonar");

    act(() => {
      fireEvent.click(quitButton);
    });

    expect(mockPut).toBeCalledWith("/games/1/quit");

    await waitFor(() => {
      expect(
        screen.getByText("Error al abandonar la partida")
      ).toBeInTheDocument();
    });
  });

  it("should call startGame with successful fetch", async () => {
    const mockGame = {
      id: 1,
      name: "Test Game",
      host_id: 1,
      status: "full",
      players: [{ id: 1, name: "Player 1" }],
      player_amount: 4,
    };

    useGame.mockReturnValue({
      game: mockGame,
    });

    const mockPut = vi.fn().mockResolvedValue({});

    const mockResponse = {
      ok: true,
    };

    useFetch.mockReturnValue({
      put: mockPut,
      response: mockResponse,
    });

    render(
      <ToastProvider>
        <GameButtonZoneContainer />
      </ToastProvider>
    );

    const startButton = screen.getByText("Iniciar partida");

    act(() => {
      fireEvent.click(startButton);
    });

    expect(mockPut).toBeCalledWith("/games/1/start");
  });

  it("should call startGame with unsuccessful fetch", async () => {
    const mockGame = {
      id: 1,
      name: "Test Game",
      host_id: 1,
      status: "full",
      players: [{ id: 1, name: "Player 1" }],
      player_amount: 4,
    };

    useGame.mockReturnValue({
      game: mockGame,
    });

    const mockPut = vi.fn().mockResolvedValue({});

    const mockResponse = {
      ok: false,
    };

    useFetch.mockReturnValue({
      put: mockPut,
      response: mockResponse,
    });

    render(
      <ToastProvider>
        <GameButtonZoneContainer />
      </ToastProvider>
    );

    const startButton = screen.getByText("Iniciar partida");

    act(() => {
      fireEvent.click(startButton);
    });

    expect(mockPut).toBeCalledWith("/games/1/start");

    await waitFor(() => {
      expect(
        screen.getByText("Error al iniciar la partida")
      ).toBeInTheDocument();
    });
  });

  it("should display 'Pasar turno' button when it's the player's turn and game is in game", async () => {
    const mockGame = {
      id: 1,
      name: "Test Game",
      host_id: 1,
      status: "in game",
      players: [
        { id: 1, name: "Player 1" },
        { id: 2, name: "Player 2" },
      ],
      player_turn: 0,
      player_amount: 2,
    };

    useGame.mockReturnValue({
      game: mockGame,
    });

    render(
      <BrowserRouter>
        <GameProvider>
          <GameButtonZoneContainer />
        </GameProvider>
      </BrowserRouter>
    );

    await waitFor(() => {
      const skipTurnButton = screen.getByRole("button", {
        name: "Pasar turno",
      });
      expect(skipTurnButton).toBeInTheDocument();
      expect(skipTurnButton).toBeEnabled();
    });
  });

  it("should display a disabled 'Pasar turno' button when it's not the player's turn", async () => {
    const mockGame = {
      id: 1,
      name: "Test Game",
      host_id: 1,
      status: "in game",
      players: [
        { id: 1, name: "Player 1" },
        { id: 2, name: "Player 2" },
      ],
      player_turn: 1, // No es el turno del jugador 1
      player_amount: 2,
    };

    useGame.mockReturnValue({
      game: mockGame,
    });

    render(
      <BrowserRouter>
        <GameProvider>
          <GameButtonZoneContainer />
        </GameProvider>
      </BrowserRouter>
    );

    await waitFor(() => {
      const skipTurnButton = screen.getByRole("button", {
        name: "Pasar turno",
      });
      expect(skipTurnButton).toBeInTheDocument();
      expect(skipTurnButton).toBeDisabled();
    });
  });

  it("should call skipTurn with successful fetch", async () => {
    const mockGame = {
      id: 1,
      name: "Test Game",
      host_id: 1,
      status: "in game",
      players: [{ id: 1, name: "Player 1" }],
      player_turn: 0,
      player_amount: 4,
    };

    useGame.mockReturnValue({
      game: mockGame,
    });

    const mockPut = vi.fn().mockResolvedValue({});

    const mockResponse = {
      ok: true,
    };

    useFetch.mockReturnValue({
      put: mockPut,
      response: mockResponse,
    });

    render(
      <ToastProvider>
        <GameButtonZoneContainer />
      </ToastProvider>
    );

    const skipTurnButton = screen.getByText("Pasar turno");

    act(() => {
      fireEvent.click(skipTurnButton);
    });

    expect(mockPut).toBeCalledWith("/games/1/finish-turn");
  });

  it("should call skipTurn with unsuccessful fetch", async () => {
    const mockGame = {
      id: 1,
      name: "Test Game",
      host_id: 1,
      status: "in game",
      players: [{ id: 1, name: "Player 1" }],
      player_turn: 0,
      player_amount: 4,
    };

    useGame.mockReturnValue({
      game: mockGame,
    });

    const mockPut = vi.fn().mockResolvedValue({});

    const mockResponse = {
      ok: false,
    };

    useFetch.mockReturnValue({
      put: mockPut,
      response: mockResponse,
    });

    render(
      <ToastProvider>
        <GameButtonZoneContainer />
      </ToastProvider>
    );

    const skipTurnButton = screen.getByText("Pasar turno");

    act(() => {
      fireEvent.click(skipTurnButton);
    });

    expect(mockPut).toBeCalledWith("/games/1/finish-turn");

    await waitFor(() => {
      expect(screen.getByText("Error al pasar de turno")).toBeInTheDocument();
    });
  });

  it("should not display 'Pasar turno' button when the game is not in game", async () => {
    const mockGame = {
      id: 1,
      name: "Test Game",
      host_id: 1,
      status: "waiting",
      players: [
        { id: 1, name: "Player 1" },
        { id: 2, name: "Player 2" },
      ],
      player_turn: 0,
      player_amount: 2,
    };

    useGame.mockReturnValue({
      game: mockGame,
    });

    render(
      <BrowserRouter>
        <GameProvider>
          <GameButtonZoneContainer />
        </GameProvider>
      </BrowserRouter>
    );

    await waitFor(() => {
      const skipTurnButton = screen.queryByRole("button", {
        name: "Pasar turno",
      });
      expect(skipTurnButton).not.toBeInTheDocument();
    });
  });

  it("should call Cancelar movimiento with successful fetch", async () => {
    const mockGame = {
      id: 1,
      name: "Test Game",
      host_id: 1,
      status: "in game",
      players: [{ id: 1, name: "Player 1" }],
      player_turn: 0,
      player_amount: 4,
    };

    useGame.mockReturnValue({
      game: mockGame,
    });

    const mockPut = vi.fn().mockResolvedValue({});

    const mockResponse = {
      ok: true,
    };

    useFetch.mockReturnValue({
      put: mockPut,
      response: mockResponse,
    });

    render(
      <ToastProvider>
        <GameButtonZoneContainer />
      </ToastProvider>
    );

    const cancelButton = screen.getByText("Cancelar movimiento");

    act(() => {
      fireEvent.click(cancelButton);
    });

    expect(mockPut).toBeCalledWith("/games/1/movement/back");
  });

  it("should call Cancelar movimiento with unsuccessful fetch", async () => {
    const mockGame = {
      id: 1,
      name: "Test Game",
      host_id: 1,
      status: "in game",
      players: [{ id: 1, name: "Player 1" }],
      player_turn: 0,
      player_amount: 4,
    };

    useGame.mockReturnValue({
      game: mockGame,
    });

    const mockPut = vi.fn().mockResolvedValue({});

    const mockResponse = {
      ok: false,
    };

    useFetch.mockReturnValue({
      put: mockPut,
      response: mockResponse,
    });

    render(
      <ToastProvider>
        <GameButtonZoneContainer />
      </ToastProvider>
    );

    const cancelButton = screen.getByText("Cancelar movimiento");

    act(() => {
      fireEvent.click(cancelButton);
    });

    expect(mockPut).toBeCalledWith("/games/1/movement/back");

    await waitFor(() => {
      expect(
        screen.getByText("No hay movimientos para cancelar")
      ).toBeInTheDocument();
    });
  });

  it("should display 'Cancelar movimiento' button when it's the player's turn and game is in game", async () => {
    const mockGame = {
      id: 1,
      name: "Test Game",
      host_id: 1,
      status: "in game",
      players: [
        { id: 1, name: "Player 1" },
        { id: 2, name: "Player 2" },
      ],
      player_turn: 0,
      player_amount: 2,
    };

    useGame.mockReturnValue({
      game: mockGame,
    });

    render(
      <BrowserRouter>
        <GameProvider>
          <GameButtonZoneContainer />
        </GameProvider>
      </BrowserRouter>
    );

    await waitFor(() => {
      const cancelMovementButton = screen.getByRole("button", {
        name: "Cancelar movimiento",
      });
      expect(cancelMovementButton).toBeInTheDocument();
      expect(cancelMovementButton).toBeEnabled();
    });
  });

  it("should display a disabled 'Cancelar Movimiento' button when it's not the player's turn", async () => {
    const mockGame = {
      id: 1,
      name: "Test Game",
      host_id: 1,
      status: "in game",
      players: [
        { id: 1, name: "Player 1" },
        { id: 2, name: "Player 2" },
      ],
      player_turn: 1, // No es el turno del jugador 1
      player_amount: 2,
    };

    useGame.mockReturnValue({
      game: mockGame,
    });

    render(
      <BrowserRouter>
        <GameProvider>
          <GameButtonZoneContainer />
        </GameProvider>
      </BrowserRouter>
    );

    await waitFor(() => {
      const cancelMovementButton = screen.getByRole("button", {
        name: "Cancelar movimiento",
      });
      expect(cancelMovementButton).toBeInTheDocument();
      expect(cancelMovementButton).toBeDisabled();
    });
  });

  it("should not display 'Cancelar movimiento' button when the game is not in game", async () => {
    const mockGame = {
      id: 1,
      name: "Test Game",
      host_id: 1,
      status: "waiting",
      players: [
        { id: 1, name: "Player 1" },
        { id: 2, name: "Player 2" },
      ],
      player_turn: 0,
      player_amount: 2,
    };

    useGame.mockReturnValue({
      game: mockGame,
    });

    render(
      <BrowserRouter>
        <GameProvider>
          <GameButtonZoneContainer />
        </GameProvider>
      </BrowserRouter>
    );

    await waitFor(() => {
      const cancelMovementButton = screen.queryByRole("button", {
        name: "Cancelar movimiento",
      });
      expect(cancelMovementButton).not.toBeInTheDocument();
    });
  });
});
