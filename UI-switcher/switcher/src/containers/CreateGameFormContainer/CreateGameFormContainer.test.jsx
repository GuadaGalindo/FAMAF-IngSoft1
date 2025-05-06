import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import useFetch from "use-http";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import CreateGameFormContainer from "./CreateGameFormContainer";

const mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate, // simulated function
  };
});

vi.mock("use-http", () => ({
  default: vi.fn(),
}));

describe("CreateGameContainerForm tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.setItem("token", "123");
  });

  afterEach(() => {
    sessionStorage.clear();
    vi.clearAllMocks();
  });

  it("should navigate to /games/id on successful fetch when clicked on button 'Crear partida'", async () => {
    const mockPost = vi.fn().mockResolvedValue({ id: 1 });

    useFetch.mockReturnValue({
      post: mockPost,
      response: { ok: true },
    });

    const gameData = {
      name: "NombreValido",
      player_amount: "2",
      token: "123",
    };

    render(
      <MemoryRouter>
        <CreateGameFormContainer />
      </MemoryRouter>
    );

    const input = screen.getByPlaceholderText(
      "Ingrese el nombre de la partida"
    );
    fireEvent.change(input, { target: { value: "NombreValido" } });

    const select = screen.getByTestId("select");
    fireEvent.change(select, { target: { value: "2" } });

    const createGameButton = screen.getByText("Crear partida");
    fireEvent.click(createGameButton);

    expect(mockPost).toBeCalledWith("/games/", gameData);

    await waitFor(() => {
      expect(mockNavigate).toBeCalledWith("/games/1");
    });
  });

  it("should show an error message on unsuccessful fetch when clicked on button 'Crear partida'", async () => {
    const mockPost = vi.fn().mockResolvedValue({ id: 1 });

    useFetch.mockReturnValue({
      post: mockPost,
      response: { ok: false },
    });

    const gameData = {
      name: "NombreValido",
      player_amount: "2",
      token: "123",
    };

    render(
      <MemoryRouter>
        <CreateGameFormContainer />
      </MemoryRouter>
    );

    const input = screen.getByPlaceholderText(
      "Ingrese el nombre de la partida"
    );
    fireEvent.change(input, { target: { value: "NombreValido" } });

    const select = screen.getByTestId("select");
    fireEvent.change(select, { target: { value: "2" } });

    const createGameButton = screen.getByText("Crear partida");
    fireEvent.click(createGameButton);

    expect(mockPost).toBeCalledWith("/games/", gameData);

    await waitFor(() => {
      expect(
        screen.getByText("No es posible crear la partida en este momento")
      ).toBeInTheDocument();
    });
  });

  it("should show an error message on successful fetch when clicked on button 'Crear partida' but there are errors on any inputs", () => {
    render(
      <MemoryRouter>
        <CreateGameFormContainer />
      </MemoryRouter>
    );

    const input = screen.getByPlaceholderText(
      "Ingrese el nombre de la partida"
    );
    fireEvent.change(input, { target: { value: "NombreInvalido%%$$" } });

    const select = screen.getByTestId("select");
    fireEvent.change(select, { target: { value: "2" } });

    const createGameButton = screen.getByText("Crear partida");
    fireEvent.click(createGameButton);

    expect(
      screen.getByText("Corrige los errores antes de continuar")
    ).toBeInTheDocument();
  });

  it("should clear error message when input changes", () => {
    render(
      <MemoryRouter>
        <CreateGameFormContainer />
      </MemoryRouter>
    );

    const input = screen.getByPlaceholderText(
      "Ingrese el nombre de la partida"
    );
    fireEvent.change(input, { target: { value: "NombreInvalido%%$$" } });

    const select = screen.getByTestId("select");
    fireEvent.change(select, { target: { value: "2" } });

    const createGameButton = screen.getByText("Crear partida");
    fireEvent.click(createGameButton);

    expect(
      screen.getByText("Corrige los errores antes de continuar")
    ).toBeInTheDocument();

    fireEvent.change(input, { target: { value: "NombreValido" } });

    expect(
      screen.queryByText("Corrige los errores antes de continuar")
    ).not.toBeInTheDocument();
  });

  it("should clear error message when select changes", () => {
    render(
      <MemoryRouter>
        <CreateGameFormContainer />
      </MemoryRouter>
    );

    const input = screen.getByPlaceholderText(
      "Ingrese el nombre de la partida"
    );
    fireEvent.change(input, { target: { value: "NombreInvalido%%$$" } });

    const select = screen.getByTestId("select");
    fireEvent.change(select, { target: { value: "2" } });

    const createGameButton = screen.getByText("Crear partida");
    fireEvent.click(createGameButton);

    expect(
      screen.getByText("Corrige los errores antes de continuar")
    ).toBeInTheDocument();

    fireEvent.change(select, { target: { value: "3" } });

    expect(
      screen.queryByText("Corrige los errores antes de continuar")
    ).not.toBeInTheDocument();
  });
});
