import { scaleLinear, scaleTime, max, timeFormat, extent, bin, timeMonths, sum, brushX, select, ScaleTime, ScaleLinear, timeParse } from 'd3';
import { useRef, useEffect, useMemo, SetStateAction, Dispatch } from 'react';
import { EpidemiologyData } from '../DataContext/DataTypes';
import { Plot } from '../Graphs/PlotType';
import { AxisBottom, AxisLeft } from './Axis';

export type EpidemiologyMinimum = {
    date: string,
    total_confirmed: number
}

interface HistogramProps {
    Data: EpidemiologyMinimum[],
    width: number,
    height: number,
    setBrushExtent: Dispatch<SetStateAction<undefined>>,
    xValue: (d: EpidemiologyMinimum) => Date
}

const margin = { top: 0, right: 30, bottom: 20, left: 45 };
const xAxisLabelOffset = 54;
const yAxisLabelOffset = 30;
const xAxisTickFormat = timeFormat('%m/%d/%Y');


const yValue = (d: EpidemiologyMinimum) => d.total_confirmed;
const yAxisLabel = 'Total Dead and Missing';

export const DateHistogram = ({
    Data,
    width,
    height,
    setBrushExtent,
    xValue
}: HistogramProps) => {
    const innerHeight = height - margin.top - margin.bottom;
    const innerWidth = width - margin.left - margin.right;

    let parseTime = timeParse("%Y-%m-%d")

    const xScale = useMemo(() => {
        const [min, max] = extent(Data, (d) => parseTime(d.date!));
        return scaleTime().domain([min!, max!]).range([0, innerWidth]).nice();
    }, [Data, innerWidth, xValue]);

    const binnedData = useMemo(() => {
        const [start, stop] = xScale.domain();
        return bin<Date, Date>()
        //HV FAAEN HVA FAEN HVA FAEN HVA FAEN HVA FAEN!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
            .value(xValue)
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
                .domain([0, max(binnedData, d => d.y)])
                .range([innerHeight, 0]),
        [binnedData, innerHeight]
    );

    // const yScale = useMemo(() => {
    //     if (Data.length === 0) {
    //         return null;
    //     }
    //     const [min, max] = extent(Data.map((d) => d["total_confirmed"]!));
    //     if (min === undefined || max === undefined) {
    //         throw "Min or Max was undefined";
    //     }
    //     return scaleLinear().domain([min, max]).range([innerHeight, 0]).nice();
    // }, [Data, innerHeight]);

    const brushRef = useRef();

    useEffect(() => {
        const brush = brushX().extent([[0, 0], [innerWidth, innerHeight]]);
        // brush(select(brushRef.current));
        brush.on('brush end', (event) => {
            setBrushExtent(event.selection && event.selection.map(xScale.invert));
        });
    }, [innerWidth, innerHeight]);

    return (
        <>
            <rect width={width} height={height} fill="white" />
            <g transform={`translate(${margin.left},${margin.top})`}>
                {/* <AxisBottom
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
                <AxisLeft yScale={yScale} innerWidth={innerWidth} tickOffset={5} />
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
                    circleRadius={2}
                    innerHeight={innerHeight}
                /> */}
                {/* <g ref={brushRef} /> */}
            </g>
        </>
    );
};
