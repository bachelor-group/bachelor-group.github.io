import { PlotDataType } from "../DataContext/DataTypes";

export enum PlotType {
    Scatter,
    LineChart,
    WorldCloud
}

export interface Plot {
    PlotType: PlotType
    Data: PlotDataType[],
    Axis?: string[]
    Height: number,
    Width: number
    Title: string,
}