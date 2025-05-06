import Form from "react-bootstrap/Form";

const FormInput = ({ label, type, placeholder, value, onChange, error, required, autoFocus }) => (
  <Form.Group className="mb-3">
    {label && <Form.Label>{label}</Form.Label>}
    <Form.Control
      type={type || "text"}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      isInvalid={!!error}
      required={required}
      autoFocus={autoFocus}
    />
    {error && (
      <Form.Control.Feedback type="invalid">{error}</Form.Control.Feedback>
    )}
  </Form.Group>
);

export default FormInput;
