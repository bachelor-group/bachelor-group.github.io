import { axisBottom, axisLeft, line, scaleOrdinal, select, zoom } from 'd3';
import { zoomIdentity } from 'd3-zoom';
import { MouseEvent, useEffect, useMemo, useRef, useState } from 'react';
import { filterDataBasedOnProps } from '../DataContext/LoadData';
import { DataType } from '../DataContext/MasterDataType';
import { Plot } from './PlotType';
import { DataAccessor, Scale } from './Scaling';


interface LineChartProps {
    Width: number,
    Height: number,
    Plot: Plot,
    Colors: string[],
}

const MARGIN = { top: 30, right: 30, bottom: 50, left: 50 };

export const LineChart = ({ Width, Height, Plot, Colors }: LineChartProps) => {
    const axesRef = useRef(null)
    const svgRef = useRef(null)
    const divRef = useRef(null)
    const boundsWidth = Width - MARGIN.right - MARGIN.left - 0.5 * MARGIN.left;
    const boundsHeight = Height - MARGIN.top - MARGIN.bottom;
    const [Tooltipx, setTooltipx] = useState(50);
    const [dots, setdots] = useState<{ x: number, y: number, color: string }[]>([]);
    const [showToolTip, setShowTooltip] = useState(false);

    const [filteredData, setFilteredData] = useState<Map<string, DataType[]>>(new Map());
    const [mounted, setMounted] = useState(false);

    // zoomedScales are the domain of the scales
    const [zoomedxScale, setzoomedxScale] = useState<Date[] | number[]>([]);
    const [zoomedyScale, setzoomedyScale] = useState<Date[] | number[]>([]);

    useEffect(() => {
        if (!mounted && axesRef.current !== null) setMounted(true);
    });

    useEffect(() => {
        setFilteredData(filterDataBasedOnProps(Plot.MapData, filteredData, [Plot.Axis[1]]));
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

    // Draw Axis
    const [xAxis, yAxis] = useMemo(() => {
        const svgElement = select(axesRef.current);
        svgElement.selectAll("*").remove();
        const xAxisGenerator = axisBottom(xScale).ticks(10, "s").tickSize(-boundsHeight);

        let Axes = []

        Axes.push(svgElement
            .append("g")
            .attr("transform", "translate(0," + boundsHeight + ")")
            .call(xAxisGenerator)
        );

        const yAxisGenerator = axisLeft(yScale).ticks(10, "s").tickSize(-boundsWidth);

        Axes.push(svgElement.append("g").call(yAxisGenerator));
        return Axes
    }, [xScale, yScale, mounted]);

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

                // recover the new scale
                let newxScale = event.transform.rescaleX(xScale);
                let newyScale = event.transform.rescaleY(yScale);

                setzoomedxScale(newxScale.domain())
                setzoomedyScale(newyScale.domain())

                // update axes with these new boundaries
                let yAxisGenerator = axisLeft(newyScale).tickSize(-boundsWidth)
                if (typeof yScale.domain()[0] === "number") {
                    yAxisGenerator = axisLeft(newyScale).ticks(10, "s").tickSize(-boundsWidth)
                }
                xAxis.call(axisBottom(newxScale).tickSize(-boundsHeight))
                yAxis.call(yAxisGenerator)

                // update paths
                select(svgRef.current)
                    .selectAll(".line")
                    .attr('transform', t);
            }));
        // Translate and scale the initial map
        svg.call(Zoom.transform, zoomIdentity);

        // Use Zoom function
        svg.call(Zoom)

        return Zoom
    }, [xAxis, xScale, yScale])

    // Colors
    const colorscale = scaleOrdinal<string>().range(Colors)

    // Init line-generator
    const reactLine = line<DataType>()
        .x(d => xScale(xValue(d)!))
        .y(d => yScale(yValue(d)!))

    //Create line-paths
    let paths: string[] = [];
    let countries: string[] = [];

    filteredData.forEach((data, locationKey) => {
        paths.push(reactLine(data)!)
        countries.push(locationKey)
    })

    // TODO: NEEDS MAJOR REFACTORING
    //ToolTip
    function updateTooltip(event: MouseEvent<SVGSVGElement, globalThis.MouseEvent>) {
        // Create a scale with zoom
        let currentScale = xScale.copy()
        currentScale.domain(zoomedxScale)
        let currentyScale = yScale.copy()
        currentyScale.domain(zoomedyScale)

        // Find Date of hovered pixel
        let hoveredXValue = currentScale.invert(event.nativeEvent.offsetX - MARGIN.left - 5)
        let displayText = hoveredXValue.toString()

        // If date remove time, we only use the actual date
        if (typeof hoveredXValue !== "number") {
            let date = hoveredXValue.toISOString().split("T")[0]
            displayText = date;
        }
        else {
            displayText = Math.round(hoveredXValue).toString();
        }

        // Create points dots and move line to pointer
        let newdots: typeof dots = []
        let dataPoints: { country: string, data: DataType }[] = []
        filteredData.forEach((countryData, country) => {
            let id = countryData.findIndex((d) => d[Plot.Axis[0]] == displayText)

            if (id !== -1 && yValue(countryData[id])) {
                dataPoints.push({ country: country!, data: countryData[id] })
                newdots.push({ x: (event.nativeEvent.offsetX - MARGIN.left - 5), y: currentyScale(yValue(countryData[id])!), color: colorscale(country!) })
            }
        })

        let divxPosFactor = 0
        if (event.nativeEvent.offsetX > Width / 2) {
            divxPosFactor = -1;
        }

        let divSelect = select(divRef.current).attr("style", `left: 0; transform: translate(calc(${event.nativeEvent.offsetX}px + ${divxPosFactor === 0 ? 1 : -1} * 10px + ${divxPosFactor} * 100%)); top: ${event.nativeEvent.offsetY}px; position: absolute`)


        let header = divSelect.selectAll(".popover-header")
            .html(`<strong>${displayText}</strong>`)

        header.exit().remove()

        let div = divSelect.selectAll(".tooltip-body")
            //@ts-ignore
            .data(dataPoints, d => d.location_key)

        div
            .enter()
            .append("div")
            .attr("class", "tooltip-body")
            .attr("style", "text-align: center;")
            .text(d => `${d.country}: ${d.data[Plot.Axis[1]]!.replace(/\B(?=(\d{3})+(?!\d))/g, " ")}`)
            .style("color", d => colorscale(d.country))

        div.transition().duration(0)
            .text(d => `${d.country}: ${d.data[Plot.Axis[1]]}`)
            .style("color", d => colorscale(d.country))

        div.exit().remove()

        setdots(newdots);
        setTooltipx(event.nativeEvent.offsetX - MARGIN.left - 5);
    }

    return (
        <div style={{ position: "relative" }}>
            {filteredData.size !== 0 && Array.from(filteredData.values()).flat().length !== 0 ?
                <>
                    <svg className="plot" width={Width} height={Height} ref={svgRef} onMouseMove={(event) => (updateTooltip(event))} onMouseEnter={() => (setShowTooltip(true))} onMouseLeave={() => (setShowTooltip(false))}>
                        <clipPath id={`cut-off-bottom-${Plot.Title.replaceAll(" ", "-")}`}>
                            <rect x={0} width={boundsWidth} y={0} height={boundsHeight} />
                        </clipPath>
                        <text x={"50%"} y={MARGIN.top * 0.5} textAnchor="middle" dominantBaseline='middle'>{Plot.Title}</text>
                        <g
                            width={boundsWidth}
                            height={boundsHeight}
                            transform={`translate(${[MARGIN.left, MARGIN.top].join(",")})`}
                            clipPath={`url(#cut-off-bottom-${Plot.Title.replaceAll(" ", "-")})`}
                        >
                            <line className='line' x1={0} x2={boundsWidth} y1={yScale(0)} y2={yScale(0)} strokeWidth={0.5} stroke="black" />
                            {paths.map((path, index) => (
                                <path className='line' key={index}
                                    d={path} style={{ fill: "none", stroke: colorscale(countries[index]), strokeWidth: 1 }}
                                ></path>
                            ))}


                            {/* Tooltips */}
                            <line x1={Tooltipx} x2={Tooltipx} y1={0} y2={boundsHeight} stroke='black' opacity={showToolTip ? 1 : 0} />

                            {dots.map((points, index) => (
                                <circle key={index} cx={points["x"]} cy={points["y"]} r={4} fill={points["color"]} opacity={showToolTip ? 1 : 0} />
                            ))}
                        </g>

                        {/* Axis */}
                        <g
                            width={boundsWidth}
                            height={boundsHeight}
                            ref={axesRef}
                            transform={`translate(${[MARGIN.left, MARGIN.top].join(",")})`}
                        />

                        {/* Legend */}
                        <g width={80} height={countries.length * 25} transform={`translate(${[MARGIN.left + boundsWidth / 20, MARGIN.top].join(",")})`} >
                            <rect x={0} y={0} width={50} height={countries.length * 25} fill={"#ffffff"} strokeWidth={1} stroke={"gray"} />
                            {countries.map((country, i) =>
                                <g key={i}>
                                    <circle key={i + 1} cx={10} cy={11.3 + i * 25} fill={colorscale(country)} r={4}></circle>
                                    <text key={i + 2} x={10 + 10} y={13 + i * 25} fill={colorscale(country)} textAnchor='left' dominantBaseline='middle'> {country}</text>
                                </g>
                            )}
                        </g>
                    </svg>
                    <div ref={divRef} style={{ display: showToolTip ? "block" : "none" }} className='tool-tip fade show popover bs-popover-end'>
                        <div className='popover-header'></div>
                    </div>
                </>
                :
                <>
                </>
            }
        </div>
    );
}

export default LineChart;
