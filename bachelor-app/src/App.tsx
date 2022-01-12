import './App.css';
import NavbarC from './components/Navbar';
import LoadMapData from './components/DrawMap/Map';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Scatter from './components/Graphs/Scatter';
import Epidemiology from './components/EpidemiologyContext/Epidemiology';

function App() {
  return (
    <Router>
      <NavbarC />
      <Routes>
        <Route path="/" element={<LoadMapData />} />
        <Route path="/Searchtrends" element={<h1>Search Trends</h1>} />
        <Route path="/Scatter" element={<Epidemiology/>} />
        <Route path="/Vaccinations" element={<h1>Vaccinations</h1>} />
        <Route path="/Mobility" element={<h1>Mobility</h1>} />
        <Route path="/About" element={<h1>About</h1>} />

        <Route path="*" element=
          {
            <>
              <h1>Error</h1>
              <br />
              <h3>Route does not exist</h3>
            </>
          }
        />

      </Routes>
    </Router>
  );
}

export default App;
