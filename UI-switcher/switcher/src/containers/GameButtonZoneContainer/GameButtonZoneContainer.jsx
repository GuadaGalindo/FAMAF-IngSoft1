import useGame from "../../hooks/useGame";
import { useNavigate } from "react-router-dom";
import { Button } from "react-bootstrap";
import useFetch from "use-http";
import { BASE_URL_ENDPOINT, options } from "../../config";
import { useToast } from "../../hooks/useToast";
import { getAuthToken, getPlayerId } from "../../utils/storageManagement";

export default function GameButtonZoneContainer() {
  const { game } = useGame();
  const navigate = useNavigate();
  const showToast = useToast();
  const id = getPlayerId();
  const token = getAuthToken();
  const { put, response } = useFetch(BASE_URL_ENDPOINT, options(token));

  const isHost = id === game.host_id?.toString();
  const isInGame = game.status === "in game";
  const isWaiting = game.status === "waiting";
  const isFull = game.status === "full";
  const abandonIsVisibleLobby = !isInGame && !isHost;
  const abandonIsVisibleGame = isInGame;
  const initIsVisible = isHost && (isFull || isWaiting);
  const playerTurnId = game?.players?.[game?.player_turn]?.id;
  const isTurn = playerTurnId?.toString() === id;

  const startButtonClick = async () => {
    try {
      await put(`/games/${game.id}/start`);

      if (!response.ok) {
        throw new Error("Error al iniciar la partida");
      }
    } catch (e) {
      showToast("Error", e.message);
    }
  };

  const abandonButtonClick = async () => {
    try {
      await put(`/games/${game.id}/quit`);

      if (!response.ok) {
        throw new Error("Error al abandonar la partida");
      }

      navigate("/games");
    } catch (e) {
      showToast("Error", e.message);
    }
  };

  const skipTurnButton = async () => {
    try {
      await put(`/games/${game.id}/finish-turn`);

      if (!response.ok) {
        throw new Error("Error al pasar de turno");
      }
    } catch (e) {
      showToast("Error", e.message);
    }
  };

  const cancelLastMovementButton = async () => {
    try {
      await put(`/games/${game.id}/movement/back`);

      if (!response.ok) {
        throw new Error("No hay movimientos para cancelar");
      }
    } catch (e) {
      showToast("Error", e.message);
    }
  }

  return (
    <>
      {initIsVisible && (
        <Button
          className="m-1 w-75"
          variant="primary"
          disabled={!isFull}
          onClick={startButtonClick}
        >
          Iniciar partida
        </Button>
      )}
      {isInGame && (
        <>
          <Button
            className="m-1 w-75"
            variant="secondary"
            disabled={!isTurn}
            onClick={cancelLastMovementButton}
          >
            Cancelar movimiento
          </Button>
          <Button
            className="m-1 w-75"
            variant="primary"
            disabled={!isTurn}
            onClick={skipTurnButton}
          >
            Pasar turno
          </Button>
          
        </>
      )}

      {(abandonIsVisibleLobby || abandonIsVisibleGame) && (
        <Button
          className="m-1 w-75"
          variant="danger"
          onClick={abandonButtonClick}
        >
          Abandonar
        </Button>
      )}
    </>
  );
}
