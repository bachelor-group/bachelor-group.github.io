import { axisBottom, axisLeft, extent, scaleBand, scaleLinear, select } from 'd3';
import { useEffect, useMemo, useRef } from 'react';
import { DataType } from '../DataContext/MasterDataType';
import { Plot } from './PlotType';

interface LollipopProps {
    Width: number,
    Height: number,
    Plot: Plot,
    YAxis: (keyof DataType)[]
}

const MARGIN = { top: 30, right: 30, bottom: 50, left: 200 };


function Lollipop({ Width, Height, YAxis, Plot }: LollipopProps) {
    const axesRef = useRef(null)
    YAxis = YAxis.slice(0, 10)
    const boundsWidth = Width - MARGIN.right - MARGIN.left - 0.5 * MARGIN.left;
    const boundsHeight = Height - MARGIN.top - MARGIN.bottom;
    const Data = Plot.MapData;
    const DataAsArray = Array.from(Plot.MapData.values()).flat()
    //TODO Remove
    let HARDCODED_INDEX = 730;


    // Y axis
    const yScale = useMemo(() => {
        // I believe search trends are only updated monthly need to look into this...
        HARDCODED_INDEX = 730;
        return scaleBand().domain(YAxis).range([boundsHeight, 0]).padding(1);
    }, [Data, boundsHeight]);

    // X axis
    let xScale = useMemo(() => {
        if (Data.size === 0) {
            return scaleLinear()
        }
        const [min, max] = extent(YAxis, (element) => parseFloat(DataAsArray[HARDCODED_INDEX][element]!));
        return scaleLinear().domain([0, max!]).range([0, boundsWidth]).nice()
    }, [Data, boundsWidth]);


    useEffect(() => {
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
                <text x={"50%"} y={MARGIN.top * 0.5} textAnchor="middle" dominantBaseline='middle'>{Plot.Title}</text>
                {/* first group is for the violin and box shapes */}
                <g
                    width={boundsWidth}
                    height={boundsHeight}
                    transform={`translate(${[MARGIN.left, MARGIN.top].join(",")})`}
                >
                    {Data.size !== 0 ?
                        YAxis.map((element, index) => (
                            // added div to <> to allow for key
                            <div key={index}>
                                <line stroke='black' strokeWidth={"1px"} x1={xScale(parseFloat(DataAsArray[HARDCODED_INDEX][element]!))} x2={xScale(0)} y1={yScale(element)} y2={yScale(element)}></line>
                                <circle stroke='black' fill='#69b3a2' cx={xScale(parseFloat(DataAsArray[HARDCODED_INDEX][element]!))} cy={yScale(element)} r={4}></circle>
                            </div>
                        ))
                        :
                        <h2>Loading...</h2>}
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
