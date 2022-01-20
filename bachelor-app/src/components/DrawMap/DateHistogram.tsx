import { scaleLinear, scaleTime, max, timeFormat, extent, bin, timeMonths, sum, brushX, select, ScaleTime } from 'd3';
import { useRef, useEffect, useMemo, SetStateAction, Dispatch } from 'react';
import { CovidDataType } from './DrawMap';

interface HistogramProps {
    data: CovidDataType[]
    width: number,
    height: number,
    setBrushExtent: Dispatch<SetStateAction<undefined>>,
}

const margin = { top: 0, right: 30, bottom: 20, left: 45 };
const xAxisLabelOffset = 54;
const yAxisLabelOffset = 30;
const xAxisTickFormat = timeFormat('%m/%d/%Y');

const xValue = (d: CovidDataType) => d.date;
const xAxisLabel = 'Time';

const yValue = (d: CovidDataType) => d.total_confirmed;
const yAxisLabel = 'Total Dead and Missing';

export const DateHistogram = ({
    data,
    width,
    height,
    setBrushExtent,
}: HistogramProps) => {
    const innerHeight = height - margin.top - margin.bottom;
    const innerWidth = width - margin.left - margin.right;

    const xScale = useMemo(
        () =>
            scaleTime()
                // .domain(extent(data, xValue))
                .domain([0, 123])
                .range([0, innerWidth])
                .nice(),
        [data, xValue, innerWidth]
    );

    const binnedData = useMemo(() => {
        const [start, stop] = xScale.domain();
        return bin
            .value(xValue)
            .domain(xScale.domain())
            .thresholds(timeMonths(start, stop))(data)
            .map(array => ({
                y: sum(array, yValue),
                x0: array.x0,
                x1: array.x1
            }));
    }, [xValue, yValue, xScale, data]);

    const yScale = useMemo(
        () =>
            scaleLinear()
                .domain([0, max(binnedData, d => d.y)])
                .range([innerHeight, 0]),
        [binnedData, innerHeight]
    );

    const brushRef = useRef();

    useEffect(() => {
        const brush = brushX().extent([[0, 0], [innerWidth, innerHeight]]);
        brush(select(brushRef.current));
        brush.on('brush end', (event) => {
            setBrushExtent(event.selection && event.selection.map(xScale.invert));
        });
    }, [innerWidth, innerHeight]);

    return (
        <>
            <rect width={width} height={height} fill="white" />
            <g transform={`translate(${margin.left},${margin.top})`}>
                <AxisBottom
                    xScale={xScale}
                    innerHeight={innerHeight}
                    tickFormat={xAxisTickFormat}
                    tickOffset={5}
                />
                <text
                    className="axis-label"
                    textAnchor="middle"
                    transform={`translate(${-yAxisLabelOffset},${innerHeight /
                        2}) rotate(-90)`}
                >
                    {yAxisLabel}
                </text>
                <AxisLeft yScale={yScale} innerWidth={innerWidth} tickOffset={5} />
                <text
                    className="axis-label"
                    x={innerWidth / 2}
                    y={innerHeight + xAxisLabelOffset}
                    textAnchor="middle"
                >
                    {xAxisLabel}
                </text>
                <Marks
                    binnedData={binnedData}
                    xScale={xScale}
                    yScale={yScale}
                    // TODO FIX D iTYPE
                    tooltipFormat={(d: any) => d}
                    circleRadius={2}
                    innerHeight={innerHeight}
                />
                <g ref={brushRef} />
            </g>
        </>
    );
};

export const AxisBottom = ({
    xScale,
    innerHeight,
    tickFormat,
    tickOffset = 3
}: {
    xScale: ScaleTime<number, number, never>,
    innerHeight: number,
    tickFormat: any,
    tickOffset: number
}) =>
    xScale.ticks().map(tickValue => (
        <g
            className="tick"
            key={tickValue}
            transform={`translate(${xScale(tickValue)},0)`}
        >
            <line y2={innerHeight} />
            <text style={{ textAnchor: 'middle' }} dy=".71em" y={innerHeight + tickOffset}>
                {tickFormat(tickValue)}
            </text>
        </g>
    ));

export const AxisLeft = ({ yScale, innerWidth, tickOffset = 3 }: { yScale: ScaleTime<number, number, never>, innerWidth: number, tickOffset: number }) =>
    yScale.ticks().map(tickValue => (
        <g className="tick" transform={`translate(0,${yScale(tickValue)})`}>
            <line x2={innerWidth} />
            <text
                key={tickValue}
                style={{ textAnchor: 'end' }}
                x={-tickOffset}
                dy=".32em"
            >
                {tickValue}
            </text>
        </g>
    ));


export const Marks = ({
    binnedData,
    xScale,
    yScale,
    tooltipFormat,
    innerHeight
}) =>
    binnedData.map(d => (
        <rect
            className="mark"
            x={xScale(d.x0)}
            y={yScale(d.y)}
            width={xScale(d.x1) - xScale(d.x0)}
            height={innerHeight - yScale(d.y)}
        >
            <title>{tooltipFormat(d.y)}</title>
        </rect>
    ));
