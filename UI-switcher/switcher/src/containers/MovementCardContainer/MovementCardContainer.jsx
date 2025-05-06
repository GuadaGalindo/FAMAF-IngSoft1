import { useCallback, useEffect, useState } from "react";
import MovCard from "../../components/Game/MovCard/MovCard.jsx";
import useBoard from "../../hooks/useBoard.jsx";
import useGame from "../../hooks/useGame.jsx";
import "./MovementCardContainer.css";

import { useParams } from "react-router-dom";
import useFetch from "use-http";
import mov01 from "../../assets/cards/movement/mov01.svg";
import mov02 from "../../assets/cards/movement/mov02.svg";
import mov03 from "../../assets/cards/movement/mov03.svg";
import mov04 from "../../assets/cards/movement/mov04.svg";
import mov05 from "../../assets/cards/movement/mov05.svg";
import mov06 from "../../assets/cards/movement/mov06.svg";
import mov07 from "../../assets/cards/movement/mov07.svg";
import { BASE_URL_ENDPOINT, options } from "../../config.js";
import { useToast } from "../../hooks/useToast.jsx";
import { getAuthToken, getPlayerId } from "../../utils/storageManagement.js";
import useCard from "../../hooks/useCard.jsx";

const cardImageMap = {
  mov01,
  mov02,
  mov03,
  mov04,
  mov05,
  mov06,
  mov07,
};

const INITIAL_MOVEMENT_DATA = {
  movement_card: {},
  piece_1_coordinates: {
    x: null,
    y: null,
  },
  piece_2_coordinates: {
    x: null,
    y: null,
  },
};

export default function MovementCardContainer() {
  const { game, movType, cleanMovType, addMessage } = useGame();
  const { selectedTiles, undoMovement } = useBoard();
  const id = parseInt(getPlayerId());
  const token = getAuthToken();
  const params = useParams();
  const showToast = useToast();
  const { cleanFocusedCard } = useCard();
  const [cardImages, setCardImages] = useState([]);
  const { put, response } = useFetch(BASE_URL_ENDPOINT, options(token));
  const [movementData, setMovementData] = useState(INITIAL_MOVEMENT_DATA);
  const [shouldFetch, setShouldFetch] = useState(false);
  const playerTurnID = game?.players?.[game?.player_turn]?.id;

  const fetchAddMovement = useCallback(async () => {
    try {
      const data = await put(
        `/games/${params.gameId}/movement/add`,
        movementData
      );

      if (!response.ok) {
        throw { status: response.status, detail: data.detail };
      }

      addMessage(data.message);
    } catch (e) {
      showToast(
        e?.status || "Error",
        e?.detail || "Error al mover las fichas. Intentalo nuevamente"
      );
      undoMovement();
    }
  }, [
    movementData,
    params.gameId,
    put,
    response,
    addMessage,
    showToast,
    undoMovement,
  ]);

  useEffect(() => {
    const cards =
      game?.players?.find((player) => player.id === id)?.movement_cards || [];
    const images = cards.map((card) => {
        const cardImg = cardImageMap[card.movement_type];
        const cardImgStyle = card.in_hand ? {} : { filter: 'grayscale(100%)' };
        return { cardInfo: { ...card }, cardImg, cardImgStyle, isInHand: card.in_hand, };
      });
    setCardImages(images);
  }, [game, id]);

  useEffect(() => {
    if (selectedTiles.length === 2 && movType) {
      setMovementData((prev) => ({
        ...prev,
        movement_card: movType,
        piece_1_coordinates: {
          x: selectedTiles[0].row,
          y: selectedTiles[0].col,
        },
        piece_2_coordinates: {
          x: selectedTiles[1].row,
          y: selectedTiles[1].col,
        },
      }));
      setShouldFetch(true);
    }
  }, [selectedTiles, movType]);

  useEffect(() => {
    if (shouldFetch) {
      fetchAddMovement();
      cleanFocusedCard();
      cleanMovType();
      setShouldFetch(false);
    }
  }, [fetchAddMovement, shouldFetch, cleanFocusedCard, cleanMovType]);

  return cardImages.map((card, index) => (
    <MovCard
      id={index}
      url={card.cardImg}
      type={card.cardInfo}
      role="img"
      key={index}
      playerTurnID={playerTurnID}
      style={card.cardImgStyle}
      isInHand={card.isInHand}
    />
  ));
}