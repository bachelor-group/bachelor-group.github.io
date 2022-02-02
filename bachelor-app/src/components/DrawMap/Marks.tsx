import { ScaleLinear, ScaleTime } from "d3";
import { binData } from "./DateHistogram";

export const Marks = ({
    binnedData,
    xScale,
    yScale,
    // tooltipFormat,
    innerHeight
}: {
    binnedData: binData[],
    xScale: ScaleTime<number, number, never>,
    yScale: ScaleLinear<number, number, never>,
    // tooltipFormat: any,
    innerHeight: number
}) => (
    <>
        {binnedData.map((d: binData, index: number) => (
            <rect
                className="mark"
                x={xScale(d.date_start)}
                y={yScale(d.total_new_cases)}
                width={xScale(d.date_end) - xScale(d.date_start)}
                height={innerHeight - yScale(d.total_new_cases)}
                onClick={() => console.log(binnedData[index].date_start)}
            >
                {/* <title>{tooltipFormat(d.total_new_cases)}</title> */}
            </rect>
        ))}
    </>
);

export default Marks