import React, { useEffect, useState } from 'react'
import { Nav } from 'react-bootstrap';
import Tab from 'react-bootstrap/esm/Tab';
import Tabs from 'react-bootstrap/esm/Tabs';
import SelectCountry, { TagExtended } from '../CountrySelector/SelectCountry';
import { LoadData as _LoadData } from '../DataContext/LoadData';
import { DataType } from '../DataContext/MasterDataType';
import Epidemiology from '../EpidemiologyContext/Epidemiology';
import SearchTrends from '../SearchTrends/SearchTrends';
import Vaccinations from '../Vaccinations/Vaccinations';
import CustomGraphs from './CustomGraphs';


interface Props {
    LoadData?: typeof _LoadData
}

const H_SCALE = 0.45
const W_SCALE = 0.8

export const GraphPage = ({ LoadData = _LoadData }: Props) => {
    const [key, setKey] = useState<string>('epidemiology');

    const [Data, setData] = useState<DataType[]>([])
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
        LoadData(SelectedCountries, LoadedCountries, Data).then((d) => {
            setData(d);

            setLoadedCountries(JSON.parse(JSON.stringify(SelectedCountries)));
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
                        <Nav.Link eventKey="searchtrends">
                            Search Trends
                        </Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                        <Nav.Link eventKey="vaccinations">
                            Vaccinations
                        </Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                        <Nav.Link eventKey="customgraphs">
                            Custom Graphs
                        </Nav.Link>
                    </Nav.Item>
                </Nav>

                <Tab.Content>
                    <Tab.Pane eventKey="Epidemiology">
                        <Epidemiology Data={Data} WindowDimensions={WindowDimensions} />
                    </Tab.Pane>
                    <Tab.Pane eventKey="searchtrends">
                        <SearchTrends Data={Data} SelectedCountries={SelectedCountries} />
                    </Tab.Pane>
                    <Tab.Pane eventKey="vaccinations">
                        <Vaccinations Data={Data} WindowDimensions={WindowDimensions} />
                    </Tab.Pane>
                    <Tab.Pane eventKey="customgraphs">
                        <CustomGraphs Data={Data} WindowDimensions={WindowDimensions} />
                    </Tab.Pane>
                </Tab.Content>
            </Tab.Container>

        </>
    );
}


