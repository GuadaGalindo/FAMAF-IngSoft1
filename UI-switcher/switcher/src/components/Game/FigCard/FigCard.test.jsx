import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import FigCard from './FigCard';

describe('FigCard', () => {
    beforeEach(() => {
        sessionStorage.setItem("id", "1");
    });

    it('should render the figure card and display the correct image based on isBlocked', () => {
        const props = {
          type: 'card-type', 
          onClick: vi.fn(),
          playerTurnID: 1, 
          isSelected: false,
          isBlocked: false,
        };

        render(<FigCard {...props} />);

        const img = screen.getByAltText('carta figura');
        expect(img).toHaveAttribute('src', 'card-type');

    })

    it('should apply "selected" class if isSelected is true', () => {
        const props = {
          type: 'card-type',
          onClick: vi.fn(),
          playerTurnID: 1,
          isSelected: true,
          isBlocked: false,
        };
    
        render(<FigCard {...props} />);
    
        const card = screen.getByTestId('fig-card');
        expect(card).toHaveClass('selected');
    });

    it('should not trigger onClick if the player is not the turn', () => {
        const mockOnClick = vi.fn();
        const props = {
          type: 'card-type',
          onClick: mockOnClick,
          playerTurnID: 2,  // ID de jugador que no es el turno
          isSelected: false,
          isBlocked: false,
        };
    
        render(<FigCard {...props} />);
    
        const card = screen.getByTestId('fig-card');
        fireEvent.click(card);
    
        // verificar que no se haya llamado a onClick
        expect(mockOnClick).not.toHaveBeenCalled();
    });

    it('should not trigger onClick if the card is blocked', () => {
        const mockOnClick = vi.fn();
        const props = {
          type: 'card-type',
          onClick: mockOnClick,
          playerTurnID: 1,  // ID de jugador que es el turno
          isSelected: false,
          isBlocked: true,  // carta bloqueada
        };
    
        render(<FigCard {...props} />);
    
        const card = screen.getByTestId('fig-card');
        fireEvent.click(card);
    
        expect(mockOnClick).not.toHaveBeenCalled();
    });

    it('should trigger onClick if the player is the turn and the card is not blocked', () => {
        const mockOnClick = vi.fn();
        const props = {
          type: 'card-type',
          onClick: mockOnClick,
          playerTurnID: 1,  // ID de jugador que es el turno
          isSelected: false,
          isBlocked: false, // carta no bloqueada
        };
    
        render(<FigCard {...props} />);
    
        const card = screen.getByTestId('fig-card');
        fireEvent.click(card);
    
        // verificar que se haya llamado a onClick
        expect(mockOnClick).toHaveBeenCalled();
    });

})