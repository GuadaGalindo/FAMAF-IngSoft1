import { Modal } from "react-bootstrap";
import { useNavigate } from 'react-router-dom';

const WinnerInfo = ({ winnerMessage, show }) => {
  const navigate = useNavigate();

  const handleRedirect = () => {
    navigate('/games'); // Redirige a la página de juegos
  };

  return (
    <Modal show={show} centered>
      <Modal.Header>
        <Modal.Title>Resultado de la Partida</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <h2>{winnerMessage}</h2> 
      </Modal.Body>
      <Modal.Footer>
        <button type="button" className="btn btn-primary" onClick={handleRedirect}>Volver al inicio</button>
      </Modal.Footer>
    </Modal>
  );
};

export default WinnerInfo;