import { extent, scaleLinear, scaleTime, timeParse } from "d3";
import { DataType } from "../DataContext/MasterDataType";
import { Plot } from '../Graphs/PlotType';

// Scale, Return a scale to use for Axis for a graph
export const Scale = (Plot: Plot, bounds: number, getter: ((d: DataType) => Date | null) | ((d: DataType) => number), axis: string = "X"
) => {
    const [min, max] = extent(Plot.Data, (d) => getter(d));

    // If plotting x-Axis
    let StartOfBounds = 0;
    let EndOfBounds = bounds;
    let AxisToGet = 0;

    // If plotting y-Axis
    if (axis === "Y") {
        StartOfBounds = bounds;
        EndOfBounds = 0;
        AxisToGet = 1;
    }

    if (Plot.Axis[AxisToGet] === "date") {
        return scaleTime().domain([min!, max!]).range([StartOfBounds, EndOfBounds]);
    }
    else {
        return scaleLinear().domain([min!, max!]).range([StartOfBounds, EndOfBounds]).nice();
    }

};

let parseTime = timeParse("%Y-%m-%d")

// DataAccessor, Function for accessing a property of data
export const DataAccessor = (property: keyof DataType) => {
    if (property === "date"){
        return (d: DataType) => parseTime(d.date!)
    }
        return (d: DataType) => parseFloat(d[property]!)
}