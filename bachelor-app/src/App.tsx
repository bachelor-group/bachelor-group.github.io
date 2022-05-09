import './App.css';
import NavbarC from './components/Navbar';
import LoadMapData from './components/PageComponents/MapPage/MapPage';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { SearchTrendsMap } from './components/PageComponents/SearchTrendsMap/SearchTrendsMapPage';
import { GraphPage } from './components/PageComponents/GraphPage/GraphPage';

function App() {

  return (
    <>
      <Router basename='/'>
        <NavbarC />
        <Routes>
          <Route path="/" element={<LoadMapData />} />
          <Route path="/Graphs" element={<GraphPage />} />
          <Route path="/SearchTrendsMap/:country" element={<SearchTrendsMap />} />
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

    </>
  );
}

export default App;
