import { Container, Nav, Navbar } from "react-bootstrap";
import { FaGithub } from 'react-icons/fa';

function NavbarC() {
  return <>
    <Navbar collapseOnSelect expand="lg" bg="dark" variant="dark">
      <Container>
        <Navbar.Brand href="/">Covid Visualizer</Navbar.Brand>
        <Navbar.Toggle aria-controls="responsive-navbar-nav" />
        <Navbar.Collapse id="responsive-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link href="/">Map</Nav.Link>
            <Nav.Link href="#/Graphs">Graphs</Nav.Link>
          </Nav>
          <Nav>
            <Nav.Link href="#/About">About</Nav.Link>
            <Nav.Link href="https://github.com/bachelor-group/visualizing-covid-search-trends">
              <FaGithub />
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  </>
}

export default NavbarC;