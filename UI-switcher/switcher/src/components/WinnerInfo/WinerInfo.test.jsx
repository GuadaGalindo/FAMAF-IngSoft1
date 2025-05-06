import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import WinnerInfo from './WinnerInfo';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useNavigate } from 'react-router-dom';

// Mock parcial de react-router-dom
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom'); // Importa el módulo original
  return {
    ...actual, // Conservar el resto del módulo
    useNavigate: vi.fn(), // Mock de useNavigate
  };
});

describe('WinnerInfo Component', () => {
    const winnerMessage = "Player 1 wins!";
    const mockNavigate = vi.fn(); // Mock de la función de navegación

    // Actualiza useNavigate para devolver el mock
    beforeEach(() => {
        useNavigate.mockReturnValue(mockNavigate);
    });

    const renderComponent = (show) => {
        return render(
            <BrowserRouter>
                <WinnerInfo winnerMessage={winnerMessage} show={show} />
            </BrowserRouter>
        );
    };

    it('renders correctly when show is true', () => {
        renderComponent(true);
        expect(screen.getByText('Resultado de la Partida')).toBeInTheDocument();
        expect(screen.getByText(winnerMessage)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /volver al inicio/i })).toBeInTheDocument();
    });

    it('does not render when show is false', () => {
        renderComponent(false);
        expect(screen.queryByText('Resultado de la Partida')).not.toBeInTheDocument();
    });

    it('navigates to /games when button is clicked', () => {
        renderComponent(true);
        const button = screen.getByRole('button', { name: /volver al inicio/i });
        fireEvent.click(button);
        expect(mockNavigate).toHaveBeenCalledWith('/games'); // Verifica que navega correctamente
    });
});