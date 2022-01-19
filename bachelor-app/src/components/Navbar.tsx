import React, { useState } from "react";
import { Container, Nav, Navbar, NavDropdown } from "react-bootstrap";
import { FaGithub } from 'react-icons/fa';
import { Link } from "react-router-dom";

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
              <NavDropdown.Item><Link to="/Scatter">Scatter</Link></NavDropdown.Item>
            </NavDropdown>
            <Nav.Link><Link to="/Searchtrends">Search Trends</Link></Nav.Link>
            <Nav.Link><Link to="/Vaccination">Vaccination</Link></Nav.Link>
            <Nav.Link><Link to="/Mobility">Mobility</Link></Nav.Link>
          </Nav>
          <Nav>
            <Nav.Link><Link to="/About">About</Link></Nav.Link>
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