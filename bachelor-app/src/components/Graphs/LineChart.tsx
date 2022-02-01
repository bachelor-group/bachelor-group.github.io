import { axisBottom, axisLeft, group, line, max, min, scaleOrdinal, select, zoom } from 'd3';
import { useEffect, useMemo, useRef, useState } from 'react';
import { EpidemiologyData } from "../DataContext/DataTypes";
import { zoomIdentity } from 'd3-zoom';
import { Plot } from './PlotType';
import { DataAccessor, Scale } from './Scaling';


interface LineChartProps {
    Width: number,
    Height: number,
    Plot: Plot,
}

const COLORS = ["Blue", "Coral", "DodgerBlue", "SpringGreen", "YellowGreen", "Green", "OrangeRed", "Red", "GoldenRod", "HotPink", "CadetBlue", "SeaGreen", "Chocolate", "BlueViolet", "Firebrick"]
const MARGIN = { top: 30, right: 30, bottom: 50, left: 50 };

export const LineChart = ({ Width, Height, Plot }: LineChartProps) => {
    const axesRef = useRef(null)
    const svgRef = useRef(null)
    const boundsWidth = Width - MARGIN.right - MARGIN.left - 0.5 * MARGIN.left;
    const boundsHeight = Height - MARGIN.top - MARGIN.bottom;
    const [Group, setGroup] = useState(group(Plot.Data, (d) => d[Plot.GroupBy!])) // Group data by wanted column

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

    //Groups
    useEffect(() => {
        setGroup(group(Plot.Data, (d) => d[Plot.GroupBy!]));
    }, [Plot]);

    // Draw Axis
    const [xAxis, yAxis] = useMemo(() => {
        const svgElement = select(axesRef.current);
        svgElement.selectAll("*").remove();
        const xAxisGenerator = axisBottom(xScale);

        let AxisBoys = []

        AxisBoys.push(svgElement
            .append("g")
            .attr("transform", "translate(0," + boundsHeight + ")")
            .call(xAxisGenerator)
        );

        const yAxisGenerator = axisLeft(yScale).ticks(10, "s").tickSize(-boundsWidth);

        AxisBoys.push(svgElement.append("g").call(yAxisGenerator));
        return AxisBoys
    }, [xScale, yScale, boundsHeight]);

    //ZOOM
    const Zoom = useMemo(() => {
        let svg = select<SVGSVGElement, unknown>(svgRef.current!)
        let Zoom = zoom<SVGSVGElement, unknown>()
            .extent([
                [0, 0],
                [Width, Height]
            ])
            .translateExtent([[0, 0], [Width, Height]]) // Set pan Borders
            .scaleExtent([1, 32])
            .on("zoom", ((event) => {
                let t = event.transform
                t.x = min([t.x, 0]);
                t.y = min([t.y, 0]);
                t.x = max([t.x, (1 - t.k) * Width]);
                t.y = max([t.y, (1 - t.k) * Height]);

                // recover the new scale
                var newX = t.rescaleX(xScale);
                var newY = t.rescaleY(yScale);

                // update axes with these new boundaries
                xAxis.call(axisBottom(newX))
                yAxis.call(axisLeft(newY))

                // update circle position
                select(svgRef.current)
                    .selectAll(".line")
                    .attr('transform', t);
                // .attr('cx', function (d) { return newX(d.Sepal_Length) })
                // .attr('cy', function (d) { return newY(d.Petal_Length) });
            }));
        // Translate and scale the initial map
        svg.call(Zoom.transform, zoomIdentity);

        // Use Zoom function
        svg.call(Zoom)

        return Zoom
    }, [xAxis, xScale, yScale])

    // Colors
    const colorscale = scaleOrdinal<string>().range(COLORS)

    // Init line-generator
    const reactLine = line<EpidemiologyData>()
        .x(d => xScale(xValue(d)!))
        .y(d => yScale(yValue(d)!))
    // .curve(curveBasis);

    //Create line-paths
    let paths: string[] = [];
    let countries: string[] = [];
    Group.forEach((countryData, country) => {
        paths.push(reactLine(countryData)!)
        countries.push(country!);
    });

    return (
        <div>
            <svg className="plot" width={Width} height={Height} ref={svgRef}>
                <text x={"50%"} y={MARGIN.top * 0.5} textAnchor="middle" alignmentBaseline='middle'>{Plot.Title}</text>
                <g
                    width={boundsWidth}
                    height={boundsHeight}
                    transform={`translate(${[MARGIN.left, MARGIN.top].join(",")})`}
                >
                    {paths.map((path, index) => (
                        <path className='line' key={index}
                            d={path} style={{ fill: "none", stroke: colorscale(countries[index]), strokeWidth: 1 }}
                        ></path>
                    ))}


                    {/* .style("fill", function(d){ return color(d)}) */}

                </g>
                <g
                    width={boundsWidth}
                    height={boundsHeight}
                    ref={axesRef}
                    transform={`translate(${[MARGIN.left, MARGIN.top].join(",")})`}
                />
                <g width={80} height={countries.length * 25} transform={`translate(${[MARGIN.left + boundsWidth / 20, MARGIN.top].join(",")})`} >
                    <rect x={0} y={0} width={50} height={countries.length * 25} fill={"#ffffff"} strokeWidth={1} stroke={"gray"} />
                    {countries.map((country, i) =>
                        <g key={i}>
                            <circle key={i + 1} cx={10} cy={11.3 + i * 25} fill={colorscale(country)} r={4}></circle>
                            <text key={i + 2} x={10 + 10} y={13 + i * 25} fill={colorscale(country)} textAnchor='left' alignmentBaseline='middle'> {country}</text>
                        </g>
                    )}
                </g>
            </svg>
        </div>
    );
}

export default LineChart;
