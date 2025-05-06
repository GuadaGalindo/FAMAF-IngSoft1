import { Col } from "react-bootstrap";
import "./MovCard.css";
import useGame from "../../../hooks/useGame";
import { getPlayerId } from "../../../utils/storageManagement";
import useBoard from "../../../hooks/useBoard";
import useCard from "../../../hooks/useCard";

export default function MovCard({ id, url, type, playerTurnID, style, isInHand }) {
  const { focusedCardId, toggleFocusedCard } = useCard();
  const { handleSetMovType } = useGame();
  const { cleanSelectedTiles } = useBoard();
  const playerId = getPlayerId();
  const isPlayerTurn = playerTurnID?.toString() === playerId;

  function handleClick() {
    if (!isInHand) return;

    if (isPlayerTurn) {
      toggleFocusedCard(id, "mov-card");
      handleSetMovType(type);
      cleanSelectedTiles();
    }
  }

  const isFocused = focusedCardId === id;

  return (
    <Col
      className={`d-flex justify-content-center align-items-center mov-card ${
        isFocused ? "focused" : ""
      }`}
      onClick={handleClick}
      tabIndex={0}
    >
      <img src={url} alt="carta movimiento" draggable={false} style={style} className={!isInHand ? "disabled-img" : ""}/>
    </Col>
  );
}
