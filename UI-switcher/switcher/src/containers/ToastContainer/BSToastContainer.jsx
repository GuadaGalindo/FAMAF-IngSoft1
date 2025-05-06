import { forwardRef, useImperativeHandle, useState } from "react";
import { Toast, ToastContainer } from "react-bootstrap";

const BSToastContainer = forwardRef(function BSToastContainer(props, ref) {
  const [toasts, setToasts] = useState([]);

  // Function to add a new toast
  const addToast = (title, body) => {
    const newToast = {
      id: Math.random(),
      title,
      body,
    };
    setToasts([...toasts, newToast]);
  };

  // Function to remove a toast
  const removeToast = (id) => {
    setToasts(toasts.filter((toast) => toast.id !== id));
  };

  useImperativeHandle(ref, () => ({
    addToast,
  }));

  return (
    <ToastContainer position="bottom-start" className="p-3">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          onClose={() => removeToast(toast.id)}
          delay={3000}
          autohide
        >
          <Toast.Header>
            <img
              src="/logo.jpg"
              className="me-2"
              height={20}
              alt="el switcher"
            />
            <strong className="me-auto">{toast.title}</strong>
          </Toast.Header>
          <Toast.Body>{toast.body}</Toast.Body>
        </Toast>
      ))}
    </ToastContainer>
  );
});

export default BSToastContainer;