import { DataType } from "../DataContext/MasterDataType";

export enum PlotType {
    Scatter,
    LineChart,
    WordCloud,
    Lollipop,
    BarRace,
}

export type PlotDataType = {
    xaxis: string,
    yaxis: string,
}

export type Plot = {
    PlotType: PlotType,
    MapData: Map<string, DataType[]>,
    Axis: (keyof DataType)[],
    Height: number,
    Width: number,
    Title: string,
}
