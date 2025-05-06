import { Button } from "react-bootstrap";

export default function FormButton({ text }) {
  return (
    <Button variant="primary" type="submit">
      {text}
    </Button>
  );
}
