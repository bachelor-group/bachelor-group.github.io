import { scaleLinear, scaleTime, max, bisector, timeFormat, extent, bin, timeMonths, sum, brushX, select, ScaleTime, ScaleLinear, timeParse, timeDays, axisLeft, axisBottom, line } from 'd3';
import { useRef, useEffect, useMemo, SetStateAction, Dispatch, RefObject, useState, MouseEvent } from 'react';
import { setConstantValue } from 'typescript';
import Epidemiology from '../EpidemiologyContext/Epidemiology';
import { DataAccessor, Scale } from '../Graphs/Scaling';
import Marks from './Marks';


export type EpidemiologyMinimum = {
    date: string,
    total_confirmed: number
}

interface HistogramProps {
    Data: EpidemiologyMinimum[],
    width: number,
    height: number,
    selectedDate: (date: string) => void
}

export interface binData {
    total_confirmed: number,
    date_start: Date,
    date_end: Date

}

const margin = { top: 30, right: 50, bottom: 30, left: 50 };
const yValue = (d: EpidemiologyMinimum) => d.total_confirmed;
const yAxisLabel = "Total New Cases";
let parseTime = timeParse("%Y-%m-%d")

export const DateHistogram = ({ Data, width, height, selectedDate }: HistogramProps) => {

    const innerHeight = height - margin.top - margin.bottom;
    const innerWidth = width - margin.left - margin.right;
    const axesRef = useRef(null)
    const [dots, setdots] = useState<number[][]>([]);
    const [showToolTip, setShowTooltip] = useState(false);
    const [Tooltipx, setTooltipx] = useState(50);

    // xScale
    const xScale = useMemo(() => {
        const [min, max] = extent(Data, (d) => parseTime(d.date!));
        return scaleTime().domain([min!, max!]).range([0, innerWidth]);
    }, [Data, innerWidth]);

    // yScale
    const yScale = useMemo(() => {
        const [min, max] = extent(Data, yValue);
        return scaleLinear().domain([0, max!]).range([innerHeight, 0]).nice()
    }, [Data])


    const binnedData = useMemo(() => {
        if (Data.length === 0) {
            return [{
                total_confirmed: undefined,
                date_start: undefined,
                date_end: undefined
            }]
        }
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
        return bar
    }, [Data]);


    // Axis
    useEffect(() => {
        if (yScale == null || xScale == null || innerHeight == null) {
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


    function clickedDate(event: MouseEvent<SVGRectElement, globalThis.MouseEvent>) {
        // Find Date of hovered pixel
        let date = xScale.invert(event.nativeEvent.offsetX - margin.left).toISOString().split("T")[0]
        selectedDate(date)

    }

    function hoverDate(event: MouseEvent<SVGRectElement, globalThis.MouseEvent>) {
        let date = xScale.invert(event.nativeEvent.offsetX - margin.left).toISOString().split("T")[0]
        let id = Data.findIndex((d) => d["date"] === date);
        let newdots: number[][] = []
        if (id !== -1) {
            newdots.push([(event.nativeEvent.offsetX - margin.left - 5), yScale(yValue(Data[id])!)])
            setdots(newdots);
            setTooltipx(event.nativeEvent.offsetX - margin.left - 5);
        }
    }

    return (
        <>
            {/* <rect width={width} height={height} fillOpacity={0} /> */}
            <g fillOpacity={1.0} fill={"white"} strokeOpacity={1} stroke={"white"} transform={`translate(${margin.left},${window.innerHeight - height - 20})`}>
                <text
                    textAnchor="middle"
                    transform={`translate(${width / 2},${-10})`}
                >
                    {yAxisLabel}
                </text>
                <g
                    width={innerWidth}
                    height={innerHeight}
                    ref={axesRef}
                    stroke={"white"}
                    strokeOpacity={1}
                    strokeWidth={0.7}
                />
                <Marks
                    binnedData={binnedData}
                    xScale={xScale}
                    yScale={yScale}
                    innerHeight={innerHeight}
                />

                {/* Tooltips */}
                <line x1={Tooltipx} x2={Tooltipx} y1={0} y2={innerHeight} stroke='white' strokeWidth={1} opacity={showToolTip ? 1 : 0} />

                {dots.map((points, index) => (
                    <circle key={index} cx={points[0]} cy={points[1]} r={4} fill='black' opacity={showToolTip ? 1 : 0} />
                ))}

                <rect className="rekd" width={innerWidth} height={innerHeight} fillOpacity={0} strokeOpacity={0} fill={"white"} opacity={0}
                    onClick={(event) => (clickedDate(event))}
                    onMouseMove={(event) => (hoverDate(event))}
                    onMouseEnter={() => (setShowTooltip(true))}
                    onMouseLeave={() => (setShowTooltip(false))}>
                </rect>
            </g>
        </>
    );
};
