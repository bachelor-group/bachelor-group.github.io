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

const MARGIN = { top: 50, right: 30, bottom: 50, left: 50 };
let top_n = 12;

type Bar = {
    Data: DataType,
    sorted: { property: (keyof DataType), lastValue: number, value: number, colour: HSLColor, rank: number }[],
}

function BarRace({ Width, Height, Plot }: BarRaceProps) {
    const axesRef = useRef(null);
    const titleRef = useRef(null);
    const boundsRef = useRef(null);
    const boundsWidth = Width - MARGIN.right - MARGIN.left - 0.5 * MARGIN.left;
    const boundsHeight = Height - MARGIN.top - MARGIN.bottom;
    const [Data, setData] = useState<DataType[]>([]);
    const [barsData, setBarsData] = useState<Bar[]>([]);
    const [countries, setCountries] = useState<string[]>([]);
    const [ticker, setTicker] = useState<Timer>();
    const tickDuration = 300

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
            let cursor = -1
            let svg = select(".bar-race")
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
            // @ts-ignore
            let bars = select(boundsRef.current).selectAll("rect").data(barsData[0].sorted, d => d.property);
            bars
                .enter()
                .append('rect')
                .attr("x", xScale(0) + 1)
                .attr("width", d => xScale(d.value)) // - xScale(0) - 1)
                .attr("y", d => yScale(d.rank) + 5)
                .attr("height", yScale(1) - yScale(0) - barPadding)
                .style("fill", (d) => d.colour.toString())
                .style("stroke", "black")
                .style("stroke-width", "1px");


            xScale.domain([0, max(barsData[0].sorted, d => d.value)!]);

            console.log(xScale.range())
            let axesG = select(axesRef.current)


            axesG.selectAll("*").remove();

            axesG
                .append("g")
                .attr("class", "x-axis")
                .attr("transform", "translate(0," + MARGIN.top + ")")
                .call(axisTop(xScale).tickSize(-(boundsHeight)));

            // // @ts-ignore
            // let valueLabels = select(boundsRef.current).selectAll('.valueLabel').data(barsData[0].sorted, d => d.property);

            // valueLabels
            //     .enter()
            //     .append('text')
            //     .attr("class", 'label')
            //     .attr("x", d => xScale(d.value) + 5)
            //     .attr("y", d => yScale(d.rank) + (yScale(1) - yScale(0)) / 2)
            //     .text(d => format(',.0f')(d.lastValue))

        }
    }, [barsData])

    return (
        <div style={{
            display: "flex", flexDirection: "column", alignItems: "center"
        }}>
            {
                barsData.length !== 0 ?
                    <>
                        <Button onClick={() => Animate()}>{ticker === undefined ? "Start me" : "Stop me"}</Button>
                        < svg className="plot bar-race" width={Width} height={Height} style={{ display: "inline-block" }}>
                            <text ref={titleRef} x={"50%"} y={MARGIN.top * 0.5} textAnchor="middle" alignmentBaseline='middle'>{Plot.Title}</text>
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
                        <p><i className='note'>*Note that the numbers are from 0 to 100. </i></p>
                    </>
                    : <></>
            }
        </div >

    );
}

export default BarRace;