import React, { useEffect, useState } from 'react'
import Tab from 'react-bootstrap/esm/Tab';
import Tabs from 'react-bootstrap/esm/Tabs';
import SelectCountry, { TagExtended } from '../CountrySelector/SelectCountry';
import { LoadData as _LoadData } from '../DataContext/LoadData';
import { DataType } from '../DataContext/MasterDataType';
import Epidemiology from '../EpidemiologyContext/Epidemiology';
import SearchTrends from '../SearchTrends/SearchTrends';
import SearchTrendsData from '../SearchTrends/SearchTrendsData';
import Vaccinations from '../Vaccinations/Vaccinations';


interface Props {
    LoadData?: typeof _LoadData
}

const H_SCALE = 0.45
const W_SCALE = 0.55

export const GraphPage = ({ LoadData = _LoadData }: Props) => {
    const [key, setKey] = useState<string>('epidemiology');

    const [Data, setData] = useState<DataType[]>([])
    const [LoadedCountries, setLoadedCountries] = useState<TagExtended[]>([]);
    const [Countries, setCountries] = useState<TagExtended[]>([]);

    const [windowDimensions, setWindowDimensions] = useState({ width: window.innerWidth * W_SCALE, height: window.innerHeight * H_SCALE });
    //get window size
    useEffect(() => {
        window.addEventListener("resize", () => setWindowDimensions({ width: window.innerWidth * W_SCALE, height: window.innerHeight * H_SCALE }));
        return () => window.removeEventListener("resize", () => setWindowDimensions({ width: window.innerWidth * W_SCALE, height: window.innerHeight * H_SCALE }));
    }, []);

    const selectedCountries = (countries: TagExtended[]) => {
        setCountries(countries)
    };

    useEffect(() => {
        LoadData(Countries, LoadedCountries, Data).then((d) => {
            setData(d);

            setLoadedCountries(JSON.parse(JSON.stringify(Countries)));
        })
    }, [Countries]);

    return (
        <>

            {key === "searchtrends" ?
                < SelectCountry selectedCountries={selectedCountries} LoadCountries={SearchTrendsData} />
                :
                <SelectCountry selectedCountries={selectedCountries} />
            }

            <br></br>

            <Tabs activeKey={key} onSelect={(key) => {
                setKey(key!)
            }
            } className="mb-3">
                <Tab eventKey="epidemiology" title="Epidemiology">
                    <Epidemiology Data={Data} WindowDimensions={windowDimensions} />
                </Tab>
                <Tab eventKey="searchtrends" title="Search Trends">
                    <SearchTrends />
                </Tab>
                <Tab eventKey="vaccinations" title="Vaccinations">
                    <Vaccinations Data={Data} WindowDimensions={windowDimensions} />
                </Tab>
            </Tabs>

        </>
    );
}

