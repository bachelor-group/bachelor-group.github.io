import { useEffect, useState } from 'react'
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
        [{ PlotType: PlotType.Scatter, Data: [], DataString: "new_confirmed", Height: 400, Width: 800 }]
    );

    useEffect(() => {
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
        <PlotsContainer Plots={Plots} />
    );
}


export default Epidemiology;