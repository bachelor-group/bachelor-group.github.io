import { ScaleLinear, ScaleTime } from "d3";
import { ReactNode } from "react";

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
}): ReactNode =>
    xScale.ticks().map((tickValue, index) => (
        <g
            className="tick"
            key={index}
            transform={`translate(${xScale(tickValue)},0)`}
        >
            <line y2={innerHeight} />
            <text style={{ textAnchor: 'middle' }} dy=".71em" y={innerHeight + tickOffset}>
                {tickFormat(tickValue)}
            </text>
        </g>
    ));

export const AxisLeft = ({ yScale, innerWidth, tickOffset = 3 }: { yScale: ScaleTime<number, number, never>, innerWidth: number, tickOffset: number }) =>
    yScale.ticks().map((tickValue, index) => (
        <g className="tick" transform={`translate(0,${yScale(tickValue)})`}>
            <line x2={innerWidth} />
            <text
                key={index}
                style={{ textAnchor: 'end' }}
                x={-tickOffset}
                dy=".32em"
            >
                {tickValue}
            </text>
        </g>
    ));


// export const Marks = ({
//     binnedData,
//     xScale,
//     yScale,
//     tooltipFormat,
//     innerHeight
// }: {binnedData: any, xScale:ScaleLinear<number, number, never>, yScale: ScaleLinear<number, number, never>, tooltipFormat: any, innerHeight: number}) =>
//     binnedData.map(d => (
//         <rect
//             className="mark"
//             x={xScale(d.x0)}
//             y={yScale(d.y)}
//             width={xScale(d.x1) - xScale(d.x0)}
//             height={innerHeight - yScale(d.y)}
//         >
//             <title>{tooltipFormat(d.y)}</title>
//         </rect>
    // ));