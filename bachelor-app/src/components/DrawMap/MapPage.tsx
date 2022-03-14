import { json, csv } from 'd3';
import { useEffect, useMemo, useState, MouseEvent, ChangeEvent } from 'react'
import { feature } from 'topojson';
import { Topology } from 'topojson-specification'
import { GeoJsonProperties, Feature } from "geojson";
import { DateHistogram, EpidemiologyMinimum } from './DateHistogram';
import { SearchTrendsList } from '../SearchTrends/Old_script';
import { DataType } from '../DataContext/MasterDataType';
import { hasKey } from '../DataContext/DataTypes';
import { Form, ProgressBar } from 'react-bootstrap';
import { MapComponent } from '../Map/Map';

const width: number = window.innerWidth;
const height: number = window.innerHeight - 56;
const dateHistogramSize: number = 0.2;

type LoadAdmin1MapData = {
    LoadData?: typeof _LoadData
}

const url = "https://storage.googleapis.com/covid19-open-data/v3/location/"

const histogramUrl = "../../../public/csvData/total_confirmed.csv"

const SEARCHTRENDS = SearchTrendsList.map((e) => e.slice(14).replaceAll("_", " "))

const MINDATE = "2020-01-01"
const MAXDATE = "2025-01-01"

const ADMINLVL = 0;

export const LoadMapData = ({ LoadData = _LoadData }: LoadAdmin1MapData) => {

    //Data
    const [data, setData] = useState<DataType[]>([]);

    const [curGeoJson, setCurGeoJson] = useState<GeoJsonProperties | undefined>();
    const [curSearchTrend, setCurSearchTrend] = useState<keyof DataType>("new_confirmed");
    const [startDate, setStartDate] = useState('2022-01-01');
    const [HistogramData, setHistogramData] = useState<EpidemiologyMinimum[]>([]);


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


    useMemo(() => {
        var HistogramData = new Map<string, number>()
        csv("csvData/total_confirmed.csv").then(d => {
            d.forEach((row => {
                HistogramData.set(row["date"]!, parseInt(row["total_confirmed"]!))
            }))
            setHistogramData(Array.from(HistogramData, ([date, total_confirmed]) => ({ date, total_confirmed })));
        })
    }, [])

    function selectedDate(date: string) {
        setStartDate(date)
    }

    function loadedData(Data: DataType[]) {
        setData(Data);
    }

    return (
        <div style={{ position: "relative" }}>
            <MapComponent adminLvl={ADMINLVL} Date={startDate} DataTypeProperty={curSearchTrend} width={width} height={height} innerData={true} loadedData={loadedData} />
            <svg style={{ position: "absolute", transform: `translate(0px, -${dateHistogramSize * window.innerHeight}px)` }} width={width} height={dateHistogramSize * window.innerHeight}>
                <DateHistogram
                    Data={HistogramData}
                    width={width}
                    height={dateHistogramSize * window.innerHeight}
                    selectedDate={selectedDate}
                />
            </svg>


            {/* <DrawMap GeoJson={curGeoJson} country={""} DataTypeProperty={"new_confirmed"} Data={data} Date={startDate} adminLvl={0} width={width} height={height} />
            <svg style={{ position: "absolute", top: window.innerHeight - dateHistogramSize * window.innerHeight - 20, right: 0 }} width={width} >
            </svg> */}
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