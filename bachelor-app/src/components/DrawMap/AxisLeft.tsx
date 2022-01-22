import { ScaleLinear, line, text } from "d3";
import { ReactNode } from "react";


export const AxisLeft = ({ yScale, innerWidth, tickOffset = 3 }:
    { yScale: ScaleLinear<number, number, never>, innerWidth: number, tickOffset: number }
) => {
    return <>
        {yScale.ticks().map((tickValue, index) => (
            <g className="tick" transform={`translate(0,${yScale(tickValue)})`}>
                <line key={index + 1} x2={innerWidth} />
                <text
                    key={index}
                    style={{ textAnchor: 'end' }}
                    x={-tickOffset}
                    dy=".32em"
                >
                    {tickValue}
                </text>
            </g>

        ))}

    </>

}


export default AxisLeft