import { Form } from "react-bootstrap";

export default function FormSelect({
  label,
  error,
  required,
  setValue,
  children,
}) {
  return (
    <Form.Group className="mb-3">
      {label && <Form.Label>{label}</Form.Label>}
      <Form.Select
        required={required}
        defaultValue={""}
        onChange={(event) => setValue(event.target.value)}
        data-testid="select"
      >
        {children}
      </Form.Select>
      {error && (
        <Form.Control.Feedback type="invalid">{error}</Form.Control.Feedback>
      )}
    </Form.Group>
  );
}
