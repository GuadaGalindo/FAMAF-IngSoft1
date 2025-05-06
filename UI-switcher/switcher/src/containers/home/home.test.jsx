import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { act } from "react";
import { Home } from "./home";
import useFetch from "use-http";

// createuseNavigate simulation
const mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual, // normal operation
    useNavigate: () => mockNavigate, // simulated function
  };
});

vi.mock("use-http", () => ({
  default: vi.fn(() => ({
    post: vi.fn(),
    response: { ok: true },
  })),
}));

describe("Home component", () => {
  // before each test, render the component with router
  beforeEach(() => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );
    sessionStorage.clear();
  });

  // after each test, clean the mocks
  afterEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
  });

  // UI tests

  it("should render the title correctly", () => {
    const title = screen.getByText("EL SWITCHER");
    expect(title).toBeInTheDocument();
  });

  it("should display the input to enter the name", () => {
    const input = screen.getByPlaceholderText("Nombre"); // the placeholder is used to identify the input
    expect(input).toBeInTheDocument();
  });

  it("should display the button", () => {
    const goButton = screen.getByRole("button", { name: "¡Adelante!" });
    expect(goButton).toBeInTheDocument();
  });

  it('should show the message "Nombre inválido..." if the name contains special characters', () => {
    const input = screen.getByPlaceholderText("Nombre");
    fireEvent.change(input, { target: { value: "NombreInválido@#" } }); // invalid name simulation
    const errorMessage = screen.getByText(
      "No se permiten caracteres especiales"
    );
    expect(errorMessage).toBeInTheDocument();
  });

  it('should show the message "Nombre inválido..." if the name has more than 20 characters', () => {
    const input = screen.getByPlaceholderText("Nombre");
    fireEvent.change(input, { target: { value: "Nombremuymuymuymuylargo" } }); // invalid name simulation
    const errorMessage = screen.getByText(
      "Máximo de 20 caracteres excedido"
    );
    expect(errorMessage).toBeInTheDocument();
  });

  it('should show the message "Corrige los errores antes de continuar" if the name is invalid', async () => {
    const invalidName = "NombreInválido@#";
    const input = screen.getByPlaceholderText("Nombre");
    fireEvent.change(input, { target: { value: invalidName } }); // invalid name simulation

    // simulate submitting the form
    const button = screen.getByText("¡Adelante!");
    await act(async () => {
      fireEvent.click(button);
    });

    // check for the error message when the name is invalid
    const errorMessage = screen.getByText("Corrige los errores antes de continuar");
    expect(errorMessage).toBeInTheDocument();
  });

  // API tests

  it("should get token and id on successfull fetch and navigate to game-list", async () => {
    const mockPost = vi.fn().mockResolvedValue({
      token: 123,
      id: 1,
    });

    const mockResponse = {
      ok: true,
    };

    useFetch.mockReturnValue({
      post: mockPost,
      response: mockResponse,
    });

    const input = screen.getByPlaceholderText("Nombre");
    fireEvent.change(input, { target: { value: "PlayerName" } }); // name simulation

    const button = screen.getByText("¡Adelante!");

    await act(async () => {
      fireEvent.click(button); // click simulation
    });

    expect(mockPost).toHaveBeenCalledWith("/players", { name: "PlayerName" });

    const errorMessage = screen.queryByText(
      "No es posible crear el jugador en este momento"
    );

    expect(errorMessage).not.toBeInTheDocument();

    expect(mockNavigate).toBeCalledWith("/games");
  });

  it("should return an error message on unsuccessfull fetch", async () => {
    const mockPost = vi.fn().mockResolvedValue({
      token: 123,
      id: 1,
    });

    const mockResponse = {
      ok: false,
    };

    useFetch.mockReturnValue({
      post: mockPost,
      response: mockResponse,
    });

    const input = screen.getByPlaceholderText("Nombre");
    fireEvent.change(input, { target: { value: "PlayerName" } }); // name simulation

    const button = screen.getByText("¡Adelante!");

    await act(async () => {
      fireEvent.click(button); // click simulation
    });

    expect(mockPost).toHaveBeenCalledWith("/players", { name: "PlayerName" });

    const errorMessage = await screen.findByText(
      "No es posible crear el jugador en este momento"
    );
    expect(errorMessage).toBeInTheDocument();
  });
});
