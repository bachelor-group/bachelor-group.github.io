import { scaleLinear, scaleTime, max, bisector, timeFormat, extent, bin, timeMonths, sum, brushX, select, ScaleTime, ScaleLinear, timeParse, timeDays, axisLeft, axisBottom } from 'd3';
import { useRef, useEffect, useMemo, SetStateAction, Dispatch, RefObject, useState } from 'react';
import { setConstantValue } from 'typescript';
import Epidemiology from '../EpidemiologyContext/Epidemiology';
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
}

export interface binData {
    total_confirmed: number,
    date_start: Date,
    date_end: Date

}

const margin = { top: 30, right: 50, bottom: 30, left: 125 };
const xAxisLabelOffset = 54;
const yAxisLabelOffset = 80;

const xAxisTickFormat = timeFormat('%d/%m/%Y');


const yValue = (d: EpidemiologyMinimum) => d.total_confirmed;
const yAxisLabel = "Total New Cases";

export const DateHistogram = ({ Data, width, height, }: HistogramProps) => {
    const innerHeight = height - margin.top - margin.bottom;
    const innerWidth = width - margin.left - margin.right;
    const axesRef = useRef(null)

    let parseTime = timeParse("%Y-%m-%d")

    // useEffect(() => {
    //     setHistogramlData(Data)

    // }, [Data])

    // const xValue = (d: EpidemiologyMinimum) => parseTime(d.date)!;
    // Get x value
    // const xValue = useMemo(() => {
    //     return DataAccessor("date");
    // }, []);

    // xScale
    const xScale = useMemo(() => {
        const [min, max] = extent(Data, (d) => parseTime(d.date!));
        return scaleTime().domain([min!, max!]).range([0, innerWidth]);
    }, [Data, innerWidth]);


    const binnedData: binData[] = useMemo(() => {
        const [start, stop] = xScale.domain();
        const bar = bin<EpidemiologyMinimum, Date>()
            .value((d) => parseTime(d.date)!)
            .domain([start, stop])
            .thresholds(timeDays(start, stop))(Data)
            .map(array => {
                return {
                    total_confirmed: sum(array, yValue),
                    date_start: array.x0!,
                    date_end: array.x1!
                }
            });
        // console.log(bar)

        return bar
    // }, [Data, HistogramData]);
    }, [Data ]);


    // const yScale = useMemo(
    //     () => scaleLinear()
    //             .domain([0, max(binnedData, d => d.total_confirmed)!])
    //             .range([innerHeight, 0]).nice(),
    //     [binnedData, innerHeight]
    // );

    const yScale = useMemo(() => {
        const [min, max] = extent(Data, yValue);
        return scaleLinear().domain([0, max!]).range([innerHeight, 0]).nice()
    }, [Data])


    function clickedDate(event: any) {
        // Find Date of hovered pixel
        let date = xScale.invert(event.nativeEvent.offsetX - margin.left).toISOString().split("T")[0]
        console.log(date)
        // let bisectDate = bisector(function (d: EpidemiologyMinimum) { return d["date"]; }).center;
        // let index = bisectDate(Data, date)
        // console.log(Data[index])
    }

    useEffect(() => {
        if (yScale == null || xScale == null) {
            return
        }
        const svgElement = select(axesRef.current);
        svgElement.selectAll("*").remove();
        const xAxisGenerator = axisBottom(xScale).tickSize(-innerHeight);
        svgElement
            .append("g")
            .attr("transform", "translate(0," + innerHeight + ")")
            .call(xAxisGenerator);

        const yAxisGenerator = axisLeft(yScale).ticks(10, "s").tickSize(-innerWidth);;

        svgElement.append("g").call(yAxisGenerator);
    }, [xScale, yScale, innerHeight]);

    return (
        <>

            <rect width={width} height={height} fillOpacity={0} />
            <g fillOpacity={0.7} fill={"white"} transform={`translate(${margin.left},${window.innerHeight - height - 20})`}>
                <text
                    className="axis-label"
                    textAnchor="middle"
                    transform={`translate(${-yAxisLabelOffset},${innerHeight /
                        2}) rotate(-90)`}
                    fillOpacity={1}
                >
                    {yAxisLabel}
                </text>
                {/* <AxisBottom
                    xScale={xScale}
                    innerHeight={innerHeight}
                    tickFormat={xAxisTickFormat}
                    tickOffset={5}
                /> */}
                {/* <AxisLeft yScale={yScale} innerWidth={innerWidth} tickOffset={10} /> */}

                <g
                    width={innerWidth}
                    height={innerHeight}
                    ref={axesRef}
                    stroke={"white"}
                    strokeWidth={0.5}
                />
                <Marks
                    binnedData={binnedData}
                    xScale={xScale}
                    yScale={yScale}
                    innerHeight={innerHeight}
                />

                <rect width={innerWidth} height={innerHeight} fillOpacity={0} fill={"orange"} onClick={(event) => clickedDate(event)} className="rekd">
                </rect>
            </g>
        </>
    );
};
