import { useContext } from "react";
import { CardContext } from "../context/card-context";

export default function useCard() {
  const ctx = useContext(CardContext);

  if (!ctx) {
    throw new Error("useCard must be used within a CardProvider");
  }

  return ctx;
}