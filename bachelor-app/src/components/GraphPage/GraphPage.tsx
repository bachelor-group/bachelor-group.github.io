import { useEffect, useState } from 'react'
import { Nav } from 'react-bootstrap';
import Tab from 'react-bootstrap/esm/Tab';
import SelectCountry, { TagExtended } from '../CountrySelector/SelectCountry';
import { LoadDataAsMap as _LoadDataAsMap } from '../DataContext/LoadData';
import { DataType } from '../DataContext/MasterDataType';
import Epidemiology from '../EpidemiologyContext/Epidemiology';
import SearchTrends from '../SearchTrends/SearchTrends';
import Vaccinations from '../Vaccinations/Vaccinations';
import CustomGraphs from './CustomGraphs';


interface Props {
    LoadDataAsMap?: typeof _LoadDataAsMap
}

const H_SCALE = 0.45
const W_SCALE = 0.8

export const GraphPage = ({ LoadDataAsMap = _LoadDataAsMap }: Props) => {
    const [key, setKey] = useState<string>('epidemiology');

    const [mapData, setMapData] = useState<Map<string, DataType[]>>(new Map());
    const [LoadedCountries, setLoadedCountries] = useState<TagExtended[]>([]);
    const [SelectedCountries, setSelectedCountries] = useState<TagExtended[]>([]);
    const [WindowDimensions, setWindowDimensions] = useState({ width: window.innerWidth * W_SCALE, height: window.innerHeight * H_SCALE });
    //get window size
    useEffect(() => {
        window.addEventListener("resize", () => setWindowDimensions({ width: window.innerWidth * W_SCALE, height: window.innerHeight * H_SCALE }));
        return () => window.removeEventListener("resize", () => setWindowDimensions({ width: window.innerWidth * W_SCALE, height: window.innerHeight * H_SCALE }));
    }, []);

    const selectedCountries = (countries: TagExtended[]) => {
        setSelectedCountries(countries)
    };

    useEffect(() => {
        let locationKeys: string[] = []
        SelectedCountries.forEach(element => {
            locationKeys.push(element.location_key)
        });

        LoadDataAsMap(locationKeys, mapData).then((d) => {
            setMapData(d);
            setLoadedCountries(SelectedCountries);
        })
    }, [SelectedCountries]);

    return (
        <>
            <SelectCountry selectedCountries={selectedCountries} Key={key} />

            <br></br>

            <Tab.Container defaultActiveKey={"Epidemiology"} onSelect={(key) => { setKey(key!) }}>
                <Nav justify variant="tabs">
                    <Nav.Item>
                        <Nav.Link eventKey="Epidemiology">
                            Epidemiology
                        </Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                        <Nav.Link eventKey="SearchTrends">
                            Search Trends
                        </Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                        <Nav.Link eventKey="Vaccinations">
                            Vaccinations
                        </Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                        <Nav.Link eventKey="CustomGraphs">
                            Custom Graphs
                        </Nav.Link>
                    </Nav.Item>
                </Nav>

                <Tab.Content>
                    <Tab.Pane eventKey="Epidemiology">
                        <Epidemiology MapData={mapData} WindowDimensions={WindowDimensions} />
                    </Tab.Pane>
                    <Tab.Pane eventKey="SearchTrends">
                        <SearchTrends MapData={mapData} SelectedCountries={SelectedCountries} />
                    </Tab.Pane>
                    <Tab.Pane eventKey="Vaccinations">
                        <Vaccinations MapData={mapData} WindowDimensions={WindowDimensions} />
                    </Tab.Pane>
                    <Tab.Pane eventKey="CustomGraphs">
                        <CustomGraphs MapData={mapData} WindowDimensions={WindowDimensions} />
                    </Tab.Pane>
                </Tab.Content>
            </Tab.Container>

        </>
    );
}
