import { Children, useEffect, useState } from 'react'
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
import { Tag } from 'react-tag-autocomplete';


interface Props {
    LoadDataAsMap?: typeof _LoadDataAsMap
    LoadIndex?: typeof _LoadIndex
}

const H_SCALE = 0.45
const W_SCALE = 0.8

export const GraphPage = ({ LoadDataAsMap = _LoadDataAsMap, LoadIndex = _LoadIndex }: Props) => {
    const [key, setKey] = useState<string>('epidemiology');

    const [mapData, setMapData] = useState<Map<string, DataType[]>>(new Map());
    const [indexMap, setIndexMap] = useState<Map<string, IMap>>(new Map());
    const [LoadedCountries, setLoadedCountries] = useState<TagExtended[]>([]);
    const [SelectedLocations, setSelectedLocations] = useState<TagExtended[]>([]);

    const [WindowDimensions, setWindowDimensions] = useState({ width: window.innerWidth * W_SCALE, height: window.innerHeight * H_SCALE });
    //get window size
    useEffect(() => {
        window.addEventListener("resize", () => setWindowDimensions({ width: window.innerWidth * W_SCALE, height: window.innerHeight * H_SCALE }));
        return () => window.removeEventListener("resize", () => setWindowDimensions({ width: window.innerWidth * W_SCALE, height: window.innerHeight * H_SCALE }));
    }, []);

    const selectedCountries = (countries: TagExtended[], ADMINLVL: 0 | 1 | 2) => {
        // when user selects a country
        // need to find the regions belonging to that country

        setSelectedLocations(countries)

    };

    useEffect(() => {
        let locationKeys: string[] = []
        SelectedLocations.forEach(element => {
            locationKeys.push(element.location_key)
        });

        LoadDataAsMap(locationKeys, mapData).then((d) => {
            setMapData(d);
            setLoadedCountries(SelectedLocations);
        })
    }, [SelectedLocations]);

    useEffect(() => {
        LoadIndex().then((d) => {
            setIndexMap(d);

        })
    }, [])

    const filterLocations = (ADMINLVL: 0 | 1 | 2): { location_key: string, name: string }[] => {

        let countries: { location_key: string, name: string }[] = []

        if (ADMINLVL === 0) {
            //  TODO: fix so we dont search for countries
            for (let entry of Array.from(indexMap.entries())) {
                let key = entry[0];
                let value = entry[1];
                if (key.split("_").length === 1) {
                    countries.push({ location_key: key, name: value.name })
                }
            }
        } else {
            SelectedLocations.forEach((location => {
                if (location.location_key.split("_").length === ADMINLVL){
                    let entry = indexMap.get(location.location_key)
                    entry!.children.forEach(child=>{
                    let childEntry = indexMap.get(child);

                    countries.push({ location_key: child, name: childEntry!.name })

                    })
                    
                }

            }))

        }
        return countries


    }


    return (
        <>
            <SelectCountry selectedRegions={selectedCountries} Key={key} ADMINLVL={0} suggs={filterLocations(0)} />
            <SelectCountry selectedRegions={selectedCountries} Key={key} ADMINLVL={1} suggs={filterLocations(1)} />
            <SelectCountry selectedRegions={selectedCountries} Key={key} ADMINLVL={2} suggs={filterLocations(2)} />

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
                    {SelectedLocations.length === 0 ?
                        <div>
                            <h2>Please select a location</h2>
                        </div>
                        :
                        <>
                            <Tab.Pane eventKey="Epidemiology">
                                <Epidemiology MapData={mapData} WindowDimensions={WindowDimensions} />
                            </Tab.Pane>
                            <Tab.Pane eventKey="SearchTrends">
                                <SearchTrends MapData={mapData} SelectedCountries={SelectedLocations} />
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



export interface IMap {
    children: string[]
    name: string,

}

const url = "https://storage.googleapis.com/covid19-open-data/v3/index.csv"

export const _LoadIndex = () => {
    return new Promise<Map<string, IMap>>((resolve) => {
        let IndexMap = new Map<string, IMap>();
        csv(url).then(d => {
            d.forEach((element) => {
                let keyLength = element.location_key!.split("_").length
                let name = element.country_name;
                if (keyLength !== 1){
                    name = element[`subregion${keyLength-1}_name`]
                }

                IndexMap.set(element.location_key!, { children: [], name: name! })

                //  find parent element, and add self to children of parent 
                let parent: string[] = element.location_key!.split("_").slice(0, -1);
                if (parent.length > 0) {
                    let parentKey = parent.join("_");
                    let parentEntry = IndexMap.get(parentKey)!;
                    parentEntry.children.push(element.location_key!)
                }

            });
            resolve(IndexMap);
        });
    })
}

