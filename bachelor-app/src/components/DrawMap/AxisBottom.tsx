import { ScaleTime } from "d3";
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
})  => {
    return <>
        {xScale.ticks().map((tickValue, index) => (
            <g
                className="tick"
                key={index}
                transform={`translate(${xScale(tickValue)},0)`}
            >
                <line y2={innerHeight} />
                <text style={{ textAnchor: 'middle' }} dy=".70em" y={innerHeight + tickOffset}>
                    {tickFormat(tickValue)}
                </text>
            </g>
        ))}

    </>
}

export default AxisBottom;