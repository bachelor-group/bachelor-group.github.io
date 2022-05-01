import { useEffect, useState } from 'react'
import { csv } from "d3";
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
    LoadIndex?: typeof _LoadIndex
}

const H_SCALE = 0.45
const W_SCALE = 0.8

export const GraphPage = ({ LoadDataAsMap = _LoadDataAsMap, LoadIndex = _LoadIndex }: Props) => {
    const [key, setKey] = useState<string>('epidemiology');

    const [mapData, setMapData] = useState<Map<string, DataType[]>>(new Map());
    const [indexMap, setIndexMap] = useState<Map<string, IMap[]>>(new Map());
    const [subRegions, setSubRegions] = useState<Map<string, IMap[]>>(new Map());
    const [LoadedCountries, setLoadedCountries] = useState<TagExtended[]>([]);
    const [SelectedCountries, setSelectedCountries] = useState<TagExtended[]>([]);
    const [WindowDimensions, setWindowDimensions] = useState({ width: window.innerWidth * W_SCALE, height: window.innerHeight * H_SCALE });
    //get window size
    useEffect(() => {
        window.addEventListener("resize", () => setWindowDimensions({ width: window.innerWidth * W_SCALE, height: window.innerHeight * H_SCALE }));
        return () => window.removeEventListener("resize", () => setWindowDimensions({ width: window.innerWidth * W_SCALE, height: window.innerHeight * H_SCALE }));
    }, []);

    const selectedCountries = (countries: TagExtended[]) => {
        // when user selects a country
        // need to find the regions belonging to that country
        let newMap: Map<string, IMap[]> = new Map();

        setSelectedCountries(countries)
        console.log(indexMap)

        countries.forEach(country => {
            let allSubRegions: IMap[] = indexMap.get(country.location_key!)!
            console.log(allSubRegions)
            // allSubRegions.push ( {location_key: country.location_key, subregion1_name: indexMap.get(country.location_key!)!.subregion1_name } )
            newMap.set(country.location_key, allSubRegions)
            setSubRegions(newMap)
            console.log("subregion map", subRegions)
        })
    };

    useEffect(() => {
        let locationKeys: string[] = []
        SelectedCountries.forEach(element => {
            locationKeys.push(element.location_key)
        });
        LoadIndex().then((d) => {
            setIndexMap(d);

        })

        LoadDataAsMap(locationKeys, mapData).then((d) => {
            setMapData(d);
            setLoadedCountries(SelectedCountries);
        })
    }, [SelectedCountries]);

    return (
        <>
            <SelectCountry selectedCountries={selectedCountries} Key={key} suggs={indexMap} />
            <SelectCountry selectedCountries={selectedCountries} Key={key} suggs={subRegions} />

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

                <Tab.Content style={{ margin: "auto" }}>
                    {SelectedCountries.length === 0 ?
                        <div>
                            <h2>Please select a location</h2>
                        </div>
                        :
                        <>
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
                        </>
                    }
                </Tab.Content>
            </Tab.Container>

        </>
    );
}

const url = "https://storage.googleapis.com/covid19-open-data/v3/index.csv"

export interface IMap {
    location_key: string,
    country_name?: string,
    subregion2_name?: string,
    subregion1_name?: string
}

export const _LoadIndex = () => {
    return new Promise<Map<string, IMap[]>>((resolve) => {
        let IndexMap = new Map<string, IMap[]>();
        csv(url).then(d => {
            d.forEach((element) => {
                if (IndexMap.has(element.country_code!)) {
                    let list: IMap[] = []
                    list = IndexMap.get(element.country_code!)!

                    if (element.location_key!.split("_").length == 2) { // SUBREGION 1

                        list.push({ location_key: element.location_key!, subregion1_name: element.subregion1_name! })

                    } else if (element.location_key!.split("_").length == 3) { // SUBREGION 2

                        list.push({ location_key: element.location_key!, subregion2_name: element.subregion2_name! })
                    }

                    IndexMap.set(element.country_code!, list)
                } else {

                    // only countries:
                    IndexMap.set(element.country_code!, [{ country_name: element.country_name!, location_key: element.location_key! }] as IMap[])
                }
            });
            resolve(IndexMap);
        });
    })
}
