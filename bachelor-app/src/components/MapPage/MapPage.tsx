import { csv } from 'd3';
import { useEffect, useMemo, useState } from 'react'
import { DateHistogram, EpidemiologyMinimum } from './DateHistogram';
import { DataType } from '../DataContext/MasterDataType';
import { MapComponent } from '../Map/Map';
import SidebarC from '../Sidebar';
import { Animator as _animator } from '../Map/Animator';

const width: number = window.innerWidth;
const height: number = window.innerHeight - 56;
const dateHistogramSize: number = 0.2;

type LoadMapDataProps = {
    Animator?: typeof _animator
}
interface DataFilter {
    title: string,
    dataType: keyof DataType,
    cName: string
}

const url = "https://storage.googleapis.com/covid19-open-data/v3/location/"

const ADMINLVL = 0;

export const LoadMapData = ({ Animator = _animator }: LoadMapDataProps) => {

    //Data
    const [data, setData] = useState<DataType[]>([]);

    const [curDataTypeProp, setDataTypeProp] = useState<keyof DataType>("new_confirmed")
    var startDate = new Date()
    var lastWeek = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() - 7);
    const [curDate, setCurDate] = useState(`${lastWeek.getFullYear()}-${lastWeek.getMonth() + 1 < 10 ? "0" + (lastWeek.getMonth() + 1) : lastWeek.getMonth() + 1}-${lastWeek.getDate() < 10 ? "0" + lastWeek.getDate() : lastWeek.getDate()}`);
    const [HistogramData, setHistogramData] = useState<EpidemiologyMinimum[]>([]);

    useMemo(() => {
        var HistogramData = new Map<string, number>()
        csv("csvData/total_confirmed.csv").then(d => {
            d.forEach((row => {
                HistogramData.set(row["date"]!, parseInt(row["total_confirmed"]!))
            }))
            setHistogramData(Array.from(HistogramData, ([date, total_confirmed]) => ({ date, total_confirmed })));
        })
        let temp = Array.from(HistogramData, ([date, total_confirmed]) => ({ date, total_confirmed }))
        setHistogramData(temp);
    }, [data])

    function selectedDate(date: string) {
        setCurDate(date)
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
    }

    return (
        <div style={{ position: "relative" }}>
            <SidebarC Data={dataFilter} SelectedFilter={SelectedFilter} iconColor={"white"} />
            <Animator CurDate={curDate} setDate={setCurDate} />
            <MapComponent adminLvl={ADMINLVL} Date={curDate} DataTypeProperty={curDataTypeProp} width={width} height={height} innerData={true} scalePer100k={false} loadedData={loadedData} />
            {HistogramData.length !== 0 ?
                <svg style={{ position: "absolute", transform: `translate(0px, -${dateHistogramSize * window.innerHeight}px)` }} width={width} height={dateHistogramSize * window.innerHeight} id="date-histogram">
                    <DateHistogram
                        Data={HistogramData}
                        width={width}
                        height={dateHistogramSize * window.innerHeight}
                        selectedDate={selectedDate}
                        curDate={curDate}
                    />
                </svg>
                :
                <></>
            }
        </div>
    );
}

export default LoadMapData;