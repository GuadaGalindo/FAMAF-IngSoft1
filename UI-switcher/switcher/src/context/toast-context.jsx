import { createContext, useCallback, useRef } from "react";
import BSToastContainer from "../containers/ToastContainer/BSToastContainer";

// Create a ToastContext
export const ToastContext = createContext();

// Provider component to wrap the app
export const ToastProvider = ({ children }) => {
  const toastRef = useRef();

  const showToast = useCallback(function showToast(title, body) {
    toastRef.current.addToast(title, body);
  }, []);

  return (
    <ToastContext.Provider value={showToast}>
      {/* Toast container */}
      <BSToastContainer ref={toastRef} />
      {children}
    </ToastContext.Provider>
  );
};
