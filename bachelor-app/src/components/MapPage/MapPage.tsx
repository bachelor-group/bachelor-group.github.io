import { csv } from 'd3';
import { useEffect, useMemo, useState } from 'react'
import { calculateHistData, DateHistogram, EpidemiologyMinimum } from './DateHistogram';
import { DataType } from '../DataContext/MasterDataType';
import { MapComponent } from '../Map/Map';
import SidebarC from '../Sidebar';
import { Animator as _animator } from '../Map/Animator';
import { DataFilter } from '../Sidebar'

const dateHistogramSize: number = 0.2;

type LoadMapDataProps = {
    Animator?: typeof _animator
}

const url = "https://storage.googleapis.com/covid19-open-data/v3/location/"

const ADMINLVL = 0;

export const LoadMapData = ({ Animator = _animator }: LoadMapDataProps) => {
    //Data
    const [data, setData] = useState<Map<string, DataType[]>>(new Map());
    const [curDataTypeProp, setDataTypeProp] = useState<keyof DataType>("new_confirmed");
    var startDate = new Date()
    var lastWeek = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() - 7);
    const [curDate, setCurDate] = useState(`${lastWeek.getFullYear()}-${lastWeek.getMonth() + 1 < 10 ? "0" + (lastWeek.getMonth() + 1) : lastWeek.getMonth() + 1}-${lastWeek.getDate() < 10 ? "0" + lastWeek.getDate() : lastWeek.getDate()}`);
    const [HistogramData, setHistogramData] = useState<EpidemiologyMinimum[]>([]);

    const [windowDimensions, setWindowDimensions] = useState({ width: window.innerWidth, height: window.innerHeight });
    const [dataFilter, setDataFilter] = useState<DataFilter[]>([
        {
            title: 'New Cases',
            dataType: 'new_confirmed',
        },
        {
            title: 'New Deceased',
            dataType: 'new_deceased'
        },
        {
            title: 'New Hospitalized',
            dataType: 'new_hospitalized_patients'
        },
        {
            title: 'New Tested',
            dataType: 'new_tested'
        },
        {
            title: 'New Vaccinations',
            dataType: 'new_persons_vaccinated'
        },
    ])

    //get window size
    useEffect(() => {
        window.addEventListener("resize", () => setWindowDimensions({ width: window.innerWidth, height: window.innerHeight }));
        return () => window.removeEventListener("resize", () => setWindowDimensions({ width: window.innerWidth, height: window.innerHeight }));

    }, []);

    useMemo(() => {
        if (curDataTypeProp === "new_confirmed" || curDataTypeProp === "new_deceased") {
            var HistogramData = new Map<string, number>()
            csv("csvData/" + curDataTypeProp + "_total.csv").then(d => {
                d.forEach((row => {
                    HistogramData.set(row["date"]!, parseInt(row["total_confirmed"]!))
                }))
                setHistogramData(Array.from(HistogramData, ([date, total_confirmed]) => ({ date, total_confirmed })));
            })
            let temp = Array.from(HistogramData, ([date, total_confirmed]) => ({ date, total_confirmed }))
            setHistogramData(temp);
        } else {
            setHistogramData(calculateHistData(Array.from(data.values()).flat(), curDataTypeProp))
        }
    }, [data])


    function selectedDate(date: string) {
        setCurDate(date)
    }

    function loadedData(Data: Map<string, DataType[]>) {
        setData(Data);
    }
    const SelectedFilter = (dataType: keyof DataType) => {
        setDataTypeProp(dataType)
    }

    return (
        <div style={{ position: "relative" }}>
            <SidebarC Data={dataFilter} SelectedFilter={SelectedFilter} iconColor={"#212529"} />
            <Animator CurDate={curDate} setDate={setCurDate} />
            <MapComponent adminLvl={ADMINLVL} data={data} Date={curDate} DataTypeProperty={curDataTypeProp} width={windowDimensions.width} height={windowDimensions.height - 56} innerData={true} scalePer100k={false} loadedData={loadedData} />
            {data.size !== 0 ?
                <svg style={{ position: "absolute", transform: `translate(0px, -${dateHistogramSize * windowDimensions.height}px)` }} width={windowDimensions.width} height={dateHistogramSize * windowDimensions.height}>
                    <DateHistogram
                        Data={HistogramData}
                        width={windowDimensions.width}
                        height={dateHistogramSize * windowDimensions.height}
                        selectedDate={selectedDate}
                        DataTypeProperty={curDataTypeProp}
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
