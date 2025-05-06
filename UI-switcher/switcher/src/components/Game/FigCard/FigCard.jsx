import { Col } from "react-bootstrap";
import "./FigCard.css";
import { getPlayerId } from "../../../utils/storageManagement";
import BackFigImg from "../../../assets/cards/back.svg"


export default function FigCard({ type, onClick, playerTurnID, isSelected, isBlocked }) {
  const playerId = getPlayerId();
  const isPlayerTurn = playerTurnID?.toString() === playerId;

  const handleClick = () => {
    if (isPlayerTurn && !isBlocked) {
      onClick();
    }
  };
  
  const img = isBlocked ? BackFigImg : type

  return (
    <Col
      data-testid="fig-card"
      className={`d-flex justify-content-center align-items-center text-center fig-card ${isSelected ? 'selected' : ''}`}
      onClick={handleClick}
    >
      <img src={img} alt="carta figura" draggable={false} />
    </Col>
  );
}