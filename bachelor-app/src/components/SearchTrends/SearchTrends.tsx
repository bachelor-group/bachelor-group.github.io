import { useEffect, useState } from 'react';
import { DataType } from '../DataContext/MasterDataType';
import { SearchTrendsEnum } from '../DataContext/SearchTrendType';
import PlotsContainer from '../EpidemiologyContext/PlotsContainer';
import { Plot, PlotType } from '../Graphs/PlotType';
import { LoadSearchTrends as _LoadData } from './LoadSearchTrends';

interface Props {
    LoadData?: typeof _LoadData
}


// export interface SearchTrendPlot {
//     PlotType: PlotType,
//     Data: SearchTrendData[],
//     Axis: SearchTrendsEnum[],
//     Height: number,
//     Width: number,
//     Title: string,
//     GroupBy?: SearchTrendsEnum,
// }


function SearchTrends({ LoadData = _LoadData }: Props) {
    const [Data, setData] = useState<DataType[]>([])
    const [Plots, setPlots] = useState<Plot[]>(
        [
            { PlotType: PlotType.Lollipop, Data: [], Axis: [SearchTrendsEnum.search_trends_common_cold, SearchTrendsEnum.date], Height: 300, Width: 600, Title: "Lollipop" },
        ]);


    //let Data = LoadData().then((d) => setData)

    // Update Data if new Data is requested
    useEffect(() => {
        LoadData().then((d) => {
            setData(d);
        })
    }, []);

    //Handle new Data
    useEffect(() => {
        let newPlots: Plot[] = new Array(Plots.length);
        Plots.forEach((Plot, i) => {

            let xAxis = Plot.Axis[0];
            let yAxis = Plot.Axis[1];
            let newPlot: Plot;
            let PlotData: DataType[] = []

            for (let j = 0; j < Data.length; j++) {
                if (Plot.GroupBy !== undefined) {
                    PlotData.push({ [xAxis]: Data[j][xAxis], [yAxis]: Data[j][yAxis], [Plot.GroupBy]: Data[j][Plot.GroupBy] })
                } else {
                    PlotData.push({ [xAxis]: Data[j][xAxis], [yAxis]: Data[j][yAxis] })
                }
            }

            newPlot = { PlotType: Plot.PlotType, Data: PlotData, Axis: Plot.Axis, Height: Plot.Height, Width: Plot.Width, Title: Plot.Title, GroupBy: Plot.GroupBy };
            newPlots[i] = newPlot;
        })
        setPlots(newPlots);
    }, [Data]);

    // const [RequestedData, setRequestedData] = useState<string[]>(["new_confirmed", "date"]);
    //const [Data, setData] = useState<SearchTrendsData[]>([]);

    return (
        <div id="main">
            <h1>This is the Search Trends page!</h1>
            <PlotsContainer Plots={Plots} />
        </div>
    );
}

export default SearchTrends;