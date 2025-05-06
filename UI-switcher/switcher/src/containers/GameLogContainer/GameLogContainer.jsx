import GameLog from "../../components/GameLog/GameLog";
import useGame from "../../hooks/useGame";
import { useEffect } from "react";

export default function GameLogContainer() {
  const { messages, addMessage, game } = useGame();

  useEffect(() => {
    if (game.status === 'in game') {
      addMessage('PARTIDA INICIADA ¡Suerte!');
    }
  }, [game.status, addMessage]);

  return <GameLog logs={messages} />;
}

