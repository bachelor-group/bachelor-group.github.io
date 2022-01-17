import { axisBottom, axisLeft, extent, group, line, scaleLinear, scaleOrdinal, select, sum } from 'd3';
import { useEffect, useMemo, useRef, useState } from 'react';
import { EpidemiologyData } from "../DataContext/DataTypes";
import { Plot } from './PlotType';


interface LineChartProps {
    Width: number,
    Height: number,
    Plot: Plot,
}

const COLORS = ["Blue", "Coral", "DodgerBlue", "SpringGreen", "YellowGreen", "Green", "OrangeRed", "Red", "GoldenRod", "HotPink", "CadetBlue", "SeaGreen", "Chocolate", "BlueViolet", "Firebrick"]
const MARGIN = { top: 30, right: 30, bottom: 50, left: 50 };

export const LineChart = ({ Width, Height, Plot }: LineChartProps) => {
    const axesRef = useRef(null)
    const boundsWidth = Width - MARGIN.right - MARGIN.left - 0.5 * MARGIN.left;
    const boundsHeight = Height - MARGIN.top - MARGIN.bottom;
    const [Group, setGroup] = useState(group(Plot.Data, (d) => d[Plot.GroupBy!])) // Group data by wanted column

    const yScale = useMemo(() => {
        const [min, max] = extent(Plot.Data, function (d) {
            return parseInt(d[Plot.Axis[1]]!)
        })

        if (min === undefined || max === undefined) {
            return scaleLinear();
        }

        return scaleLinear().domain([min, max]).range([boundsHeight, 0]);
    }, [Plot, boundsHeight]);

    // X axis
    const xScale = useMemo(() => {
        const [min, max] = extent(Plot.Data, function (d) {
            return parseInt(d[Plot.Axis[0]]!)
        })

        if (min === undefined || max === undefined) {
            return scaleLinear();
        }

        return scaleLinear().domain([min, max]).range([0, boundsWidth]);
    }, [Plot, boundsWidth]);

    //Groups
    useEffect(() => {
        setGroup(group(Plot.Data, (d) => d[Plot.GroupBy!]));
    }, [Plot]);

    // Draw Axis
    useEffect(() => {
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

    // Colors
    const colorscale = scaleOrdinal<string>().range(COLORS)

    // Init line-generator
    const reactLine = line<EpidemiologyData>()
        .x(d => xScale(parseInt((d[Plot.Axis[0]])!)))
        .y(d => yScale(parseInt((d[Plot.Axis[1]])!)));

    //Create line-paths
    let paths: string[] = [];
    Group.forEach(country => {
        paths.push(reactLine(country)!)
    });

    return (
        <div>
            <svg className="plot" width={Width} height={Height}>
                <text x={"50%"} y={MARGIN.top} textAnchor="middle">{Plot.Title}</text>
                <g
                    width={boundsWidth}
                    height={boundsHeight}
                    transform={`translate(${[MARGIN.left, MARGIN.top].join(",")})`}
                >
                    {paths.map((path, index) => (
                        <path key={index}
                            d={path} style={{ fill: "none", stroke: colorscale(index.toString()), strokeWidth: "1px" }}
                        ></path>
                    ))}
                </g>
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

export default LineChart;