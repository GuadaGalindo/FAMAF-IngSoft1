import { useEffect, useState } from "react";
import FigCard from "../../components/Game/FigCard/FigCard.jsx";
import cardImageMap from "../../hooks/getFigCards.jsx";
import useGame from "../../hooks/useGame.jsx";
import useBoard from "../../hooks/useBoard.jsx";
import useCard from "../../hooks/useCard.jsx";

export default function FigCardContainer({ id }) {
  const { game, cleanMovType, handleSetFigureCard } = useGame();
  const [cardImages, setCardImages] = useState([]);
  const playerTurnID = game?.players?.[game?.player_turn]?.id;
  const { toggleFocusedCard, focusedCardId } = useCard();
  const { cleanSelectedTiles } = useBoard();

  useEffect(() => {
    const cards =
      game?.players?.find((player) => player.id === id)?.figure_cards || [];

    const images = cards.map((card) => {
      const cardImg = cardImageMap[card.type[0]];
      return { ...card, cardImg };
    });
    setCardImages(images);
  }, [game, id]);

  const handleCardClick = (card) => {
    toggleFocusedCard(card.type, "fig-card");
    cleanMovType();
    cleanSelectedTiles();
    handleSetFigureCard(card.type);
  };

  useEffect(() => {
    const cards =
      game?.players?.find((player) => player.id === id)?.figure_cards || [];

    const images = cards.map((card) => {
      const cardImg = cardImageMap[card.type[0]];
      return { ...card, cardImg };
    });
    setCardImages(images);
  }, [game, id]);
  
  const card_list = cardImages.map((card, index) => (
    <FigCard
      key={index}
      id={card.type}
      type={card.cardImg}
      onClick={() => handleCardClick(card)}
      playerTurnID={playerTurnID}
      isSelected={focusedCardId === card.type}
      isBlocked={card.blocked}
    />
  ));

  return card_list;
}
