import { axisBottom, axisLeft, extent, scaleBand, scaleLinear, select } from 'd3';
import { useEffect, useMemo, useRef } from 'react';
import { Plot } from './PlotType';

interface LollipopProps {
    Width: number,
    Height: number,
    Plot: Plot,

}

const MARGIN = { top: 30, right: 30, bottom: 50, left: 50 };


function Lollipop({ Width, Height, Plot }: LollipopProps) {
    const axesRef = useRef(null)
    const boundsWidth = Width - MARGIN.right - MARGIN.left - 0.5 * MARGIN.left;
    const boundsHeight = Height - MARGIN.top - MARGIN.bottom;
    const Data = Plot.Data.slice(90, 100);
    console.log(Data)

    // Y axis
    const yScale = useMemo(() => {
        return scaleBand().domain(Data.map((d) => d.date!)).range([boundsHeight, 0]).padding(1);
    }, [Data, boundsHeight]);

    // X axis
    let xScale = useMemo(() => {
        const [min, max] = extent(Data, (d) => parseInt(d[Plot.Axis[0]]!));
        return scaleLinear().domain([0, max!]).range([0, boundsWidth]).nice()
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

        const yAxisGenerator = axisLeft(yScale).ticks(10, "s");

        svgElement.append("g").call(yAxisGenerator);
    }, [xScale, yScale, boundsHeight]);

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
                    {Data.map((d) => (
                        <>
                            <line stroke='black' strokeWidth={"1px"} x1={xScale(parseInt(d[Plot.Axis[0]]!))} x2={xScale(0)} y1={yScale(d[Plot.Axis[1]]!)} y2={yScale(d[Plot.Axis[1]]!)}></line>
                            <circle stroke='black' fill='#69b3a2' cx={xScale(parseInt(d[Plot.Axis[0]]!))} cy={yScale(d[Plot.Axis[1]]!)} r={4}></circle>
                        </>
                    ))}
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

export default Lollipop;