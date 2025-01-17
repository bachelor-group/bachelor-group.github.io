import { axisBottom, axisLeft, scaleOrdinal, select } from 'd3';
import { useEffect, useMemo, useRef, useState } from "react";
import { filterDataBasedOnProps } from "../DataContext/LoadData";
import { DataType } from "../DataContext/MasterDataType";
import { Plot } from "./PlotType";
import { DataAccessor, Scale } from "./Scaling";
import { GraphTooltip } from "./Tooltip";

interface ScatterProps {
    Width: number,
    Height: number,
    Plot: Plot,
    Colors: string[],
}

const MARGIN = { top: 30, right: 30, bottom: 50, left: 50 };

export const Scatter = ({ Width, Height, Plot, Colors }: ScatterProps) => {

    const axesRef = useRef(null)
    const boundsWidth = Width - MARGIN.right - MARGIN.left - 0.5 * MARGIN.left; // ops på den - 0.5*margin.left, ser bedre ut med men det er jo hradcoda hehehehehehhe så det er ikke bra :PPPPPPPPPPPPPPPPPPPPPP
    const boundsHeight = Height - MARGIN.top - MARGIN.bottom;
    const [mapData, setMapData] = useState<Map<string, DataType[]>>(new Map());
    const [dataPoints, setDataPoints] = useState<JSX.Element[]>([]);

    useEffect(() => {
        setMapData(filterDataBasedOnProps(Plot.MapData, mapData, [...Plot.Axis]));
    }, [Plot])

    const yValue = useMemo(() => {
        return DataAccessor(Plot.Axis[1]);
    }, [Plot]);

    const yScale = useMemo(() => {
        return Scale(Plot, boundsHeight, yValue, "Y");
    }, [Plot, boundsHeight, mapData]);

    // Get x value
    const xValue = useMemo(() => {
        return DataAccessor(Plot.Axis[0]);
    }, [Plot]);

    // X Axis
    const xScale = useMemo(() => {
        return Scale(Plot, boundsWidth, xValue);
    }, [Plot, boundsWidth, mapData]);

    // Colors
    const colorscale = scaleOrdinal<string>().range(Colors)

    useEffect(() => {
        if (yScale == null || xScale == null) {
            return
        }
        const svgElement = select(axesRef.current);
        svgElement.selectAll("*").remove();
        const xAxisGenerator = axisBottom(xScale).tickSize(-boundsHeight);
        svgElement
            .append("g")
            .attr("transform", "translate(0," + boundsHeight + ")")
            .call(xAxisGenerator);

        const yAxisGenerator = axisLeft(yScale).ticks(10, "s").tickSize(-boundsWidth);

        svgElement.append("g").call(yAxisGenerator);
    }, [xScale, yScale, boundsHeight]);

    useEffect(() => {
        // Build the shapes
        let circles: JSX.Element[] = []
        mapData.forEach((data, locationKey) => {
            let color = colorscale(locationKey);

            let circle = data.map((d, i) => {
                return (
                    GraphTooltip(Plot, d,
                        <circle
                            r={2}
                            cx={xScale(xValue(d)!)}
                            cy={yScale(parseFloat(d[Plot.Axis[1]]!))}
                            opacity={1}
                            stroke={color}
                            fill={color}
                            fillOpacity={0.7}
                            strokeWidth={1}
                        />, locationKey + i, locationKey.split("_").length - 1
                    )
                )
            });
            circles.push(...circle);
        });
        setDataPoints(circles);
    }, [mapData])


    if (yScale == null || xScale == null) {
        return <></>
    }

    return (
        <div>
            <svg className="plot" width={Width} height={Height} style={{ display: dataPoints.length !== 0 ? "inline-block" : "none" }}>
                <text x={"50%"} y={MARGIN.top * 0.5} textAnchor="middle" dominantBaseline='middle'>{Plot.Title}</text>
                {/* first group is for the violin and box shapes */}
                <g
                    width={boundsWidth}
                    height={boundsHeight}
                    transform={`translate(${[MARGIN.left, MARGIN.top].join(",")})`}
                >
                    {dataPoints}
                </g>
                {/* Second is for the axes */}
                <g
                    width={boundsWidth}
                    height={boundsHeight}
                    ref={axesRef}
                    transform={`translate(${[MARGIN.left, MARGIN.top].join(",")})`}
                />
            </svg>
        </div>
    );
}

export default Scatter;
