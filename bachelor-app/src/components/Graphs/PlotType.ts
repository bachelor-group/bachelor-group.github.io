import { EpidemiologyData, EpidemiologyEnum } from "../DataContext/DataTypes";
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
export interface Plot<DataType, EnumType extends DataType> {
    PlotType: PlotType,
    Data: DataType[],
    Axis: EnumType[],
    Height: number,
    Width: number,
    Title: string,
    GroupBy?: EnumType,
}