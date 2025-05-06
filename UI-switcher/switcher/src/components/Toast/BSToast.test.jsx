import { render, screen, fireEvent } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from "vitest";
import BSToast from './BSToast';

describe("BSToast Component", () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render the toast with correct title and body", () => {
    render(<BSToast title="Test Title" body="This is a test body." show={true} onClose={mockOnClose} position="top-end" />);
    
    // check for title
    const titleElement = screen.getByText("Test Title");
    expect(titleElement).toBeInTheDocument();

    // check for body
    const bodyElement = screen.getByText("This is a test body.");
    expect(bodyElement).toBeInTheDocument();
  });

  it("should not render the toast when show is false", () => {
    render(<BSToast title="Test Title" body="This is a test body." show={false} onClose={mockOnClose} position="top-end" />);

    const toastElement = screen.queryByText("Test Title");
    expect(toastElement).not.toBeInTheDocument();
  });

  it("should call onClose when the toast is closed", () => {
    render(<BSToast title="Test Title" body="This is a test body." show={true} onClose={mockOnClose} position="top-end" />);
    
    // click the close button
    const closeButton = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeButton);
    
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

});
