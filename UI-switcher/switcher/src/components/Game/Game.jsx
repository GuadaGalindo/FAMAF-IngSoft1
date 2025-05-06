import { useContext } from "react";
import { Col, Container, Row, Card } from "react-bootstrap";
import BoardContainer from "../../containers/BoardContainer/BoardContainer.jsx";
import FigCardContainer from "../../containers/FigCardContainer/FigCardContainer.jsx";
import GameButtonZoneContainer from "../../containers/GameButtonZoneContainer/GameButtonZoneContainer.jsx";
import GameInfoContainer from "../../containers/GameInfoContainer/GameInfoContainer.jsx";
import GameLogContainer from "../../containers/GameLogContainer/GameLogContainer.jsx";
import MovementCardContainer from "../../containers/MovementCardContainer/MovementCardContainer.jsx";
import { GameContext } from "../../context/game-data-context.jsx";
import { getPlayerId } from "../../utils/storageManagement.js";

export default function Game() {
  const { game } = useContext(GameContext);
  const id = parseInt(getPlayerId());

  return (
    <>
      <Container fluid className="d-flex h-100 overflow-y-scroll">
        <div className="w-75 h-100">
          <Container className="h-100 d-flex flex-column">
            <Row className="text-center h-5">
              <h2>Partida: {game.name || "Partida"}</h2>
            </Row>
            {game.status === "in game" && (
              <Card.Text className="mt-2 d-flex align-items-center justify-content-center fs-4">
                <strong>Color prohibido:</strong>
                {game.forbidden_color && game.forbidden_color !== "none" ? (
                  <span
                    className={`color-indicator ms-2 ${game.forbidden_color}`}
                    aria-label={game.forbidden_color}
                  />
                ) : (
                  <span className="ms-2">Ninguno</span>
                )}
              </Card.Text>
            )}

            <Row className="justify-content-center h-80">
              <Col className="col-lg-3 d-flex flex-column justify-content-center h-100">
                <MovementCardContainer />
              </Col>
              <Col className="col-lg-6 d-flex flex-column justify-content-center h-100">
                <BoardContainer />
              </Col>
              <Col className="col-lg-3 d-flex flex-column justify-content-center h-100">
                <FigCardContainer id={id} />
              </Col>
            </Row>

            {/* <Row className="justify-content-center h-25">
              <Col className="d-flex justify-content-center h-100">
                <GameLogContainer />
              </Col>
            </Row> */}
          </Container>
        </div>

        <div
          className="w-25 h-100"
          style={{ backgroundColor: "rgba(255, 255, 255, 0.3)" }}
        >
          <Container className="w-100 h-100">
            <Col className="d-flex flex-column justify-content-center h-100">
              <Container className="flex-grow-1 d-flex flex-column align-items-center justify-content-center">
                <GameInfoContainer />
              </Container>
              <Container className="flex-grow-1 d-flex flex-column align-items-center justify-content-center">
                <GameButtonZoneContainer />
              </Container>
            </Col>
          </Container>
        </div>
      </Container>
    </>
  );
}
