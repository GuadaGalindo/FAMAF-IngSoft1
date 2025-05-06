import { useEffect, useState } from "react";
import { Button, Card, Col, Container, Modal, Row } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import useWebSocket, { ReadyState } from "react-use-websocket";
import useFetch from "use-http";
import { BASE_URL_ENDPOINT, BASE_URL_WS, options } from "../../config";
import useModal from "../../hooks/useModal";
import { useToast } from "../../hooks/useToast";
import { getAuthToken } from "../../utils/storageManagement";
import CreateGameFormContainer from "../CreateGameFormContainer/CreateGameFormContainer";
import "./gameList.css";

export const GameList = () => {
  const [games, setGames] = useState([]);
  const navigate = useNavigate();
  const { show, handleClose, handleShow } = useModal();
  const showToast = useToast();
  const token = getAuthToken();
  const { put, response } = useFetch(BASE_URL_ENDPOINT, options(token));

  // websocket connection
  const { lastMessage, readyState } = useWebSocket(`${BASE_URL_WS}/games`, {
    shouldReconnect: () => true,
  });

  useEffect(() => {
    if (lastMessage) {
      const data = JSON.parse(lastMessage.data);

      switch (data.type) {
        case "initial game list":
          setGames(data.payload);
          break;

        case "game added":
          setGames((prevGames) => {
            const gameExists = prevGames.some(
              (game) => game.id === data.payload.id
            );
            return gameExists ? prevGames : [data.payload, ...prevGames];
          });
          break;

        case "game updated":
          setGames((prevGames) => {
            const updatedGame = data.payload;

            if (
              updatedGame.status === "full" ||
              updatedGame.status === "in game" ||
              updatedGame.status === "finished"
            ) {
              return prevGames.filter((game) => game.id !== updatedGame.id);
            }

            const gameIndex = prevGames.findIndex(
              (game) => game.id === updatedGame.id
            );

            if (gameIndex !== -1) {
              const updatedGames = [...prevGames];
              updatedGames[gameIndex] = updatedGame;
              return updatedGames;
            } else {
              return [updatedGame, ...prevGames];
            }
          });
          break;

        default:
          break;
      }
    }
  }, [lastMessage]);

  const connectionStatus = {
    [ReadyState.CONNECTING]: "Conectando...",
    [ReadyState.OPEN]: "Conectado",
    [ReadyState.CLOSING]: "Cerrando...",
    [ReadyState.CLOSED]: "Desconectado",
    [ReadyState.UNINSTANTIATED]: "Sin instanciar",
  }[readyState];

  async function joinGame(gameId) {
    try {
      const data = await put(`/games/${gameId}/join`);
      if (!response.ok) {
        throw { status: response.status, detail: data.detail };
      }
      const navigatePath = `/games/${gameId}`;
      navigate(navigatePath);
    } catch (e) {
      showToast(
        e?.status || "Error",
        e?.detail || "Error al unirse a la partida."
      );
    }
  }

  let infoText;

  if (connectionStatus === "Conectando...") {
    infoText = "Cargando...";
  } else if (connectionStatus === "Desconectado") {
    infoText = "No tienes conexión.";
  } else {
    infoText = "Vuelve a intentarlo más tarde.";
  }

  const isConnected = connectionStatus === "Conectado";

  return (
    <>
      <Row className="align-items-center mt-3 ms-5 me-5">
        <Col xs={6}>
          <h2>Listado de partidas</h2>
        </Col>
        <Col xs={6} className="text-end">
          <Button variant="primary" onClick={handleShow}>
            Crear partida
          </Button>
        </Col>
      </Row>
      {!isConnected && (
        <Container className="d-flex justify-content-center align-items-center vh-100">
          <h6>{infoText}</h6>
        </Container>
      )}
      {isConnected && (
        <>
          {games.length > 0 && (
            <Row
              xs={1}
              md={2}
              lg={4}
              className="g-4 mt-3 mb-3 ms-5 me-5 overflow-y-auto"
            >
              {games.map((game, index) => (
                <Col key={index}>
                  <Card className="align-items-center text-center card-game-list">
                    <Card.Body>
                      <Card.Title>{game.name}</Card.Title>
                      <Card.Text>
                        Jugadores:{" "}
                        {`${game.players ? game.players.length : 0}/${
                          game.player_amount
                        }`}
                      </Card.Text>
                      <Button
                        variant="primary"
                        onClick={() => joinGame(game.id)}
                      >
                        Unirse
                      </Button>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          )}
          {games.length <= 0 && (
            <Container className="d-flex justify-content-center align-items-center vh-100">
              <h6>En este momento no hay partidas disponibles</h6>
              <h6>¡Crea una!</h6>
            </Container>
          )}
        </>
      )}
      <Modal show={show} onHide={handleClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>Crear Partida</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <CreateGameFormContainer />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="danger" onClick={handleClose}>
            Cancelar
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};
