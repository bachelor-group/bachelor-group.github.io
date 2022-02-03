import { ScaleTime } from "d3";

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
                key={index}
                className="tick"
                transform={`translate(${xScale(tickValue)},0)`}
                fill={"white"}
                fillOpacity={1}
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