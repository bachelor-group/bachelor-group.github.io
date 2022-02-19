import { json, csv } from 'd3';
import { useEffect, useMemo, useState, MouseEvent, ChangeEvent } from 'react'
import { feature } from 'topojson';
import { Topology } from 'topojson-specification'
import { GeoJsonProperties, Feature } from "geojson";
// import DrawMap from './DrawMap';
import { iso31662, iso31661Alpha2ToNumeric, ISO31662Entry } from 'iso-3166'
import { DateHistogram, EpidemiologyMinimum } from './DateHistogram';
import DrawMap, { DrawAdmin1Map } from '../Admin1/DrawMap';
import { useParams } from 'react-router-dom';
import { SearchTrendsList } from '../SearchTrends/Old_script';
import { DataType } from '../DataContext/MasterDataType';
import { hasKey } from '../DataContext/DataTypes';
import { Form, ProgressBar } from 'react-bootstrap';

const width: number = window.innerWidth;
const height: number = window.innerHeight - 56;
const dateHistogramSize: number = 0.2;

type LoadAdmin1MapData = {
    LoadData?: typeof _LoadData
}

const url = "https://storage.googleapis.com/covid19-open-data/v3/location/"
const SEARCHTRENDS = SearchTrendsList.map((e) => e.slice(14).replaceAll("_", " "))

const MINDATE = "2020-01-01"
const MAXDATE = "2025-01-01"

export const LoadMapData = ({ LoadData = _LoadData }: LoadAdmin1MapData) => {

    //Data
    const [data, setData] = useState<DataType[]>([]);
    const [worldData, setWorldData] = useState<GeoJsonProperties>();
    const [curGeoJson, setCurGeoJson] = useState<GeoJsonProperties | undefined>();
    const [curSearchTrend, setCurSearchTrend] = useState<keyof DataType>("search_trends_abdominal_obesity");
    const [startDate, setStartDate] = useState('2022-01-01');
    const [HistogramData, setHistogramData] = useState<EpidemiologyMinimum[]>([]);

    useEffect(() => {
        fetch('./admin_0_countries.json', {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        }).then(d => {
            let temp = d.json()
            temp.then((w: Topology) => {
                // create and set GeoJson
                let countries: GeoJsonProperties = feature(w, w.objects.admin_0_countries)
                setWorldData(countries)
            })
        })
    }, [])

    // Filter WorldData
    useMemo(() => {
        if (worldData) {
            setCurGeoJson(worldData);
        }
    }, [worldData])

    useMemo(() => {
        if (curGeoJson) {
            let locations: string[] = []
            for (let i = 0; i < curGeoJson.features.length; i++) {
                const element = curGeoJson.features[i];
                // SEND THIS PROP IN :(
                if (element.properties.ISO_A2_EH !== "-99") locations.push(element.properties.ISO_A2_EH);
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

    // function handleDateChange(event: React.ChangeEvent<HTMLInputElement>) {
    //     if (event.target.value < MINDATE) {
    //         setStartDate(MINDATE);
    //     }
    //     else if (event.target.value > MAXDATE) {
    //         setStartDate(MAXDATE);
    //     }
    //     else {
    //         setStartDate(event.target.value);
    //     }

    // }

    useMemo(() => {
        if (data.length === 0) {
            return
        }
        var HistogramData = new Map<string, number>()
        data.forEach(d => {

            if (HistogramData.has(d.date!)) {
                if (!isNaN(parseInt(d.new_confirmed!))) {
                    HistogramData.set(d.date!, HistogramData.get(d.date!)! + parseInt(d.new_confirmed!))
                }

            } else {
                if (!isNaN(parseInt(d.new_confirmed!))) {
                    HistogramData.set(d.date!, parseInt(d.new_confirmed!))
                }
            }
        })
        let temp = Array.from(HistogramData, ([date, total_confirmed]) => ({ date, total_confirmed }))
        setHistogramData(temp);
    }, [data])

    function selectedDate(date: string) {
        setStartDate(date)
    }

    return (
        <div style={{ position: "relative" }}>
            <DrawAdmin1Map GeoJson={curGeoJson} country={""} DataTypeProperty={"new_confirmed"} Data={data} Date={startDate} adminLvl={0} width={width} height={height} />
            <svg style={{ position: "absolute", top: window.innerHeight - dateHistogramSize * window.innerHeight - 20, right: 0 }} width={width} >
                <DateHistogram
                    Data={HistogramData}
                    width={width}
                    height={dateHistogramSize * window.innerHeight}
                    selectedDate={selectedDate}
                />
            </svg>
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


export default LoadMapData;