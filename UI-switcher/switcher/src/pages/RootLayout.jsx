import { Container } from "react-bootstrap";
import { Outlet } from "react-router-dom";

export default function RootLayout() {
  return (
    <Container fluid className="d-flex flex-column vh-100 p-2 overflow-hidden">
      <Outlet />
    </Container>
  );
}
