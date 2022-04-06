import { csv } from 'd3';
import { useEffect, useState, useMemo } from 'react'
import { feature } from 'topojson';
import { Topology } from 'topojson-specification'
import { GeoJsonProperties, Feature } from "geojson";
import { ProgressBar } from 'react-bootstrap';
import { DataType } from '../DataContext/MasterDataType';
import { SearchTrendsList } from '../SearchTrends/Old_script';
import { DrawMap } from './DrawMap';
import Translater from './helpers';


// import MapData from '../../geojson/admin_1_topojson.json'
type MapProps = {
    adminLvl: 0 | 1 | 2,
    data: Map<string, DataType[]>,
    innerData?: boolean,
    country?: string,
    Date: string,
    DataTypeProperty: keyof DataType,
    height: number,
    width: number,
    scalePer100k?: boolean,
    loadedData: (Data: Map<string, DataType[]>) => void
    LoadData?: typeof _LoadSmallData,
}

const url = "https://storage.googleapis.com/covid19-open-data/v3/location/"
const SEARCHTRENDS = SearchTrendsList.map((e) => e.slice(14).replaceAll("_", " "))

const MINDATE = "2020-01-01"
const MAXDATE = "2025-01-01"


export const MapComponent = ({ adminLvl, data, innerData = false, country, Date, DataTypeProperty, height, width, scalePer100k = false, loadedData, LoadData = _LoadSmallData }: MapProps) => {
    const translater = new Translater(adminLvl);

    //Data
    // const [data, setData] = useState<Map<string, DataType[]>>(new Map());
    const [worldData, setWorldData] = useState<GeoJsonProperties>();
    const [curGeoJson, setCurGeoJson] = useState<GeoJsonProperties | undefined>();
    const [innerGeoJson, setInnerGeoJson] = useState<GeoJsonProperties | undefined>();

    //Load GeoJson
    useEffect(() => {
        fetch(`./admin_${adminLvl}_topojson.json`, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        }).then(d => {
            let temp = d.json()
            temp.then((w: Topology) => {
                // create and set GeoJson
                let countries: GeoJsonProperties = feature(w, w.objects.features)
                setWorldData(countries)
            })
        })

        if (innerData && adminLvl < 2) {
            fetch(`./admin_${adminLvl + 1}_topojson.json`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            }).then(d => {
                let temp = d.json()
                temp.then((w: Topology) => {
                    // create and set GeoJson
                    let countries: GeoJsonProperties = feature(w, w.objects.features)
                    setInnerGeoJson(countries)
                })
            })
        }
    }, [])

    // Filter WorldData
    useMemo(() => {
        if (worldData) {
            if (country) {
                let filteredWoldData: GeoJsonProperties = { type: worldData.type, features: [] };
                let filteredFeatures: Feature[] = [];

                for (let i = 0; i < worldData.features.length; i++) {
                    let Feature = worldData.features[i];
                    if (translater.countryCode(Feature).toLowerCase() === country.toLowerCase()) {
                        filteredFeatures.push(Feature)
                    }
                }
                filteredWoldData.features = filteredFeatures;
                setCurGeoJson(filteredWoldData);
            } else {
                setCurGeoJson(worldData);
            }
        }
    }, [worldData, country])


    //Load FilteredData
    useMemo(() => {
        if (curGeoJson) {
            let locations: string[] = []
            for (let i = 0; i < curGeoJson.features.length; i++) {
                const element = curGeoJson.features[i];
                locations.push(translater.locationCode(element))
            }
            LoadData(locations).then(d => {
                loadedData(d)
            })
        } else {
            loadedData(new Map());
        }
    }, [curGeoJson])

    return (
        <>
            {
                data.size === 0 ? <ProgressBar animated now={100}></ProgressBar>
                    :
                    <DrawMap GeoJson={curGeoJson} InnerGeoJsonProp={innerGeoJson} country={country} DataTypeProperty={DataTypeProperty} Data={data} CurDate={Date} adminLvl={adminLvl} height={height} width={width} scalePer100K={scalePer100k} />
            }
        </>
    );
}

const _LoadSmallData = (locations: string[]) => {
    let temp: Map<string, DataType[]> = new Map();
    return new Promise<Map<string, DataType[]>>((resolve) => {
        // csv("https://storage.googleapis.com/covid-data-minimized/cases.csv").then(d => {
        csv("cases.csv").then(d => {

            for (let i = 0; i < d.length; i++) {
                const element = d[i];

                if (temp.has(element["location_key"]!)) {
                    let list = temp.get(element["location_key"]!)!;
                    list.push(element)
                    temp.set(element["location_key"]!, list)
                }
                else {
                    temp.set(element["location_key"]!, [element])
                }
            }

            resolve(temp)
        })

    });
}

export default MapComponent;