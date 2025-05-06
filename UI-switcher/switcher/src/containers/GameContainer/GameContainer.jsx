import { useEffect } from "react";
import { useParams } from "react-router-dom";
import useWebSocket from "react-use-websocket";
import Game from "../../components/Game/Game";
import WinnerInfo from "../../components/WinnerInfo/WinnerInfo";
import { BASE_URL_WS } from "../../config";
import useBoard from "../../hooks/useBoard";
import useGame from "../../hooks/useGame";
import useWinnerNotification from "../../hooks/useWinnerNotification";
import {
  setBoardStorage,
  setFigureStorage,
} from "../../utils/storageManagement";
import CardProvider from "../../context/card-context";

export default function GameContainer() {
  const { updateGame, addMessage } = useGame();
  const { handleSetBoard, handleHighlightTiles, handleHighlightTilesPartialMove } = useBoard();
  const params = useParams();

  const { lastMessage } = useWebSocket(
    `${BASE_URL_WS}/games/${params.gameId}`,
    {
      shouldReconnect: () => true,
    }
  );

  const { winnerMessage, showModal, handleCloseModal } =
    useWinnerNotification(lastMessage);

  useEffect(() => {
    if (lastMessage) {
      try {
        const data = JSON.parse(lastMessage.data);

        if (data.message) {
          addMessage(data.message);
        }

        if (data.type === "board") {
          handleSetBoard(data.payload.color_distribution);
          setBoardStorage(data.payload.color_distribution);
        } else {
          updateGame(data.payload);
        }

        if (data.type === "figures") {
          // Parse all figures to one big list and then set them to be highlighted
          const tiles = [];

          data.payload.forEach((figure) => {
            figure.tiles.forEach((tile) => {
              tiles.push(tile);
            });
          });

          handleHighlightTiles(tiles);
          setFigureStorage(data.payload);
        }
        if (data.type === "partial_moves"){
          const tiles_partial_move = [];

          data.payload.forEach((tile) => {
              tiles_partial_move.push(tile);
          });

          handleHighlightTilesPartialMove(tiles_partial_move)
        }
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    }
  }, [
    lastMessage,
    updateGame,
    addMessage,
    handleSetBoard,
    handleHighlightTiles,
  ]);

  return (
    <>
      <CardProvider>
        <Game />
      </CardProvider>
      <WinnerInfo
        winnerMessage={winnerMessage}
        show={showModal}
        onClose={handleCloseModal}
      />
    </>
  );
}
