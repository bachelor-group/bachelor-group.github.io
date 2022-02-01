import { EpidemiologyData, EpidemiologyEnum } from "../DataContext/DataTypes";

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
    Data: EpidemiologyData[],
    Axis: EpidemiologyEnum[],
    Height: number,
    Width: number,
    Title: string,
    GroupBy?: EpidemiologyEnum,
}