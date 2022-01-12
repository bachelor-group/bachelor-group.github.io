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
    DataString?: string,
    Height: number,
    Width: number
}

// TODO: Create a handleData that uses the string value so we can Send different data...

export const Epidemiology = ({ }: EpidemiologyProps) => {
    const [Plots, setPlots] = useState<Plot[]>(
        [{ PlotType: PlotType.Scatter, Data: [], DataString: "new_confirmed", Height: 300, Width: 600 },
        { PlotType: PlotType.Scatter, Data: [], DataString: "new_confirmed", Height: 300, Width: 600 },
        { PlotType: PlotType.Scatter, Data: [], DataString: "new_confirmed", Height: 300, Width: 600 },
        { PlotType: PlotType.Scatter, Data: [], DataString: "new_confirmed", Height: 300, Width: 600 },]
    );

    useMemo(() => {
        for (let i = 0; i < Plots.length; i++) {
            let Plot = Plots[i];
            let LoadedData = LoadData()
            let newPlot: Plot = { PlotType: Plot.PlotType, Data: LoadedData, Height: Plot.Height, Width: Plot.Width };
            Plots[i] = newPlot;
        }
        return () => {
        }
    }, []);

    return (
        <div style={{ display: 'flex', justifyContent: 'center'}}>
            <PlotsContainer Plots={Plots} />
        </div>
    );
}


export default Epidemiology;