import { Toast, ToastContainer } from "react-bootstrap";

export default function BSToast({ title, body, show, onClose, position }) {
  return (
    <ToastContainer className="p-3" position={position}>
      <Toast onClose={onClose} show={show} delay={6000} autohide>
        <Toast.Header>
          <img src="/logo.jpg" className="me-2" height={20} alt="el switcher" />
          <strong className="me-auto">{title}</strong>
        </Toast.Header>
        <Toast.Body>
          {body}
        </Toast.Body>
      </Toast>
    </ToastContainer>
  )
}