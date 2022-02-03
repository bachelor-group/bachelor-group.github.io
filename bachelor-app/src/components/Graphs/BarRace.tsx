import { ascending, axisBottom, axisLeft, descending, extent, hsl, HSLColor, interval, scaleBand, scaleLinear, scaleOrdinal, select, tickIncrement, timeout, Timer } from 'd3';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Button } from 'react-bootstrap';
import { DataType } from '../DataContext/MasterDataType';
import { SearchTrendsList } from '../SearchTrends/Old_script';
import { Plot } from './PlotType';
import { useSpring, animated, useTransition } from 'react-spring'

interface BarRaceProps {
    Width: number,
    Height: number,
    Plot: Plot,
    YAxis: (keyof DataType)[]
}

const MARGIN = { top: 30, right: 30, bottom: 50, left: 200 };
let top_n = 12;

type Bar = {
    Data: DataType,
    sorted: { property: (keyof DataType), value: number, colour: HSLColor }[],
}

let tickerInterval = 1000;

function BarRace({ Width, Height, YAxis, Plot }: BarRaceProps) {
    const axesRef = useRef(null)
    YAxis = YAxis.slice(0, 10)
    const boundsWidth = Width - MARGIN.right - MARGIN.left - 0.5 * MARGIN.left;
    const boundsHeight = Height - MARGIN.top - MARGIN.bottom;
    const [Data, setData] = useState<DataType[]>([]);
    const [cur, setCur] = useState(0)
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

            for (let i = 0; i < Data.length; i++) {
                const element = Data[i];
                let newBar: Bar = { Data: element, sorted: [] };
                let unsorted_list: { property: (keyof DataType), value: number, colour: HSLColor }[] = []
                for (let i = 0; i < SearchTrendsList.length; i++) {
                    const element = SearchTrendsList[i];
                    unsorted_list.push({ property: element, value: newBar.Data[element] !== "" ? parseFloat(newBar.Data[element]!) : 0, colour: colourDict[element]! })
                }
                newBar.sorted = unsorted_list.sort((a, b) => descending(a.value, b.value))
                newBarsData.push(newBar)
            }
            setBarsData(newBarsData);
        }
    }, [Data])

    useEffect(() => {
        if (cur !== 0) {
            setTicker(timeout((e) => {
                console.log(cur)
                setCur((cur) => cur + 1);
            }, tickerInterval))
        }

    }, [cur])

    function Animate() {
        if (ticker === undefined) {
            setCur(1)
        }
        else {
            console.log("YO BROTHER STOP WTF MAN")
            ticker.stop()
            setTicker(undefined);
            setCur(0)
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
        const [min, max] = extent(barsData[cur].sorted, (element) => element.value);
        return scaleLinear().domain([0, max!]).range([0, boundsWidth])
    }, [barsData, boundsWidth, cur]);


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
            {barsData.length !== 0 ? barsData[cur].Data.date : "Awaiting Data"}
            <Button onClick={() => Animate()}>{cur === 0 ? "Start me" : "Stop me"}</Button>
            <svg className="plot" width={Width} height={Height} style={{ display: "inline-block" }}>
                <text x={"50%"} y={MARGIN.top * 0.5} textAnchor="middle" alignmentBaseline='middle'>{Plot.Title}</text>
                {/* first group is for the violin and box shapes */}
                <g
                    width={boundsWidth}
                    height={boundsHeight}
                    transform={`translate(${[MARGIN.left, MARGIN.top].join(",")})`}
                >



                    {barsData.length !== 0 ?
                        barsData[cur].sorted.map((element, i) => (
                            // <animated.g
                            // style={props}
                            // >
                            <>
                                <rect stroke='black' fill={element.colour.toString()} strokeWidth={"1px"} x={xScale(0)} width={xScale(barsData[cur].sorted[i].value)} y={yScale(i)} height={yScale(1) - yScale(0) - barPadding}
                                    style={{ transitionDuration: `${tickerInterval}ms`, transitionProperty: `width fill` }} />
                                <text style={{ transitionDuration: `${tickerInterval}ms` }} x={xScale(element.value) - 5} y={yScale(i) + (yScale(1) - yScale(0)) / 2} textAnchor='end' alignmentBaseline='middle' fontSize={10}> {element.property.slice(14).replace("_", " ")} </text>
                            </>
                            // </animated.g>
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
                    style={{ transitionDuration: `${tickerInterval}ms` }}
                />
            </svg>
        </div>
    );
}

export default BarRace;