import './App.css';
import NavbarC from './components/Navbar';
import LoadMapData from './components/MapPage/MapPage';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Epidemiology from './components/EpidemiologyContext/Epidemiology';
import SearchTrends from './components/SearchTrends/SearchTrends';
import { SearchTrendsMap } from './components/SearchTrendsMap/SearchTrendsMapPage';
import SidebarC from "./components/Sidebar";
import Vaccinations from './components/Vaccinations/Vaccinations';

function App() {
  let DummyData = [
    {
      title: 'Home',
      path: '/',
      cName: 'nav-text'
    },
    {
      title: 'Reports',
      path: '/reports',
      cName: 'nav-text'
    },
    {
      title: 'Products',
      path: '/products',
      cName: 'nav-text'
    }
  ]
  return (
    <>
      <Router basename='/'>
        <NavbarC />
        <Routes>
          <Route path="/" element={<LoadMapData />} />
          <Route path="/Searchtrends" element={<SearchTrends />} />
          <Route path="/EpidemiologyPlots" element={<Epidemiology />} />
          <Route path="/SearchTrendsMap/:country" element={<SearchTrendsMap />} />
          <Route path="/Vaccinations" element={<Vaccinations />} />
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

    </>
  );
}

export default App;
