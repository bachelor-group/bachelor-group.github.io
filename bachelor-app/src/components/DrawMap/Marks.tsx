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
                    // x={xScale(d.date_start)-(0.5*xScale(d.date_start))}
                    y={yScale(d.total_confirmed)}
                    width={(xScale(d.date_end) - xScale(d.date_start))}
                    height={innerHeight - yScale(d.total_confirmed)}
                >
                </rect>
            ))}
        </>

    );
};

export default Marks