import { scaleLinear, scaleTime, extent, bin, sum, select, timeParse, timeDays, axisLeft, axisBottom, max } from 'd3';
import { useRef, useEffect, useMemo, useState, MouseEvent } from 'react';
import { DataType } from '../../DataContext/MasterDataType';
import Marks from './Marks';


export type HistogramData = {
    date: string,
    total_confirmed: number
}

interface HistogramProps {
    Data: HistogramData[],
    width: number,
    height: number,
    DataTypeProperty: keyof DataType,
    selectedDate: (date: string) => void,
    curDate: string,
}

export interface binData {
    total_confirmed: number,
    date_start: Date,
    date_end: Date
}

const margin = { top: 40, right: 50, bottom: 40, left: 50 };
const yValue = (d: HistogramData) => d.total_confirmed;
let parseTime = timeParse("%Y-%m-%d")

export const DateHistogram = ({ Data, width, height, selectedDate, curDate, DataTypeProperty }: HistogramProps) => {

    const innerHeight = height - margin.top - margin.bottom;
    const innerWidth = width - margin.left - margin.right;
    const axesRef = useRef(null)
    const [showToolTip, setShowTooltip] = useState(false);
    const yAxisLabel = "Global " + DataTypeProperty.replaceAll("_", " ");


    // xScale
    const xScale = useMemo(() => {
        const [min, max] = extent(Data, (d) => parseTime(d.date!));
        return scaleTime().domain([min!, max!]).range([0, innerWidth]);
    }, [Data, innerWidth]);

    // yScale
    const yScale = useMemo(() => {
        const maxValue = max(Data, yValue);
        return scaleLinear().domain([0, maxValue!]).range([innerHeight, 0]).nice()
    }, [Data, innerHeight])


    const binnedData = useMemo(() => {
        if (Data.length === 0) {
            return [{
                total_confirmed: undefined,
                date_start: undefined,
                date_end: undefined
            }]
        }
        const [start, stop] = xScale.domain();
        const bar = bin<HistogramData, Date>()
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
        if (yScale === null || xScale === null || innerHeight === null) {
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
    }, [xScale, yScale, innerHeight, innerWidth]);


    function clickedDate(event: MouseEvent<SVGRectElement, globalThis.MouseEvent>) {
        // Find Date of hovered pixel
        let date = xScale.invert(event.nativeEvent.offsetX - margin.left).toISOString().split("T")[0]
        selectedDate(date)

    }

    function hoverDate(event: MouseEvent<SVGRectElement, globalThis.MouseEvent>) {
        let xPos = event.nativeEvent.offsetX - margin.left
        updateLine(xPos, true)
    }

    function updateLine(xPos: number, hover = false) {
        let data = []
        let containerClass = ".cursor"
        let fill = "red"

        if (hover) {
            containerClass = ".tooltip-container"
            fill = "black"
        }

        if (xPos !== -1) {
            let date = xScale.invert(xPos).toISOString().split("T")[0]
            let id = Data.findIndex((d) => d["date"] === date);
            if (id !== -1) data.push(Data[id])
        }


        let tooltipContainer = select(containerClass)

        // Line
        let line = tooltipContainer.selectAll("line").data(data)

        line.enter()
            .append("line")
            .attr("x1", xPos)
            .attr("x2", xPos)
            .attr("y1", 0)
            .attr("y2", innerHeight)
            .attr("stroke", fill)
            .attr("stroke-width", 1)

        line
            .attr("x1", xPos)
            .attr("x2", xPos)
            .attr("y1", 0)
            .attr("y2", innerHeight)
            .attr("stroke", fill)
            .attr("stroke-width", 1)

        line.exit().remove()

        if (hover) {
            // Circle
            let circle = tooltipContainer.selectAll("circle").data(data)

            circle.enter()
                .append("circle")
                .attr("cx", xPos)
                .attr("cy", d => yScale(yValue(d)!))
                .attr("r", 4)
                .attr("fill", "black")
                .attr("opacity", d => showToolTip ? 1 : 0)

            circle
                .attr("cx", xPos)
                .attr("cy", d => yScale(yValue(d)!))
                .attr("r", 4)
                .attr("fill", "black")
                .attr("opacity", () => showToolTip ? 1 : 0)

            circle.exit().remove()
        }
    }

    useEffect(() => {
        if (Data.length !== 0) {
            updateLine(xScale(parseTime(curDate)!))
        }
    }, [curDate, Data, width, height])


    return (
        <>
            {/* <rect width={width} height={height} fillOpacity={0} /> */}
            <g fillOpacity={1.0} fill={"white"} strokeOpacity={1} stroke={"white"} >
                <text
                    dominantBaseline='middle'
                    textAnchor="middle"
                    x={"50%"}
                    y={margin.top / 4}
                >
                    {yAxisLabel}
                </text>
                <g transform={`translate(${margin.left},${margin.top / 2})`}>
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
                    <g className="tooltip-container">
                        <line />
                        <circle />
                    </g>

                    <g className="cursor">
                        <line id='date-histogram-cursor' />
                    </g>

                    <rect className="rekd" width={innerWidth} height={innerHeight} fillOpacity={0} strokeOpacity={0} fill={"white"} opacity={0}
                        onClick={(event) => (clickedDate(event))}
                        onMouseMove={(event) => (hoverDate(event))}
                        onMouseEnter={() => (setShowTooltip(true))}
                        onMouseLeave={() => (updateLine(-1, true))}>
                    </rect>
                </g>
            </g>
        </>
    );
};


export function calculateHistData(data: DataType[], datatype: keyof DataType) {
    var HistogramData = new Map<string, number>()
    data.forEach(d => {
        if (HistogramData.has(d.date!)) {
            if (!isNaN(parseInt(d[datatype]!))) {
                HistogramData.set(d.date!, HistogramData.get(d.date!)! + parseInt(d[datatype]!))
            }

        } else {
            if (!isNaN(parseInt(d[datatype]!))) {
                HistogramData.set(d.date!, parseInt(d[datatype]!))
            }
        }
    })
    return Array.from(HistogramData, ([date, total_confirmed]) => ({ date, total_confirmed }))

}