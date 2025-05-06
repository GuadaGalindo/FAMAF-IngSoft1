import { createContext, useCallback, useState } from "react";

const INITIAL_GAME_DATA = {
  id: null,
  name: null,
  player_amount: null,
  status: null,
  host_id: null,
  player_turn: null,
  players: [],
  forbidden_color: null,
};


const INITIAL_MESSAGES_DATA = [];

const INITIAL_MOV_TYPE = {};

const INITIAL_SELECTED_FIGURE_CARD = {};

export const GameContext = createContext({
  game: INITIAL_GAME_DATA,
  messages: INITIAL_MESSAGES_DATA,
  movType: INITIAL_MOV_TYPE,
  selectedFigureCard: INITIAL_SELECTED_FIGURE_CARD,
  handleSetMovType: () => {},
  updateGame: () => {},
  addMessage: () => {},
  cleanMovType: () => {},
  handleSetFigureCard: () => {},
});

export default function GameProvider({ children }) {
  const [game, setGame] = useState(INITIAL_GAME_DATA);
  const [messages, setMessages] = useState(INITIAL_MESSAGES_DATA);
  const [movType, setMovType] = useState(INITIAL_MOV_TYPE);
  const [selectedFigureCard, setSelectedFigureCard] = useState(INITIAL_SELECTED_FIGURE_CARD);

  const updateGame = useCallback((newData) => {
    setGame((prevGame) => ({ ...prevGame, ...newData }));
  }, []);

  const addMessage = useCallback((newMessage) => {
    setMessages((prevMessages) => [...prevMessages, newMessage]);
  }, []);

  const handleSetMovType = useCallback((type) => {
    setMovType((prev) => (prev === type ? INITIAL_MOV_TYPE : type));
  }, []);

  const cleanMovType = useCallback(() => {
    setMovType(INITIAL_MOV_TYPE);
  }, []);

  const handleSetFigureCard = useCallback((card) => {
    setSelectedFigureCard((prevCard) => (prevCard === card ? INITIAL_SELECTED_FIGURE_CARD : card));
  }, []);

  const ctxValue = {
    game,
    messages,
    movType,
    selectedFigureCard,
    handleSetMovType,
    updateGame,
    addMessage,
    cleanMovType,
    handleSetFigureCard,
  };

  return (
    <GameContext.Provider value={ctxValue}>{children}</GameContext.Provider>
  );
}
