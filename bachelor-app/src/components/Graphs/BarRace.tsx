import { ascending, axisBottom, axisLeft, axisTop, descending, easeLinear, extent, format, hsl, HSLColor, interpolate, interpolateRound, interval, max, scaleBand, scaleLinear, scaleOrdinal, select, selectAll, tickIncrement, timeout, Timer } from 'd3';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Button } from 'react-bootstrap';
import { DataType } from '../DataContext/MasterDataType';
import { SearchTrendsList } from '../SearchTrends/Old_script';
import { Plot } from './PlotType';
// import { useSpring, animated, useTransition } from 'react-spring'

interface BarRaceProps {
    Width: number,
    Height: number,
    Plot: Plot,
}

const MARGIN = { top: 50, right: 20, bottom: 0, left: 20 };
let top_n = 12;

type Bar = {
    Data: DataType,
    sorted: { property: (keyof DataType), lastValue: number, value: number, colour: HSLColor, rank: number }[],
}

function BarRace({ Width, Height, Plot }: BarRaceProps) {
    const axesRef = useRef(null);
    const titleRef = useRef(null);
    const boundsRef = useRef(null);
    const svgRef = useRef(null);
    const boundsWidth = Width - MARGIN.right - MARGIN.left - 0.5 * MARGIN.left;
    const boundsHeight = Height - MARGIN.top - MARGIN.bottom;
    const [Data, setData] = useState<DataType[]>([]);
    const [barsData, setBarsData] = useState<Bar[]>([]);
    const [countries, setCountries] = useState<string[]>([]);
    const [ticker, setTicker] = useState<Timer>();
    const [tickDuration, setTickDuration] = useState(500);
    const [startDate, setStartDate] = useState('2020-01-01');

    let barPadding = (Height - (MARGIN.bottom + MARGIN.top)) / (top_n * 5);

    // Handle Data
    useEffect(() => {
        if (Plot.Data.length !== 0) {
            let newBarsData: Bar[] = []

            if (countries.length > 1) {
                throw ("Currently only 1 country supported")
            }

            let colourDict: { [property: string]: HSLColor } = {}

            for (let i = 0; i < SearchTrendsList.length; i++) {
                colourDict[SearchTrendsList[i]] = hsl(Math.random() * 360, 0.75, 0.75)
            }

            let prevBar: Bar | null = null;

            for (let i = 0; i < Data.length; i++) {
                const element = Data[i];
                let newBar: Bar = { Data: element, sorted: [] };
                let unsorted_list: { property: (keyof DataType), lastValue: number, value: number, colour: HSLColor, rank: number }[] = []
                let undefinedData = 0;

                for (let i = 0; i < SearchTrendsList.length; i++) {
                    const element = SearchTrendsList[i];
                    if (!newBar.Data[element]) {
                        undefinedData += 1
                        if (undefinedData === SearchTrendsList.length) {
                            console.log("Returned")
                            console.log(newBar.Data[element])
                            setBarsData(newBarsData);
                            return

                        }
                    }
                    unsorted_list.push({ property: element, lastValue: -1, value: newBar.Data[element] !== "" ? parseFloat(newBar.Data[element]!) : 0, colour: colourDict[element]!, rank: -1 });
                    // console.log(unsorted_list[unsorted_list.length-1])
                }
                newBar.sorted = unsorted_list.sort((a, b) => descending(a.value, b.value))
                for (let j = 0; j < newBar.sorted.length; j++) {
                    newBar.sorted[j].rank = j;
                    if (i === 0) {
                        newBar.sorted[j].lastValue = 0;
                    } else {
                        newBar.sorted[j].lastValue = prevBar!.sorted[prevBar!.sorted.findIndex(e => e.property === newBar.sorted[j].property)].value
                    }
                }
                newBarsData.push(newBar)
                prevBar = newBar;
            }
            setBarsData(newBarsData);
        }
    }, [Data])

    async function Animate() {
        // Animation is already playing
        if (ticker !== undefined) {
            ticker.stop();
            setTicker(undefined);
        }
        else {
            let cursor = FindDateIndex(startDate) - 1

            let svg = select(svgRef.current)
            setTicker(interval(e => {
                cursor = cursor + 1
                if (cursor === barsData.length - 1) ticker!.stop();

                xScale.domain([0, max(barsData[cursor].sorted, d => d.value)!]);

                svg.select('.x-axis')
                    .transition()
                    .duration(tickDuration)
                    .ease(easeLinear)
                    //@ts-ignore
                    .call(xAxisGenerator);

                let currentSlice = barsData[cursor].sorted

                let date = select(titleRef.current)//.data(barsData[cursor].Data["date"]!)

                date.text(`${Plot.Title} Current Date: ${barsData[cursor].Data["date"]}`)

                // @ts-ignore
                let bars = select(boundsRef.current).selectAll("rect").data(currentSlice, d => d.property);
                bars
                    .enter()
                    .append('rect')
                    .attr("x", xScale(0) + 1)
                    .attr("width", d => xScale(d.value))
                    .attr("y", d => yScale(d.rank) + 5)
                    .attr("height", yScale(1) - yScale(0) - barPadding)
                    .style("fill", (d) => d.colour.toString())
                    .style("stroke", "black")
                    .style("stroke-width", "1px")
                    .transition()
                    .duration(tickDuration)
                    .ease(easeLinear)
                    .attr("y", d => yScale(d.rank));

                bars
                    .transition()
                    .duration(tickDuration)
                    .ease(easeLinear)
                    .attr("width", d => xScale(d.value))
                    .attr("y", d => yScale(d.rank) + 5);

                bars
                    .exit()
                    .transition()
                    .duration(tickDuration)
                    .ease(easeLinear)
                    .remove();

                // @ts-ignore
                let labels = select(boundsRef.current).selectAll('.label').data(currentSlice, d => d.property);

                labels
                    .enter()
                    .append('text')
                    .attr("class", 'label')
                    .attr("x", d => xScale(d.value) - 8)
                    .attr("y", d => yScale(d.rank) + (yScale(1) - yScale(0)) / 2 + 5)
                    .attr('text-anchor', 'end')
                    .html(d => d.property.slice(14).replace("_", " "))
                    .transition()
                    .duration(tickDuration)
                    .ease(easeLinear)
                    .attr("y", d => yScale(d.rank) + (yScale(1) - yScale(0)) / 2 + 5);

                labels
                    .transition()
                    .duration(tickDuration)
                    .ease(easeLinear)
                    .attr("x", d => xScale(d.value) - 8)
                    .attr("y", d => yScale(d.rank) + (yScale(1) - yScale(0)) / 2 + 5);

                labels
                    .exit()
                    .transition()
                    .duration(tickDuration)
                    .ease(easeLinear)
                    //@ts-ignore
                    .attr("x", d => xScale(d.value) - 8)
                    //@ts-ignore
                    .attr("y", d => yScale(d.rank) + (yScale(1) - yScale(0)) / 2 + 5)
                    .remove();

                // @ts-ignore
                let valueLabels = select(boundsRef.current).selectAll('.valueLabel').data(currentSlice, d => d.property);

                valueLabels
                    .enter()
                    .append('text')
                    .attr("class", 'valueLabel')
                    .attr("x", d => xScale(d.value) + 5)
                    .attr("y", d => yScale(d.rank) + (yScale(1) - yScale(0)) / 2 + 5)
                    .text(d => format(',.1f')(d.lastValue))


                valueLabels
                    .transition()
                    .duration(tickDuration)
                    .ease(easeLinear)
                    .tween("text", function (d) {
                        let i = interpolate(d.lastValue, d.value);
                        return function (t) {
                            select(this).text(format(',.1f')(i(t)));
                        };
                    })
                    .attr("x", d => xScale(d.value) + 5)
                    .attr("y", d => yScale(d.rank) + (yScale(1) - yScale(0)) / 2 + 5);

                valueLabels
                    .exit()
                    .remove();
            }, tickDuration));
        }
    }

    function FindDateIndex(requestedDate: string) {
        if (barsData.length === 0) {
            throw (`BarsData was not set, but Date: ${requestedDate} was requested`)
        }
        for (let i = 0; i < barsData.length; i++) {
            const element = barsData[i]["Data"];
            if (element["date"] === requestedDate) {
                return i
            }

        }
        return -1
    }

    useEffect(() => {
        if (Plot.Data.length !== 0) {
            setData(Plot.Data)
        }
    }, [Plot]);

    // Y axis
    const yScale = useMemo(() => {
        return scaleLinear().domain([top_n, 0]).range([boundsHeight, 0]);
    }, [barsData, boundsHeight]);

    // X axis
    let xScale = useMemo(() => {
        if (barsData.length === 0) {
            return scaleLinear()
        }
        const [min, max] = extent(barsData[0].sorted, (element) => element.value);
        return scaleLinear().domain([0, max!]).range([0, boundsWidth - MARGIN.left - MARGIN.right])
    }, [barsData, boundsWidth]);

    // Draw Axes
    const svgElement = select(axesRef.current);
    svgElement.selectAll("*").remove();
    const xAxisGenerator = axisTop(xScale).tickSize(-(boundsHeight));
    svgElement
        .append("g")
        .attr("class", "x-axis")
        .attr("transform", "translate(0," + MARGIN.top + ")")
        .call(xAxisGenerator);


    // Draw When Data arrives
    useEffect(() => {
        if (barsData.length !== 0) {
            let transitionLength = 1000;
            // Create Bars
            // @ts-ignore
            let bars = select(boundsRef.current).selectAll("rect").data(barsData[0].sorted, d => d.property);
            bars
                .enter()
                .append('rect')
                .attr("x", xScale(0) + 1)
                .attr("width", d => 0) // - xScale(0) - 1)
                .attr("y", d => yScale(d.rank) + 5)
                .attr("height", yScale(1) - yScale(0) - barPadding)
                .style("fill", (d) => d.colour.toString())
                .style("stroke", "black")
                .style("stroke-width", "1px")
                .transition()
                .duration(transitionLength)
                .attr("width", d => xScale(d.value));

            // Create Labels
            // @ts-ignore
            let labels = select(boundsRef.current).selectAll('.label').data(barsData[0].sorted, d => d.property);
            labels
                .enter()
                .append('text')
                .attr("class", 'label')
                .attr("x", d => xScale(d.value) - 8)
                .attr("y", d => yScale(d.rank) + (yScale(1) - yScale(0)) / 2 + 5)
                .attr("opacity", 0)
                .attr('text-anchor', 'end')
                .html(d => d.property.slice(14).replace("_", " "))
                .transition()
                .duration(transitionLength)
                .transition()
                .duration(transitionLength / 2)
                .ease(easeLinear)
                .attr("opacity", 1);


            // Create Axes
            xScale.domain([0, max(barsData[0].sorted, d => d.value)!]);
            let axesG = select(axesRef.current)
            axesG.selectAll("*").remove();
            axesG
                .append("g")
                .attr("class", "x-axis")
                .attr("transform", "translate(0," + MARGIN.top + ")")
                .call(axisTop(xScale).tickSize(-(boundsHeight)));

        }
    }, [barsData])


    // Speed Handling
    function handleSpeedChange(event: React.ChangeEvent<HTMLInputElement>) {
        if (ticker === undefined) {
            setTickDuration(parseInt(event.target.value));
        }
    }


    // Date Handling
    let maxDate = ""
    let minDate = ""

    if (barsData.length !== 0) {
        maxDate = barsData[barsData.length - 1]["Data"]["date"]!;
        minDate = barsData[0]["Data"]["date"]!;
    }

    function handleDateChange(event: React.ChangeEvent<HTMLInputElement>) {
        if (ticker === undefined) {
            if (event.target.value < minDate) {
                setStartDate(minDate);
            }
            else if (event.target.value > maxDate) {
                setStartDate(maxDate);
            }
            else {
                setStartDate(event.target.value);
            }
        }
    }

    return (
        <div style={{
            display: "flex", flexDirection: "column", alignItems: "center", border: "none"
        }} className="plot">
            {
                barsData.length !== 0 ?
                    <>
                        <div className='svg-header'>
                            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                <label htmlFor="Speed">Set Tickduration</label>
                                <input type="range" name="Speed" id="" value={tickDuration} onChange={(v) => handleSpeedChange(v)} max={1000} style={{ width: Width * 0.2 }} /> {tickDuration} ms
                            </div>

                            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                <label htmlFor="startDate">Start Date:</label>
                                <input type="date" name="startDate" id="" min={minDate} max={maxDate} value={startDate}
                                    onChange={(e) => handleDateChange(e)} />
                            </div>

                            <Button onClick={() => Animate()}>{ticker === undefined ? "Start me" : "Stop me"}</Button>
                        </div>
                        < svg width={Width} height={Height} style={{ display: "inline-block" }} ref={svgRef}>
                            <text ref={titleRef} x={"50%"} y={MARGIN.top * 0.5} textAnchor="middle" alignmentBaseline='middle'>{Plot.Title}</text>
                            {/* first group is for the violin and box shapes */}
                            <g
                                width={boundsWidth}
                                height={boundsHeight}
                                transform={`translate(${[MARGIN.left, MARGIN.top].join(",")})`}
                                ref={boundsRef}
                            />
                            {/* Second is for the axes */}
                            <g
                                width={boundsWidth}
                                height={boundsHeight}
                                ref={axesRef}
                                transform={`translate(${[MARGIN.left].join(",")})`}
                            />
                        </svg >
                        <p><i className='note'>*Note that the numbers are from 0 to 100. </i></p>
                    </>
                    : <></>
            }
        </div >

    );
}

export default BarRace;