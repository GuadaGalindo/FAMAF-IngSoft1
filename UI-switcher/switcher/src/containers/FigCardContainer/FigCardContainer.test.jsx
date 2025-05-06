import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import FigCardContainer from "./FigCardContainer";
import useGame from "../../hooks/useGame";

vi.mock("../../hooks/useGame");
vi.mock("../../assets/cards/fig/fig01.svg", () => ({ default: "fig01.svg" }));
vi.mock("../../assets/cards/fig/fig02.svg", () => ({ default: "fig02.svg" }));
vi.mock("../../assets/cards/fig/fig03.svg", () => ({ default: "fig03.svg" }));

describe("FigCardContainer test", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.setItem("id", "1");
  });

  it("Should display no cards when there are no cards", () => {
    const mockGame = {
      players: [
        { id: 1, name: "player1", figure_cards: [] },
        { id: 2, name: "player2", figure_cards: [] },
      ],
    };

    useGame.mockReturnValue({
      game: mockGame,
    });

    render(<FigCardContainer />);
    const figCardElement = screen.queryAllByAltText("carta figura");
    expect(figCardElement).toHaveLength(0);
  });

  it("Should display cards when there are cards", async () => {
    const mockGame = {
      players: [
        {
          id: 1,
          name: "juan",
          figure_cards: [
            { type: ["fig01", "difficult"] },
            { type: ["fig02", "difficult"] },
            { type: ["fig03", "difficult"] },
          ],
        },
        { id: 2, name: "pedro", figure_cards: [] },
      ],
    };

    useGame.mockReturnValue({
      game: mockGame,
    });

    render(<FigCardContainer id={1} />);

    const figCardElement = screen.getAllByRole("img", { name: "carta figura" });
    expect(figCardElement).toHaveLength(3);
    figCardElement.forEach((element) => expect(element).toBeInTheDocument());
  });
});
