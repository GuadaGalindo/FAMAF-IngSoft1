import { Fragment } from "react";
import { Card, Container, Row } from "react-bootstrap";
import FigCardInfoContainer from "../../../containers/FigCardInfoContainer/FigCardInfoContainer";
import "./GameInfo.css";

export default function GameInfo({
  playerQty,
  playerList,
  status,
  id,
  playerTurnID,
}) {
  const playerIdInt = parseInt(id);
  const currentPlayer = playerList.find(player => parseInt(player.id) === playerIdInt);
  return (
    <>
      {status === "in game" && (
        <Card className="text-center shadow-sm w-100" style={{ backgroundColor: 'rgba(255, 255, 255, 0.5)' }}>
          <Card.Body>
            <Card.Text className="mb-3">
              {currentPlayer?.name}
            </Card.Text>
            {playerTurnID !== playerIdInt && (
              <Card.Text className="text-muted">
                Espera tu turno...
              </Card.Text>
            )}
            {playerTurnID === playerIdInt && (
              <Card.Text className="text-muted">
                ¡Es tu turno!
              </Card.Text>
            )}
          </Card.Body>
        </Card>
      )}

      {status === "in game" &&
        playerList
          .filter((player) => String(player.id) !== id)
          .map((player, index, arr) => (
            <Fragment key={player.id}>
              <Container
                data-testid={`${player.id}-player-info`}
                className={`player-info ${
                  player.id === playerTurnID ? "player-info-turn" : ""
                }`}
              >
                <div className="p-2 text-center">
                  {player.name}{""}
                  {player.id === playerTurnID && (
                    <span className="text-muted ms-2">En turno</span>
                  )}
                  <Row
                    md={3}
                    lg={3}
                    className="justify-content-center align-items-center text-center"
                  >
                    <FigCardInfoContainer id={player.id} />
                  </Row>
                </div>
              </Container>

              {index !== arr.length - 1 && <br />}
            </Fragment>
          ))}
      {status !== "in game" && (
        <Card
          className="text-center shadow-sm w-100 card-dark-transparent"
          data-bs-theme="dark"
        >
          <Card.Body>
            <Card.Title className="mb-3">Info. de la Partida</Card.Title>
            <Card.Text className="mb-1">
              <strong>Cant. de jugadores:</strong> {playerQty}
            </Card.Text>
            <Card.Text className="mb-1">
              <strong>Jugadores:</strong>{" "}
              {playerList.map((player) => player.name).join(" , ")}
            </Card.Text>
          </Card.Body>
        </Card>
      )}
    </>
  );
}
