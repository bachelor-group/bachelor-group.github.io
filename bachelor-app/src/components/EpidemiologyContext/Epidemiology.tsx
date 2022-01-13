import { gray } from 'd3';
import { useEffect, useMemo, useState } from 'react'
import { Col, Row } from 'react-bootstrap';
import { LoadData, DataType } from '../DataContext/LoadData';
import PlotsContainer from './PlotsContainer';

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
    Height: number,
    Width: number
}

// TODO: Create a handleData that uses the string value so we can Send different data...

export const Epidemiology = ({ }: EpidemiologyProps) => {
    const [Plots, setPlots] = useState<Plot[]>(
        [{ PlotType: PlotType.Scatter, Data: [], Height: 300, Width: 600 },
        { PlotType: PlotType.Scatter, Data: [], Height: 300, Width: 600 },
        { PlotType: PlotType.Scatter, Data: [], Height: 300, Width: 600 },
        { PlotType: PlotType.Scatter, Data: [], Height: 300, Width: 600 },
        ]);
    const [RequestedData, setRequestedData] = useState<string[]>(["new_confirmed", "new_confirmed", "new_confirmed", "new_confirmed"]);
    const [Data, setData] = useState<DataType[]>([]);


    // Update Data if new Data is requested
    useEffect(() => {
        LoadData().then((d: DataType[]) => {
            setData(d);
        })
    }, [RequestedData]);

    //Handle new Data
    useEffect(() => {
        let newPlots: Plot[] = new Array(RequestedData.length);
        for (let i = 0; i < RequestedData.length; i++) {
            newPlots[i] = {PlotType: PlotType.Scatter, Data: Data, Height: 300, Width: 600};
        }
        setPlots(newPlots);
    }, [Data]);

    return (
        <div style={{ display: 'flex', justifyContent: 'center' }}>
            {Plots[0].Data.length}
            <PlotsContainer Plots={Plots} />
        </div>
    );
}


export default Epidemiology;