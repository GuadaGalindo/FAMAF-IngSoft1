import GameInfo from "../../components/Game/GameInfo/GameInfo";
import useGame from "../../hooks/useGame";
import { getPlayerId } from "../../utils/storageManagement";

export default function GameInfoContainer() {
  const { game } = useGame();
  const id = getPlayerId();
  const playerTurnID = game?.players?.[game?.player_turn]?.id; // Los signos de pregunta son para evitar errores de undefined

  return (
    <GameInfo
      playerQty={`${game.players.length}/${game.player_amount}`}
      name={game.name}
      playerList={game.players}
      status={game.status}
      id={id}
      playerTurnID={playerTurnID}
      forbidden_color={game.forbidden_color}
    />
  );
}
