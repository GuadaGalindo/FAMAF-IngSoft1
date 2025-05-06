import { describe, vi, beforeEach, afterEach, it, expect } from "vitest";
import useGame from "../../hooks/useGame";
import { render } from "@testing-library/react";
import GameLogContainer from "./GameLogContainer";

vi.mock("../../hooks/useGame", () => ({
  default: vi.fn(),
}));

describe("GameLogContainer test", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should add new message on started game", () => {
    const mockAddMessage = vi.fn().mockResolvedValue();
    const mockGame = { status: "in game" };
    const mockMessages = [];

    useGame.mockReturnValue({
      game: mockGame,
      addMessage: mockAddMessage,
      messages: mockMessages,
    });

    render(<GameLogContainer />);

    expect(mockAddMessage).toBeCalledWith("PARTIDA INICIADA ¡Suerte!");
  });
});
