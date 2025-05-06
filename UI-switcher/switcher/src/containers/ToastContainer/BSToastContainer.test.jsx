import { render, screen, waitFor, act } from "@testing-library/react";
import { createRef } from "react";
import { describe, it, expect } from "vitest";
import BSToastContainer from "./BSToastContainer";

describe("BSToastContainer", () => {
  it("should add a toast and display it", async () => {
    const ref = createRef();

    render(<BSToastContainer ref={ref} />);

    // add toast using the ref
    act(() => {
      ref.current.addToast("Test Title", "Test Body");
    });

    await waitFor(() => {
      expect(screen.getByText("Test Title")).toBeInTheDocument();
      expect(screen.getByText("Test Body")).toBeInTheDocument();
    });
  });

  it("should remove a toast when closed", async () => {
    const ref = createRef();

    render(<BSToastContainer ref={ref} />);

    // add toast
    act(() => {
      ref.current.addToast("Test Title", "Test Body");
    });

    await waitFor(() => {
      expect(screen.getByText("Test Title")).toBeInTheDocument();
    });

    // close the toast
    const closeButton = screen.getByRole("button");
    act(() => {
      closeButton.click();
    });

    await waitFor(() => {
      expect(screen.queryByText("Test Title")).not.toBeInTheDocument();
    });
  });
});
