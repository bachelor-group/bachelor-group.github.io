import React, { useState } from "react";
import { Container, Nav, Navbar, NavDropdown } from "react-bootstrap";
import { FaGithub } from 'react-icons/fa';

function NavbarC() {
  const [epidemiologyList] = useState(
    [
      "Cases", "Deaths", "Hospitalizations"
    ]
  )
  return <>
    <Navbar collapseOnSelect expand="lg" bg="dark" variant="dark">
      <Container>
        <Navbar.Brand href="/">Covid Visualizer</Navbar.Brand>
        <Navbar.Toggle aria-controls="responsive-navbar-nav" />
        <Navbar.Collapse id="responsive-navbar-nav">
          <Nav className="me-auto">
            <NavDropdown title="Epidemiology" id="collasible-nav-dropdown" >
              {epidemiologyList.map((item, i) => <NavDropdown.Item key={i} href={item}>{item}</NavDropdown.Item>)}
              <NavDropdown.Divider />
              <NavDropdown.Item href="/Scatter">Scatter</NavDropdown.Item>
            </NavDropdown>
            <Nav.Link href="/Searchtrends">Search Trends</Nav.Link>
            <Nav.Link href="/Vaccinations">Vaccination</Nav.Link>
            <Nav.Link href="/Mobility">Mobility</Nav.Link>
          </Nav>
          <Nav>
            <Nav.Link href="/About">About</Nav.Link>
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