import { ScaleLinear, ScaleTime } from "d3";

export const Marks = ({
    binnedData,
    xScale,
    yScale,
    tooltipFormat,
    innerHeight
}: {
    binnedData: any,
    xScale: ScaleTime<number, number, never>,
    yScale: ScaleLinear<number, number, never>,
    tooltipFormat: any,
    innerHeight: number
}) =>
    binnedData.map((d: any) => (
        <rect
            className="mark"
            x={xScale(d.x0)}
            y={yScale(d.y)}
            width={xScale(d.x1) - xScale(d.x0)}
            height={innerHeight - yScale(d.y)}
        >
            <title>HVA ER DETTE?????? FJERN??????????{tooltipFormat(d.y)}</title>
        </rect>
    ));
    
export default Marks