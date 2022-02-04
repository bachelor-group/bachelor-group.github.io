import { ScaleLinear } from "d3";


export const AxisLeft = ({ yScale, innerWidth, tickOffset = 3 }:
    { yScale: ScaleLinear<number, number, never>, innerWidth: number, tickOffset: number }
) => {
    return <>
        {yScale.ticks().map((tickValue, index) => (
            <g key={index} className="tick" transform={`translate(0,${yScale(tickValue)})`}
                fillOpacity={1}>
                <line x2={innerWidth} />
                <text
                    style={{ textAnchor: 'end' }}
                    x={-tickOffset}
                    dy=".3em"
                    
                >
                    {tickValue/1000000}M
                </text>
            </g>

        ))}

    </>

}


export default AxisLeft