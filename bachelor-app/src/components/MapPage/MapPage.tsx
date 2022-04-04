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
import SidebarC from '../Sidebar';
import { getDefaultSettings } from 'http2';

const width: number = window.innerWidth;
const height: number = window.innerHeight - 56;
const dateHistogramSize: number = 0.2;

type LoadAdmin1MapData = {
    LoadData?: typeof _LoadData
}
interface DataFilter {
    title: string,
    dataType: keyof DataType,
    cName: string
}

const url = "https://storage.googleapis.com/covid19-open-data/v3/location/"

const ADMINLVL = 0;

export const LoadMapData = ({ LoadData = _LoadData }: LoadAdmin1MapData) => {

    //Data
    const [data, setData] = useState<DataType[]>([]);

    const [curDataTypeProp, setDataTypeProp] = useState<keyof DataType>("new_confirmed");
    var curDate = new Date()
    var lastWeek = new Date(curDate.getFullYear(), curDate.getMonth(), curDate.getDate()-7 );
    const [startDate, setStartDate] = useState(`${lastWeek.getFullYear()}-${lastWeek.getMonth()+1 < 10 ? "0" + (lastWeek.getMonth()+1) : lastWeek.getMonth()+1}-${lastWeek.getDate() < 10? "0" + lastWeek.getDate() : lastWeek.getDate()}`);
    const [HistogramData, setHistogramData] = useState<EpidemiologyMinimum[]>([]);


    useMemo(() => {
        if (data.length === 0) {
            return
        }
        var HistogramData = new Map<string, number>()
        csv("csvData/total_confirmed.csv").then(d => {
            d.forEach((row => {
                HistogramData.set(row["date"]!, parseInt(row["total_confirmed"]!))
            }))
            setHistogramData(Array.from(HistogramData, ([date, total_confirmed]) => ({ date, total_confirmed })));
        })
        let temp = Array.from(HistogramData, ([date, total_confirmed]) => ({ date, total_confirmed }))
        setHistogramData(temp);
        console.log(HistogramData)
    }, [data])

    function selectedDate(date: string) {
        console.log(date)
        setStartDate(date)
    }

    function loadedData(Data: DataType[]) {
        setData(Data);
    }
    let dataFilter: DataFilter[] = [
        {
            title: 'New Cases',
            dataType: 'new_confirmed',
            cName: 'nav-text'
        },
        {
            title: 'New Deceased',
            dataType: 'new_deceased',
            cName: 'nav-text'
        },
    ]
    const SelectedFilter = (dataType: keyof DataType) => {
        setDataTypeProp(dataType)
        console.log("changed dataType to: ", dataType)
    }

    return (
        <div style={{ position: "relative" }}>
            <SidebarC Data={dataFilter} SelectedFilter={SelectedFilter} iconColor={"white"}/>
            <MapComponent adminLvl={ADMINLVL} Date={startDate} DataTypeProperty={curDataTypeProp} width={width} height={height} innerData={true} scalePer100k={false} loadedData={loadedData} />
            <svg style={{position: "absolute", transform: `translate(0px, -${dateHistogramSize * window.innerHeight}px)`}}  width={width} height={dateHistogramSize * window.innerHeight}>
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