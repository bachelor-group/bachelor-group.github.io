import { axisTop, descending, easeLinear, format, hsl, HSLColor, interpolate, interval, max, scaleLinear, select, Timer } from 'd3';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Button } from 'react-bootstrap';
import { DataType } from '../DataContext/MasterDataType';
import { SearchTrendsList } from '../SearchTrends/Old_script';
import { Plot } from './PlotType';

interface BarRaceProps {
    Width: number,
    Height: number,
    Plot: Plot,
}

const MARGIN = { top: 50, right: 20, bottom: 0, left: 20 };

type Bar = {
    Data: DataType,
    sorted: { property: (keyof DataType), lastValue: number, value: number, colour: HSLColor, rank: number }[],
}

function BarRace({ Width, Height, Plot }: BarRaceProps) {
    //Refs
    const axesRef = useRef(null);
    const titleRef = useRef(null);
    const boundsRef = useRef(null);
    const svgRef = useRef(null);

    //Number of Bars
    const [top_n, setTop_n] = useState(12)

    //Bounds
    const boundsWidth = Width - MARGIN.right - MARGIN.left - 0.5 * MARGIN.left;
    const boundsHeight = Height - MARGIN.top - MARGIN.bottom;
    let barPadding = (Height - (MARGIN.bottom + MARGIN.top)) / (top_n * 5);

    //Data
    const [Data, setData] = useState<DataType[]>([]);
    const [barsData, setBarsData] = useState<Bar[]>([]);
    const [countries, setCountries] = useState<string[]>([]);

    //Animation
    const [ticker, setTicker] = useState<Timer>();
    const [tickDuration, setTickDuration] = useState(500);
    const [startDate, setStartDate] = useState('2020-01-01');


    // Handle new Data
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
                            setBarsData(newBarsData);
                            return

                        }
                    }
                    unsorted_list.push({ property: element, lastValue: -1, value: newBar.Data[element] !== "" ? parseFloat(newBar.Data[element]!) : 0, colour: colourDict[element]!, rank: -1 });
                }
                newBar.sorted = unsorted_list.sort((a, b) => descending(a.value, b.value))
                for (let j = 0; j < newBar.sorted.length; j++) {
                    newBar.sorted[j].rank = j;
                    if (i === 0) {
                        newBar.sorted[j].lastValue = newBar.sorted[j].value;
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
            let tickerTemp = interval(e => {
                if (cursor >= barsData.length - 1) { tickerTemp.stop(); setTicker(undefined); return };
                cursor = cursor + 1;
                updatePlot(cursor);
            }, tickDuration);
            setTicker(tickerTemp);
        }
    }

    // FindDateIndex takes a date as a string and finds index in barsData state.
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

    //Set new Data
    useEffect(() => {
        if (Plot.Data.length !== 0) {
            setData(Plot.Data)
        }
    }, [Plot]);

    // Y axis
    const yScale = useMemo(() => {
        return scaleLinear().domain([top_n, 0]).range([boundsHeight, 0]);
    }, [barsData, boundsHeight, top_n]);

    // X axis
    let xScale = useMemo(() => {
        if (barsData.length === 0) {
            return scaleLinear()
        }
        const maxValue = max(barsData[0].sorted, (element) => element.value);
        return scaleLinear().domain([0, maxValue!]).range([0, boundsWidth - MARGIN.left - MARGIN.right])
    }, [barsData, boundsWidth]);

    const xAxisGenerator = axisTop(xScale).tickSize(-(boundsHeight));

    // Draw Axes

    useEffect(() => {
        const svgElement = select(axesRef.current);
        svgElement.selectAll("*").remove();
        svgElement
            .append("g")
            .attr("class", "x-axis")
            .attr("transform", "translate(0," + MARGIN.top + ")")
            .call(xAxisGenerator);
    }, [xScale])


    // Draw When Data arrives
    useEffect(() => {
        if (barsData.length !== 0) drawPlot();
    }, [barsData])

    useEffect(() => {
        if (barsData.length !== 0) updatePlot();
    }, [startDate, top_n])

    //Initial draw
    function drawPlot(cursor = FindDateIndex(startDate)) {
        let transitionLength = 250;
        let delay = 80;
        let currentSlice = barsData[cursor].sorted.slice(0, top_n)
        // @ts-ignore
        let bars = select(boundsRef.current).selectAll("rect").data(currentSlice, d => d.property);
        bars
            .enter()
            .append('rect')
            .attr("x", xScale(0) + 1)
            .attr("y", d => yScale(d.rank) + 5)
            .attr("height", yScale(1) - yScale(0) - barPadding)
            .style("fill", (d) => d.colour.toString())
            .style("stroke", "black")
            .style("stroke-width", "1px")
            .attr("width", d => 0)
            .transition()
            .duration(transitionLength)
            .ease(easeLinear)
            .attr("width", d => xScale(d.value))
            .delay(function (d, i) { return (i * delay) });

        // @ts-ignore
        let labels = select(boundsRef.current).selectAll('.label').data(currentSlice, d => d.property);

        labels
            .enter()
            .append('text')
            .attr("class", 'label')
            .attr("x", d => xScale(d.value) - 8)
            .attr("y", d => yScale(d.rank) + (yScale(1) - yScale(0)) / 2 - 20)
            .attr('text-anchor', 'end')
            .attr("dominant-baseline", "middle")
            .html(d => d.property.slice(14).replace("_", " "))
            .attr("opacity", 0)
            .transition()
            .duration(transitionLength / 10)
            .ease(easeLinear)
            .delay(function (d, i) { return transitionLength + (i) * delay })
            .attr("y", d => yScale(d.rank) + (yScale(1) - yScale(0)) / 2)
            .attr("opacity", 1);

        // @ts-ignore
        let valueLabels = select(boundsRef.current).selectAll('.valueLabel').data(currentSlice, d => d.property);
        valueLabels
            .enter()
            .append('text')
            .attr("class", 'valueLabel')
            .attr("x", d => xScale(d.value) + 5)
            .attr("y", d => yScale(d.rank) + (yScale(1) - yScale(0)) / 2 - 20)
            .attr("dominant-baseline", "middle")
            .attr("opacity", 0)
            .text(d => format(',.2f')(d.value))
            .transition()
            .duration(transitionLength / 10)
            .ease(easeLinear)
            .delay(function (d, i) { return transitionLength + (i) * delay })
            .attr("y", d => yScale(d.rank) + (yScale(1) - yScale(0)) / 2)
            .attr("opacity", 1);
    }

    function updatePlot(cursor = FindDateIndex(startDate)) {
        let svg = select(svgRef.current);

        xScale.domain([0, max(barsData[cursor].sorted, d => d.value)!]);

        svg.select('.x-axis').enter()
            //@ts-ignore
            .call(xAxisGenerator);

        svg.select('.x-axis')
            .transition()
            .duration(tickDuration)
            .ease(easeLinear)
            //@ts-ignore
            .call(xAxisGenerator);

        let currentSlice = barsData[cursor].sorted.slice(0, top_n)

        let date = select(titleRef.current)//.data(barsData[cursor].Data["date"]!)

        date.text(`${Plot.Title} Current Date: ${barsData[cursor].Data["date"]}`)

        // @ts-ignore
        let bars = select(boundsRef.current).selectAll("rect").data(currentSlice, d => d.property);
        bars
            .enter()
            .append('rect')
            .attr("x", xScale(0) + 1)
            .attr("y", d => yScale(top_n))
            .attr("height", yScale(1) - yScale(0) - barPadding)
            .style("fill", (d) => d.colour.toString())
            .style("stroke", "black")
            .style("stroke-width", "1px")
            .attr("width", d => xScale(currentSlice[top_n - 1]["value"]))
            .transition()
            .duration(tickDuration)
            .ease(easeLinear)
            .attr("width", d => xScale(d.value))
            .attr("height", yScale(1) - yScale(0) - barPadding)
            .attr("y", d => yScale(d.rank) + barPadding / 2);

        bars
            .transition()
            .duration(tickDuration)
            .ease(easeLinear)
            .attr("width", d => xScale(d.value))
            .attr("height", yScale(1) - yScale(0) - barPadding)
            .attr("y", d => yScale(d.rank) + barPadding / 2);

        bars
            .exit()
            .transition()
            .duration(tickDuration)
            .ease(easeLinear)
            .attr("width", d => xScale(currentSlice[top_n - 1]["value"]))
            .attr("y", yScale(top_n) + 10)
            .remove();

        // @ts-ignore
        let labels = select(boundsRef.current).selectAll('.label').data(currentSlice, d => d.property);

        labels
            .enter()
            .append('text')
            .attr("class", 'label')
            .attr("x", d => xScale(currentSlice[top_n - 1]["value"]))
            .attr("y", d => yScale(top_n) + (yScale(1) - yScale(0)) / 2)
            .attr('text-anchor', 'end')
            .attr("dominant-baseline", "middle")
            .html(d => d.property.slice(14).replace("_", " "))
            .transition()
            .duration(tickDuration)
            .ease(easeLinear)
            .attr("y", d => yScale(d.rank) + (yScale(1) - yScale(0)) / 2)
            .attr("x", d => xScale(d.value) - 8)


        labels
            .transition()
            .duration(tickDuration)
            .ease(easeLinear)
            .attr("x", d => xScale(d.value) - 8)
            .attr("y", d => yScale(d.rank) + (yScale(1) - yScale(0)) / 2);

        labels
            .exit()
            .transition()
            .duration(tickDuration)
            .ease(easeLinear)
            //@ts-ignore
            .attr("x", d => xScale(currentSlice[top_n - 1]["value"]) - 8)
            .attr("y", d => yScale(top_n) + (yScale(1) - yScale(0)) / 2)
            .remove();

        // @ts-ignore
        let valueLabels = select(boundsRef.current).selectAll('.valueLabel').data(currentSlice, d => d.property);

        valueLabels
            .enter()
            .append('text')
            .attr("class", 'valueLabel')
            .attr("x", d => xScale(currentSlice[top_n - 1]["value"]))
            .attr("y", d => yScale(top_n) + (yScale(1) - yScale(0)) / 2)
            .attr("dominant-baseline", "middle")
            .text(d => format(',.2f')(d.value))
            .transition()
            .duration(tickDuration)
            .ease(easeLinear)
            .attr("x", d => xScale(d.value) + 5)
            .attr("y", d => yScale(d.rank) + (yScale(1) - yScale(0)) / 2)


        valueLabels
            .transition()
            .duration(tickDuration)
            .ease(easeLinear)
            .tween("text", function (d) {
                let i = interpolate(d.lastValue, d.value);
                return function (t) {
                    select(this).text(format(',.2f')(i(t)));
                };
            })
            .attr("x", d => xScale(d.value) + 5)
            .attr("y", d => yScale(d.rank) + (yScale(1) - yScale(0)) / 2);

        valueLabels
            .exit()
            .transition()
            .duration(tickDuration)
            .ease(easeLinear)
            .attr("x", d => xScale(currentSlice[top_n - 1]["value"]))
            .attr("y", d => yScale(top_n) + (yScale(1) - yScale(0)) / 2)
            .remove();
    }


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

    function handleNumberBarsChange(event: React.ChangeEvent<HTMLInputElement>) {
        if (ticker === undefined) {
            setTop_n(parseInt(event.target.value));
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

                            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                <label htmlFor="numberBars">Number of Bars:</label>
                                <input type="number" name="numberBars" id="" min={1} max={50} value={top_n}
                                    onChange={(e) => handleNumberBarsChange(e)} />
                            </div>

                            <Button onClick={() => Animate()}>{ticker === undefined ? "Start me" : "Stop me"}</Button>
                        </div>
                        < svg width={Width} height={Height} style={{ display: "inline-block" }} ref={svgRef}>
                            <text ref={titleRef} x={"50%"} y={MARGIN.top * 0.5} textAnchor="middle" dominantBaseline='middle'>{Plot.Title}</text>
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