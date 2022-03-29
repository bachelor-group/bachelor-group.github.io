import { csv, json } from 'd3';
import { useEffect, useState, MouseEvent, ChangeEvent, useMemo } from 'react'
import { feature } from 'topojson';
import { Topology } from 'topojson-specification'
import { GeoJsonProperties, Feature, GeometryCollection, GeometryObject, FeatureCollection } from "geojson";
import DrawAdmin1Map from './DrawMap';
import { useParams } from 'react-router-dom';
import PlotsContainer from '../EpidemiologyContext/PlotsContainer';
import { Form, ProgressBar } from 'react-bootstrap';
import { DataType } from '../DataContext/MasterDataType';
import { hasKey } from '../DataContext/DataTypes';
import { SearchTrendsList } from '../SearchTrends/Old_script';
import { DrawMap } from './DrawMap';
import Translater from './helpers';



// import MapData from '../../geojson/admin_1_topojson.json'
type MapProps = {
    adminLvl: 0 | 1 | 2,
    innerData?: boolean,
    country?: string,
    Date: string,
    DataTypeProperty: keyof DataType,
    height: number,
    width: number,
    loadedData?: (Data: DataType[]) => void
    LoadData?: typeof _LoadData,
}

const url = "https://storage.googleapis.com/covid19-open-data/v3/location/"
const SEARCHTRENDS = SearchTrendsList.map((e) => e.slice(14).replaceAll("_", " "))

const MINDATE = "2020-01-01"
const MAXDATE = "2025-01-01"


export const MapComponent = ({ adminLvl, innerData = false, country, Date, DataTypeProperty, height, width, loadedData, LoadData = _LoadData }: MapProps) => {
    // let helperObject = newHelperObject(adminLvl);
    const translater = new Translater(adminLvl);

    //Data
    const [data, setData] = useState<DataType[]>([]);
    const [worldData, setWorldData] = useState<GeoJsonProperties>();
    const [curGeoJson, setCurGeoJson] = useState<GeoJsonProperties | undefined>();
    const [innerGeoJson, setInnerGeoJson] = useState<GeoJsonProperties | undefined>();
    const [curSearchTrend, setCurSearchTrend] = useState<keyof DataType>("search_trends_abdominal_obesity");
    // const [startDate, setStartDate] = useState('2020-01-01');


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
                    // console.log(countries)
                })
            })
        }
    }, [])

    // Filter WorldData
    useMemo(() => {
        if (worldData) {
            if (country) {
                console.log(worldData)
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
                setData(d)
                if (loadedData) {
                    loadedData(d)
                }
            })
        } else {
            setData([]);
        }
    }, [curGeoJson])

    return (
        <>
            {
                data.length === 0 ? <ProgressBar animated now={100}></ProgressBar>
                    :
                    <DrawMap GeoJson={curGeoJson} InnerGeoJsonProp={innerGeoJson} country={country} DataTypeProperty={DataTypeProperty} Data={data} CurDate={Date} adminLvl={adminLvl} height={height} width={width} />
            }
        </>
    );
}

const _LoadData = (locations: string[]) => {
    return new Promise<DataType[]>((resolve) => {
        let newData: DataType[] = []
        let loaded_location = 0
        locations.forEach((location) => {
            csv(url + location.replaceAll("-", "_") + ".csv").then(d => {
                d.forEach(element => {
                    newData.push(element)
                });
                loaded_location++
                if (locations.length === loaded_location) {
                    resolve(newData);
                }
            }).catch((error) => {
                loaded_location++
                if (locations.length === loaded_location) {
                    resolve(newData);
                }
            }
            );
        });
    });
}


export default MapComponent;