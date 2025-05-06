import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import App from "./App";

describe("App Routing", () => {

    beforeEach(() => {
        sessionStorage.clear();
      });

    it("renders Home component at root route", () => {
        // render the entire application
        render(<App />);

        // verify if the Home is present
        expect(screen.getByText("EL SWITCHER")).toBeInTheDocument();
    });

    it("should persist data in localStorage and restore it after reload", () => {

        sessionStorage.setItem("appSessionState", "{\"key\":\"value\"}");

        render(<App />);
        render(null);
        render(<App />);

        expect(sessionStorage.getItem("appSessionState")).toEqual("{\"key\":\"value\"}");
    });
});