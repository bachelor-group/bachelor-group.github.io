import './App.css';
import NavbarC from './components/Navbar';
import LoadMapData from './components/DrawMap/Map';
import { HashRouter  as Router, Routes, Route} from 'react-router-dom';
import Epidemiology from './components/EpidemiologyContext/Epidemiology';
import SearchTrends from './components/SearchTrends/SearchTrends';
import LoadAdmin1MapData from './components/Admin1/Map';

function App() {
  return (
    <Router basename='/'>
      <NavbarC />
      <Routes>
        <Route path="/" element={<LoadMapData />} />
        <Route path="/Searchtrends" element={<SearchTrends/>} />
        <Route path="/EpidemiologyPlots" element={<Epidemiology/>} />
        <Route path="/Admin1" element={<LoadAdmin1MapData/>} />
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
