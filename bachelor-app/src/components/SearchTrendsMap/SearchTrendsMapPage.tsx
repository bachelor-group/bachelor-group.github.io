import { csv, json } from 'd3';
import { useEffect, useState, MouseEvent, ChangeEvent, useMemo } from 'react'
import { feature } from 'topojson';
import { Topology } from 'topojson-specification'
import { GeoJsonProperties, Feature, GeometryCollection, GeometryObject, FeatureCollection } from "geojson";
import { useParams } from 'react-router-dom';
import PlotsContainer from '../EpidemiologyContext/PlotsContainer';
import { Form, ProgressBar } from 'react-bootstrap';
import { DataType } from '../DataContext/MasterDataType';
import { hasKey } from '../DataContext/DataTypes';
import { SearchTrendsList } from '../SearchTrends/Old_script';
import { MapComponent } from '../Map/Map';

// import MapData from '../../geojson/admin_1_topojson.json'
type SearchTrendsMap = {
    LoadData?: typeof _LoadData
}

const url = "https://storage.googleapis.com/covid19-open-data/v3/location/"
const SEARCHTRENDS = SearchTrendsList.map((e) => e.slice(14).replaceAll("_", " "))

const MINDATE = "2020-01-01"
const MAXDATE = "2025-01-01"

const ADMINLVL = 1;

export const SearchTrendsMap = ({ LoadData = _LoadData }: SearchTrendsMap) => {
    const country = useParams<string>()

    //Data
    const [data, setData] = useState<DataType[]>([]);
    const [worldData, setWorldData] = useState<GeoJsonProperties>();
    const [curGeoJson, setCurGeoJson] = useState<GeoJsonProperties | undefined>();
    const [curSearchTrend, setCurSearchTrend] = useState<keyof DataType>("search_trends_abdominal_obesity");
    const [startDate, setStartDate] = useState('2020-01-01');

    function setSearchTrend(e: MouseEvent<HTMLOptionElement, MouseEvent> | ChangeEvent<HTMLSelectElement>) {
        //@ts-ignore
        let newValue = e.target.value;
        let newKey = `search_trends_${newValue.replaceAll(" ", "_")}`
        let temp: DataType[] = []

        // CHECK IF STRING IS KEY NEEDS TO BE DONE
        // @ts-ignore
        setCurSearchTrend(newKey)

        // Old method of keys...
        // if (hasKey(temp[0], newKey)) {
        //     setCurSearchTrend(newKey)
        // }
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
                <Form.Select onChange={(e) => setSearchTrend(e)}>
                    {/* //disabled={data.length === 0 ? true : false}> */}
                    {SEARCHTRENDS.map((SEARCHTREND) =>
                        <option key={SEARCHTREND} value={SEARCHTREND} className='suggestion'>{SEARCHTREND}</option>
                    )}
                </Form.Select>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <label htmlFor="startDate">Start Date:</label>
                    <input type="date" name="startDate" id="" min={MINDATE} max={MAXDATE} value={startDate}
                        onChange={(e) => handleDateChange(e)} />
                </div>
                {/* {data.length === 0 ? <ProgressBar animated now={100} /> : <></>} */}
            </div>

            <div style={{ position: "relative" }} className='plot-container'>
                <MapComponent country={country.country ? country.country : ""} DataTypeProperty={curSearchTrend} adminLvl={ADMINLVL} Date={startDate} height={500} width={800} LoadData={_LoadData} />
            </div>
        </div>
    );
}

const _LoadData = (locations: string[]) => {
    return new Promise<Map<string, DataType[]>>((resolve) => {
        let newData: Map<string, DataType[]> = new Map();
        let loaded_location = 0
        locations.forEach((location) => {
            csv(url + location.replaceAll("-", "_") + ".csv").then(d => {
                newData.set(location.replaceAll("-", "_"), d)
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


export default SearchTrendsMap;