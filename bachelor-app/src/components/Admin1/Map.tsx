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

// import MapData from '../../geojson/admin_1_topojson.json'
type LoadAdmin1MapData = {
    LoadData?: typeof _LoadData
}

const url = "https://storage.googleapis.com/covid19-open-data/v3/location/"
const SEARCHTRENDS = SearchTrendsList.map((e) => e.slice(14).replaceAll("_", " "))

const MINDATE = "2020-01-01"
const MAXDATE = "2025-01-01"

export const LoadAdmin1MapData = ({ LoadData = _LoadData }: LoadAdmin1MapData) => {
    const country = useParams<string>()

    //Data
    const [data, setData] = useState<DataType[]>([]);
    const [worldData, setWorldData] = useState<GeoJsonProperties>();
    const [curGeoJson, setCurGeoJson] = useState<GeoJsonProperties | undefined>();
    const [curSearchTrend, setCurSearchTrend] = useState<keyof DataType>("search_trends_abdominal_obesity");
    const [startDate, setStartDate] = useState('2020-01-01');

    useEffect(() => {
        fetch('./admin_1_topojson.json', {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        }).then(d => {
            let temp = d.json()
            temp.then((w: Topology) => {


                // create and set GeoJson
                let countries: GeoJsonProperties = feature(w, w.objects.ne_10m_admin_1_states_provinces)
                setWorldData(countries)
            })
        })
    }, [])

    // Filter WorldData
    useMemo(() => {
        if (worldData) {
            let filteredWoldData: GeoJsonProperties = { type: worldData.type, features: [] };
            let filteredFeatures: Feature[] = [];

            for (let i = 0; i < worldData.features.length; i++) {
                let Feature = worldData.features[i];
                if (Feature.properties!.iso_a2.toLowerCase() === country.country!.toLowerCase()) {
                    filteredFeatures.push(Feature)
                }
            }
            filteredWoldData.features = filteredFeatures;
            setCurGeoJson(filteredWoldData);
        }
    }, [worldData, country])

    useMemo(() => {
        if (curGeoJson) {
            let locations: string[] = []
            for (let i = 0; i < curGeoJson.features.length; i++) {
                const element = curGeoJson.features[i];
                locations.push(element.properties.iso_3166_2)
            }
            LoadData(locations).then(d => setData(d))
        } else {
            setData([]);
        }
    }, [curGeoJson])


    function setSearchTrend(e: MouseEvent<HTMLOptionElement, MouseEvent> | ChangeEvent<HTMLSelectElement>) {
        //@ts-ignore
        let newValue = e.target.value;
        let newKey = `search_trends_${newValue.replaceAll(" ", "_")}`

        if (hasKey(data[0], newKey)) {
            setCurSearchTrend(newKey)
        }
    }

    function handleDateChange(event: React.ChangeEvent<HTMLInputElement>) {
        if (event.target.value < MINDATE) {
            setStartDate(MINDATE);
        }
        else if (event.target.value > MAXDATE) {
            setStartDate(MAXDATE);
        }
        else {
            setStartDate(event.target.value);
        }

    }

    return (
        <div id='main'>
            <div className='col-6'>
                <Form.Label><b>Search Trend:</b></Form.Label>
                <Form.Select onChange={(e) => setSearchTrend(e)} disabled={data.length === 0 ? true : false}>
                    {SEARCHTRENDS.map((SEARCHTREND) =>
                        <option key={SEARCHTREND} value={SEARCHTREND} className='suggestion'>{SEARCHTREND}</option>
                    )}
                </Form.Select>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <label htmlFor="startDate">Start Date:</label>
                    <input type="date" name="startDate" id="" min={MINDATE} max={MAXDATE} value={startDate}
                        onChange={(e) => handleDateChange(e)} />
                </div>
                {data.length === 0 ? <ProgressBar animated now={100} /> : <></>}
            </div>

            <div style={{ position: "relative" }} className='plot-container'>
                <DrawAdmin1Map GeoJson={curGeoJson} country={country.country ? country.country : ""} DataTypeProperty={curSearchTrend} Data={data} Date={startDate} adminLvl={1} height={500} width={800}/>
            </div>
            <div>
                <PlotsContainer Plots={[]} />
            </div>
        </div>
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


export default LoadAdmin1MapData;