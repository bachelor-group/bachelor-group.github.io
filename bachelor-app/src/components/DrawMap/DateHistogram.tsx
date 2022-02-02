import { scaleLinear, scaleTime, max, timeFormat, extent, bin, timeMonths, sum, brushX, select, ScaleTime, ScaleLinear, timeParse } from 'd3';
import { useRef, useEffect, useMemo, SetStateAction, Dispatch, RefObject } from 'react';
import { DataAccessor, Scale } from '../Graphs/Scaling';
import AxisBottom from './AxisBottom';
import AxisLeft from './AxisLeft';
import Marks from './Marks';


export type EpidemiologyMinimum = {
    date: string,
    total_confirmed: number
}

interface HistogramProps {
    Data: EpidemiologyMinimum[],
    width: number,
    height: number,
    setBrushExtent: Dispatch<SetStateAction<undefined>>,
    // xValue: (d: EpidemiologyMinimum) => string
}

export interface binData {
    total_confirmed: (d: EpidemiologyMinimum) => number,
    date_start: Date,
    date_end: Date

}

const margin = { top: 30, right: 50, bottom: 30, left: 125 };
const xAxisLabelOffset = 54;
const yAxisLabelOffset = 80;

const xAxisTickFormat = timeFormat('%d/%m/%Y');


const yValue = (d: EpidemiologyMinimum) => d.total_confirmed;
const yAxisLabel = "Total Cases";
const xAxisLabel = "Date";

export const DateHistogram = ({
    Data,
    width,
    height,
    setBrushExtent,
    // xValue,
}: HistogramProps) => {
    const innerHeight = height - margin.top - margin.bottom;
    const innerWidth = width - margin.left - margin.right;

    let parseTime = timeParse("%Y-%m-%d")


    // const xScale = useMemo(() => {
    //     const [min, max] = extent(Data, (d) => parseTime(d.date!));
    //     // return scaleTime().domain([min!, max!]).range([0, innerWidth]).nice();
    //     const timeScale = scaleTime().domain([min!, max!]).range([0, innerWidth]).nice();
    //     return timeScale
    // }, [Data, innerWidth, xValue]);

    // Get x value
    const xValue = useMemo(() => {
        return DataAccessor("date");
    }, []);

    // X Axis
    const xScale = useMemo(() => {

        const [min, max] = extent(Data, (d) => parseTime(d.date!));

        let StartOfBounds = 0;
        let EndOfBounds = innerWidth;

        return scaleTime().domain([min!, max!]).range([StartOfBounds, EndOfBounds]);
    }, [Data, innerWidth]);


    const binnedData: binData[] = useMemo(() => {
        const [start, stop] = xScale.domain();
        const bar = bin<EpidemiologyMinimum, Date>()
            .value((d) => parseTime(d.date)!)
            .domain([start, stop])
            .thresholds(timeMonths(start, stop))(Data)
            .map(array => ({
                total_confirmed: yValue,
                date_start: array.x0!,
                date_end: array.x1!
            }))
            ;
        // console.log(bar)

        return bar
    }, [xValue, yValue, xScale, Data]);


    // const yScale = useMemo(
    //     () =>
    //         scaleLinear()
    //             .domain([0, max(binnedData, d => d.total_confirmed)!])
    //             .range([innerHeight, 0]),
    //     [binnedData, innerHeight]
    // );
    const yScale = useMemo(() => {
        const [min, max] = extent(Data, yValue);

        return scaleLinear().domain([0, max!]).range([innerHeight, 0]).nice()
    }, [])

    // const brushRef = useRef<RefObject<SVGGElement>>();


    // useEffect(() => {
    //     const brush = brushX().extent([[0, 0], [innerWidth, innerHeight]]);
    //     //@ts-ignore
    //     // brush(select(brushRef.current));
    //     brush.on('brush end', (event) => {
    //         setBrushExtent(event.selection && event.selection.map(xScale.invert));
    //     });
    // }, [innerWidth, innerHeight]);


    return (
        <>

            <rect width={width} height={height} fillOpacity={0} />
            <g fillOpacity={0.4} fill={"white"} transform={`translate(${margin.left},${window.innerHeight - height - 20})`}>
                <AxisBottom
                    xScale={xScale}
                    innerHeight={innerHeight}
                    tickFormat={xAxisTickFormat}
                    tickOffset={5}
                />
                <text
                    className="axis-label"
                    textAnchor="middle"
                    transform={`translate(${-yAxisLabelOffset},${innerHeight /
                        2}) rotate(-90)`}
                    fillOpacity={1}
                >
                    {yAxisLabel}
                </text>
                <AxisLeft yScale={yScale} innerWidth={innerWidth} tickOffset={10} />
                {/* <text
                    className="axis-label"
                    x={innerWidth / 2}
                    y={innerHeight + xAxisLabelOffset}
                    textAnchor="middle"
                >
                    {xAxisLabel}
                </text> */}
                <Marks
                    binnedData={binnedData}
                    xScale={xScale}
                    yScale={yScale}
                    // TODO FIX D iTYPE
                    // tooltipFormat={(d: any) => d}
                    innerHeight={innerHeight}
                />
                {/*            @ts-ignore      */}
                {/* <g ref={brushRef} /> */}
            </g>
        </>
    );
};
