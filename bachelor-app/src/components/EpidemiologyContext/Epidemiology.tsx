import { gray } from 'd3';
import { useEffect, useMemo, useState } from 'react'
import { ProgressBar, } from 'react-bootstrap';
import { LoadData, DataType } from '../DataContext/LoadData';
import PlotsContainer from './PlotsContainer';
import {EpidemiologyCSV} from '../DataContext/LoadData'

interface EpidemiologyProps {

}

export enum PlotType {
    Scatter,
    LineChart,
    WorldCloud
}


export interface Plot {
    PlotType: PlotType
    Data: DataType[],
    Axis?: string[]
    Height: number,
    Width: number
}

// TODO: Create a handleData that uses the string value so we can Send different data...

export const Epidemiology = ({ }: EpidemiologyProps) => {
    const [Plots, setPlots] = useState<Plot[]>(
        [{ PlotType: PlotType.Scatter, Data: [], Axis: ["new_confirmed", "date"], Height: 300, Width: 600 },
        // { PlotType: PlotType.Scatter, Data: [], Height: 300, Width: 600 },
        // { PlotType: PlotType.Scatter, Data: [], Height: 300, Width: 600 },
        // { PlotType: PlotType.Scatter, Data: [], Height: 300, Width: 600 },
        ]);
    const [RequestedData, setRequestedData] = useState<string[]>(["new_confirmed", "date"]);
    const [Data, setData] = useState<EpidemiologyCSV[]>([]);


    // Update Data if new Data is requested
    useEffect(() => {
        LoadData().then((d: EpidemiologyCSV[]) => {
            setData(d);
        })
    }, [RequestedData]);

    //Handle new Data
    useEffect(() => {
        let newPlots: Plot[] = new Array(Plots.length);
        for (let i = 0; i < Plots.length; i++) {
            let PlotData: DataType[] = []
            console.log(Data[0])
            for (let j = 0; j < Data.length; j++) {
                //@ts-ignore
                console.log(Data[0][Plots[0].Axis[1]])
                //@ts-ignore
                PlotData.push({xaxis: Data[j][Plots[i].Axis[0]], yaxis: Data[j][Plots[i].Axis[1]]})
            }
            newPlots[i] = { PlotType: PlotType.Scatter, Data: PlotData, Axis: ["new_confirmed", "date"], Height: 300, Width: 600 };
        }
        setPlots(newPlots);
    }, [Data]);

    return (

        <div style={{ display: 'flex', justifyContent: 'center' }}>
            {
                Data.length === 0 ?
                    <div style={{ width: "75%", marginTop: "50%" }}>
                        <ProgressBar animated now={100} />
                    </div>
                    :
                    < PlotsContainer Plots={Plots} />
            }
        </div>
    );
}


export default Epidemiology;