import { useEffect, useMemo, useRef, useState } from "react";
import { axisLeft, axisBottom, select } from 'd3';
import { Plot } from "./PlotType";
import { DataAccessor, Scale } from "./Scaling";


interface ScatterProps {
    Width: number,
    Height: number,
    Plot: Plot,
}

const MARGIN = { top: 30, right: 30, bottom: 50, left: 50 };

export const Scatter = ({ Width, Height, Plot }: ScatterProps) => {

    const axesRef = useRef(null)
    const boundsWidth = Width - MARGIN.right - MARGIN.left - 0.5 * MARGIN.left; // ops på den - 0.5*margin.left, ser bedre ut med men det er jo hradcoda hehehehehehhe så det er ikke bra :PPPPPPPPPPPPPPPPPPPPPP
    const boundsHeight = Height - MARGIN.top - MARGIN.bottom;
    const [Data, setData] = useState(Plot.Data);

    // Set State on loaded data
    useEffect(() => {
        setData(Plot.Data);
    }, [Plot]);

    const yValue = useMemo(() => {
        return DataAccessor(Plot.Axis[1]);
    }, [Plot]);

    const yScale = useMemo(() => {
        return Scale(Plot, boundsHeight, yValue, "Y");
    }, [Plot, boundsHeight]);

    // Get x value
    const xValue = useMemo(() => {
        return DataAccessor(Plot.Axis[0]);
    }, [Plot]);

    // X Axis
    const xScale = useMemo(() => {
        return Scale(Plot, boundsWidth, xValue);
    }, [Plot, boundsWidth]);

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

        const yAxisGenerator = axisLeft(yScale).ticks(10, "s").tickSize(-boundsWidth);;

        svgElement.append("g").call(yAxisGenerator);
    }, [xScale, yScale, boundsHeight]);

    if (yScale == null || xScale == null) {
        return <></>
    }

    // Build the shapes
    const allShapes = Data.map((d, i) => {
        return (
            <circle
                key={i}
                r={1}
                cx={xScale(parseInt(d[Plot.Axis[0]]!)!)}
                cy={yScale(parseInt(d[Plot.Axis[1]]!))}
                opacity={1}
                stroke="#9a6fb0"
                fill="#9a6fb0"

                fillOpacity={0.7}
                strokeWidth={1}
            />
        );
    });

    return (
        <div>
            <svg className="plot" width={Width} height={Height} style={{ display: "inline-block" }}>
                <text x={"50%"} y={MARGIN.top * 0.5} textAnchor="middle" alignmentBaseline='middle'>{Plot.Title}</text>
                {/* first group is for the violin and box shapes */}
                <g
                    width={boundsWidth}
                    height={boundsHeight}
                    transform={`translate(${[MARGIN.left, MARGIN.top].join(",")})`}
                >
                    {allShapes}
                </g>
                {/* Second is for the axes */}
                <g
                    width={boundsWidth}
                    height={boundsHeight}
                    ref={axesRef}
                    transform={`translate(${[MARGIN.left, MARGIN.top].join(",")})`}
                />
                <rect><text>hello</text></rect>
            </svg>
        </div>
    );
}


export default Scatter;
