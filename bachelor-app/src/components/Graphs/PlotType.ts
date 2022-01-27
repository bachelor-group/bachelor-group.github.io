import { EpidemiologyData, EpidemiologyEnum } from "../DataContext/DataTypes";
import { DataType } from "../DataContext/MasterDataType";
import { SearchTrendData, SearchTrendsEnum } from "../DataContext/SearchTrendType";

export enum PlotType {
    Scatter,
    LineChart,
    WorldCloud,
    Lollipop,
}

export type PlotDataType = {
    xaxis: string,
    yaxis: string,
}

export interface Plot {
    PlotType: PlotType,
    Data: DataType[],
    Axis: (keyof DataType)[],
    Height: number,
    Width: number,
    Title: string,
    GroupBy?: (keyof DataType),
}