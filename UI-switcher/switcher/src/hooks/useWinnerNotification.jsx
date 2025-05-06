import { useState, useEffect } from 'react';
import { getPlayerId } from '../utils/storageManagement';

const useWinnerNotification = (lastMessage) => {
  const [winnerMessage, setWinnerMessage] = useState('');
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (lastMessage) {
      try {
        const data = JSON.parse(lastMessage.data);

        if (data.type === 'game won') {
          const currentPlayerId = parseInt(getPlayerId());
          const winningPlayerId = data.payload.player_id;

          if (currentPlayerId === winningPlayerId) {
            setWinnerMessage("Ganaste ¡Felicitaciones!");
          } else {
            setWinnerMessage(data.message);
          }

          setShowModal(true);
        }
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    }
  }, [lastMessage]);

  const handleCloseModal = () => {
    setShowModal(false);
  };

  return { winnerMessage, showModal, handleCloseModal };
};

export default useWinnerNotification;