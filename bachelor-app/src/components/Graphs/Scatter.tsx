import { useEffect, useMemo, useRef, useState } from "react";
import { extent, scaleLinear, axisLeft, axisBottom, select } from 'd3';
import { Plot } from "./PlotType";


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
    // Y axis
    const yScale = useMemo(() => {
        if (Data.length == 0) {
            return null;
        }
        const [min, max] = extent(Data.map((d) => parseInt(d[Plot.Axis[1]]!)));
        if (min === undefined || max === undefined) {
            throw "Min or Max was undefined";
        }
        return scaleLinear().domain([min, max]).range([boundsHeight, 0]);
    }, [Data, boundsHeight]);

    // X axis
    const xScale = useMemo(() => {
        if (Data.length == 0) {
            return null;
        }
        const [min, max] = extent(Data.map((d) => parseInt(d[Plot.Axis[0]]!)));
        if (min === undefined || max === undefined) {
            throw "Min or Max was undefined";
        }
        return scaleLinear().domain([min, max]).range([0, boundsWidth]);
    }, [Data, boundsWidth]);

    useEffect(() => {
        if (yScale == null || xScale == null) {
            return
        }
        const svgElement = select(axesRef.current);
        svgElement.selectAll("*").remove();
        const xAxisGenerator = axisBottom(xScale);
        svgElement
            .append("g")
            .attr("transform", "translate(0," + boundsHeight + ")")
            .call(xAxisGenerator);

        const yAxisGenerator = axisLeft(yScale);

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
                r={4}
                cx={xScale(parseInt(d[Plot.Axis[0]]!))}
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
                <text x={"50%"} y={MARGIN.top} textAnchor="middle">{Plot.Title}</text>
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
