import { createContext, useCallback, useState } from "react";

export const CardContext = createContext({
  focusedCardId: null,
  focusedGroupId: null,
  toggleFocusedCard: () => {},
  cleanFocusedCard: () => {},
});

export default function CardProvider({ children }) {
  const [focusedCard, setFocusedCard] = useState({ id: null, group: null });

  const toggleFocusedCard = useCallback((id, group) => {
    setFocusedCard((prev) =>
      prev.id === id && prev.group === group
        ? { id: null, group: null }
        : { id, group }
    );
  }, []);

  const cleanFocusedCard = useCallback(() => {
    setFocusedCard({ id: null, group: null });
  }, []);

  const contextValue = {
    focusedCardId: focusedCard.id,
    focusedGroupId: focusedCard.group,
    toggleFocusedCard,
    cleanFocusedCard,
  };

  return (
    <CardContext.Provider value={contextValue}>{children}</CardContext.Provider>
  );
}
