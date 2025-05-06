import { useEffect, useState } from "react";
import FigCard from "../../components/Game/FigCard/FigCard.jsx";
import cardImageMap from "../../hooks/getFigCards.jsx";
import useGame from "../../hooks/useGame.jsx";
import useCard from "../../hooks/useCard.jsx";
import useBoard from "../../hooks/useBoard.jsx";
import { getAuthToken } from "../../utils/storageManagement.js";


export default function FigCardContainer({ id }) {
  const { game, cleanMovType } = useGame();
  const { toggleFocusedCard, focusedCardId } = useCard();
  const { cleanSelectedTiles } = useBoard();
  const [cardImages, setCardImages] = useState([]);
  const token = getAuthToken();
  const playerTurnID = game?.players?.[game?.player_turn]?.id;

  const handleCardClick = async (card, index) => {
    toggleFocusedCard(card, `opponent-fig-card-${index}`);
    cleanMovType();
    cleanSelectedTiles();
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
    onClick={() => handleCardClick(card, index)}
    playerTurnID={playerTurnID}
    isSelected={focusedCardId?.type === card.type}
    isBlocked={card.blocked}
    role="img"
  />
  ));

   
  return card_list;
}