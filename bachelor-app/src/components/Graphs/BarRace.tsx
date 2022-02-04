import { ascending, axisBottom, axisLeft, axisTop, descending, easeLinear, extent, format, hsl, HSLColor, interpolateRound, interval, max, scaleBand, scaleLinear, scaleOrdinal, select, selectAll, tickIncrement, timeout, Timer } from 'd3';
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

const MARGIN = { top: 50, right: 30, bottom: 50, left: 50 };
let top_n = 12;

type Bar = {
    Data: DataType,
    sorted: { property: (keyof DataType), lastValue: number, value: number, colour: HSLColor, rank: number }[],
}

let tickerInterval = 1000;

function BarRace({ Width, Height, Plot }: BarRaceProps) {
    const axesRef = useRef(null)
    const boundsRef = useRef(null);
    const boundsWidth = Width - MARGIN.right - MARGIN.left - 0.5 * MARGIN.left;
    const boundsHeight = Height - MARGIN.top - MARGIN.bottom;
    const [Data, setData] = useState<DataType[]>([]);
    const [startAnimation, setStartAnimation] = useState(true)
    const [barsData, setBarsData] = useState<Bar[]>([]);
    const [countries, setCountries] = useState<string[]>([]);
    const [ticker, setTicker] = useState<Timer>();

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
                for (let i = 0; i < SearchTrendsList.length; i++) {
                    const element = SearchTrendsList[i];
                    unsorted_list.push({ property: element, lastValue: -1, value: newBar.Data[element] !== "" ? parseFloat(newBar.Data[element]!) : 0, colour: colourDict[element]!, rank: -1 })
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
            let cursor = -1
            let svg = select(".bar-race")
            let tickDuration = 200
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
                    //@ts-ignore
                    .attr("width", d => xScale(d.value))
                    //@ts-ignore    
                    .attr("y", d => yScale(d.rank) + 5)
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

                // // @ts-ignore
                // let valueLabels = svg.selectAll('.valueLabel').data(currentSlice, d => d.property);

                // valueLabels
                //     .enter()
                //     .append('text')
                //     .attr("class", 'label')
                //     .attr("x", d => xScale(d.value) + 5)
                //     .attr("y", d => yScale(d.rank) + (yScale(1) - yScale(0)) / 2)
                //     .text(d => format(',.0f')(d.lastValue))
                //     .transition()
                //     .duration(tickDuration)
                //     .ease(easeLinear)
                //     .attr("y", d => yScale(d.rank) + (yScale(1) - yScale(0)) / 2);

                // valueLabels
                //     .transition()
                //     .duration(tickDuration)
                //     .ease(easeLinear)
                //     .attr("x", d => xScale(d.value) + 5)
                //     .attr("y", d => yScale(d.rank) + (yScale(1) - yScale(0)) / 2)
                //     .tween("text", function (d) {
                //         let i = interpolateRound(d.lastValue, d.value);
                //         return function (t) {
                //             //@ts-ignore
                //             this.textContent = format(',')(i(t));
                //         };
                //     });

                // valueLabels
                //     .exit()
                //     .transition()
                //     .duration(tickDuration)
                //     .ease(easeLinear)
                //     //@ts-ignore
                //     .attr("x", d => xScale(d.value) + 5)
                //     //@ts-ignore
                //     .attr("y", d => yScale(d.rank) + (yScale(1) - yScale(0)) / 2)
                //     .remove();
            }, tickDuration));
        }
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
        if (Data.length === 0) {
            return scaleLinear()
        }
        const [min, max] = extent(barsData[0].sorted, (element) => element.value);
        return scaleLinear().domain([0, max!]).range([0, boundsWidth - MARGIN.left - MARGIN.right])
    }, [barsData, boundsWidth]);

    const svgElement = select(axesRef.current);
    svgElement.selectAll("*").remove();
    const xAxisGenerator = axisTop(xScale).tickSize(-(boundsHeight));
    svgElement
        .append("g")
        .attr("class", "x-axis")
        .attr("transform", "translate(0," + MARGIN.top + ")")
        .call(xAxisGenerator);

    if (barsData.length !== 0) {
        // @ts-ignore
        let bars = select(boundsRef.current).selectAll("rect").data(barsData[0].sorted, d => d.property);
        bars
            .enter()
            .append('rect')
            .attr("x", xScale(0) + 1)
            .attr("width", d => xScale(d.value)) // - xScale(0) - 1)
            .attr("y", d => yScale(d.rank))
            .attr("height", yScale(1) - yScale(0) - barPadding)
            .style("fill", (d) => d.colour.toString())
            .style("stroke", "black")
            .style("stroke-width", "1px")
    }

    return (
        <div style={{
            display: "flex", flexDirection: "column", alignItems: "center"
        }}>
            {
                barsData.length !== 0 ?
                    <Button onClick={() => Animate()}>{ticker === undefined ? "Start me" : "Stop me"}</Button>
                    : <></>
            }

            < svg className="plot bar-race" width={Width} height={Height} style={{ display: "inline-block" }}>
                <text x={"50%"} y={MARGIN.top * 0.5} textAnchor="middle" alignmentBaseline='middle'>{Plot.Title}</text>
                {/* first group is for the violin and box shapes */}
                <g
                    width={boundsWidth}
                    height={boundsHeight}
                    transform={`translate(${[MARGIN.left, MARGIN.top].join(",")})`}
                    ref={boundsRef}
                >



                    {/* {barsData.length !== 0 ?
                        barsData[cur].sorted.map((element, i) => (
                            <>
                                <rect stroke='black' fill={element.colour.toString()} strokeWidth={"1px"} x={xScale(0)} width={xScale(barsData[cur].sorted[i].value)} y={yScale(i)} height={yScale(1) - yScale(0) - barPadding}
                                //style={{ transitionDuration: `${tickerInterval}ms`, transitionProperty: `width fill` }} 
                                />
                                <text style={{ transitionDuration: `${tickerInterval}ms` }} x={xScale(element.value) - 5} y={yScale(i) + (yScale(1) - yScale(0)) / 2} textAnchor='end' alignmentBaseline='middle' fontSize={10}> {element.property.slice(14).replace("_", " ")} </text>
                            </>
                        ))
                        :
                        <h2>Loading...</h2>} */}
                </g>
                {/* Second is for the axes */}
                <g
                    width={boundsWidth}
                    height={boundsHeight}
                    ref={axesRef}
                    transform={`translate(${[MARGIN.left].join(",")})`}
                />
            </svg >
        </div >
    );
}

export default BarRace;