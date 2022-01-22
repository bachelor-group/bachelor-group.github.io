import { time } from 'console';
import { scaleLinear, scaleTime, max, timeFormat, extent, bin, timeMonths, sum, brushX, select, ScaleTime, ScaleLinear, timeParse } from 'd3';
import { useRef, useEffect, useMemo, SetStateAction, Dispatch, RefObject } from 'react';
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
    xValue: (d: EpidemiologyMinimum) => string
}

const margin = { top: 20, right: 50, bottom: 30, left: 125 };
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
    xValue,
}: HistogramProps) => {
    const innerHeight = height - margin.top - margin.bottom;
    const innerWidth = width - margin.left - margin.right;

    let parseTime = timeParse("%Y-%m-%d")


    const xScale = useMemo(() => {
        console.log(parseTime(Data[0].date))
        const [min, max] = extent(Data, (d) => parseTime(d.date!));
        return scaleTime().domain([min!, max!]).range([0, innerWidth]).nice();
    }, [Data, innerWidth, xValue]);


    const binnedData = useMemo(() => {
        const [start, stop] = xScale.domain();
        return bin<EpidemiologyMinimum, Date>()
            .value((d) => parseTime(d.date!)!)
            .domain([start, stop])
            .thresholds(timeMonths(start, stop))(Data)
            .map(array => ({
                y: sum(array, yValue),
                x0: array.x0,
                x1: array.x1
            }));
    }, [xValue, yValue, xScale, Data]);


    const yScale = useMemo(
        () =>
            scaleLinear()
                .domain([0, max(binnedData, d => d.y)!])
                .range([innerHeight, 0]),
        [binnedData, innerHeight]
    );

    const brushRef = useRef<RefObject<SVGGElement>>();


    useEffect(() => {
        const brush = brushX().extent([[0, 0], [innerWidth, innerHeight]]);
        //@ts-ignore
        brush(select(brushRef.current));
        brush.on('brush end', (event) => {
            setBrushExtent(event.selection && event.selection.map(xScale.invert));
        });
    }, [innerWidth, innerHeight]);

    return (
        <>

            <rect width={width} height={height} fill="white" />
            <g transform={`translate(${margin.left},${margin.top})`}>
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
                >
                    {yAxisLabel}
                </text>
                <AxisLeft yScale={yScale} innerWidth={innerWidth} tickOffset={10} />
                <text
                    className="axis-label"
                    x={innerWidth / 2}
                    y={innerHeight + xAxisLabelOffset}
                    textAnchor="middle"
                >
                    {xAxisLabel}
                 </text>
                <Marks
                    binnedData={binnedData}
                    xScale={xScale}
                    yScale={yScale}
                    // TODO FIX D iTYPE
                    tooltipFormat={(d: any) => d}
                    innerHeight={innerHeight}
                />
                {/*            @ts-ignore      */}
                <g ref={brushRef} />
            </g>
        </>
    );
};
