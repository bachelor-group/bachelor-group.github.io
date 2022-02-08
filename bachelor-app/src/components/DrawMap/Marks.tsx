import { ScaleTime } from "d3";
import { binData } from "./DateHistogram";

export const Marks = ({
    binnedData,
    xScale,
    yScale,
    innerHeight
}: {
    binnedData: any,
    xScale: ScaleTime<number, number, never>,
    yScale: any,
    innerHeight: number
}) => {
    return (
        <>
            {binnedData.map((d: binData, index: number) => (
                <rect
                    key={index}
                    className="mark"
                    x={xScale(d.date_start)}
                    y={isNaN(yScale(d.total_confirmed)) ? 0 : yScale(d.total_confirmed) }
                    width={isNaN((xScale(d.date_end) - xScale(d.date_start)))? 0 :(xScale(d.date_end) - xScale(d.date_start))}
                    height={isNaN(innerHeight - yScale(d.total_confirmed)) ? 0 : innerHeight - yScale(d.total_confirmed)}
                >
                </rect>
            ))}
        </>

    );
};

export default Marks