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



    return (
        <>
            <SelectCountry SelectedRegions={(countries: TagExtended[])=>setSelectedLocations(countries)} SelectedLocations={SelectedLocations} Key={key} ADMINLVL={0} AllLocations={indexMap} />
            <SelectCountry SelectedRegions={(countries: TagExtended[])=>setSelectedLocations(countries)} SelectedLocations={SelectedLocations} Key={key} ADMINLVL={1} AllLocations={indexMap} />
            <SelectCountry SelectedRegions={(countries: TagExtended[])=>setSelectedLocations(countries)} SelectedLocations={SelectedLocations} Key={key} ADMINLVL={2} AllLocations={indexMap} />

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

