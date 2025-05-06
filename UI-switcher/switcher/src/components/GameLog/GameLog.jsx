import './GameLog.css';

export default function GameLog({ logs }) {
  return (
    <div className="game-log w-50 h-100">
      {logs.map((log, index) => (
        <div key={index}>{log}</div>
      ))}
    </div>
  );
}
