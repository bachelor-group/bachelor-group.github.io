import React, { useEffect, useState } from 'react'
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
const W_SCALE = 0.55

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

            <Tabs activeKey={key} onSelect={(key) => {
                setKey(key!)
            }
            } className="mb-3">
                <Tab eventKey="epidemiology" title="Epidemiology">
                    <Epidemiology Data={Data} WindowDimensions={WindowDimensions} />
                </Tab>
                <Tab eventKey="searchtrends" title="Search Trends">
                    <SearchTrends Data={Data} SelectedCountries={SelectedCountries}/>
                </Tab>
                <Tab eventKey="vaccinations" title="Vaccinations">
                    <Vaccinations Data={Data} WindowDimensions={WindowDimensions} />
                </Tab>
                <Tab eventKey="customgraphs" title="Custom Graphs">
                    <CustomGraphs Data={Data} WindowDimensions={WindowDimensions} />
                </Tab>
            </Tabs>

        </>
    );
}


