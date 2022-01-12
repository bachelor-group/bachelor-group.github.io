import { useEffect } from "react";
import LineChart from "../Graphs/LineChart";
import Scatter from "../Graphs/Scatter";
import WordCloud from "../Graphs/WordCloud";
import { Plot, PlotType } from "./Epidemiology";

interface PlotsProps {
    Plots: Plot[]
}

export const PlotsContainer = ({ Plots }: PlotsProps) => {
    useEffect(() => {
        console.log(Plots)
    }, [Plots])

    return (
        <div className="PlotsContainer">
            {Plots.map((Plot, index) => {
                // if (Plot.Data.length === 0) {
                //     return <h2 key={index}>Loading... </h2>
                // }

                switch (Plot.PlotType) {
                    case PlotType.Scatter:
                    return <Scatter key={index} Width={Plot.Width} Height={Plot.Height} Data={Plot.Data} />

                    case PlotType.WorldCloud:
                        return <WordCloud key={index} Width={Plot.Width} Height={Plot.Height} />

                    case PlotType.LineChart:
                        return <LineChart key={index} Width={Plot.Width} Height={Plot.Height} />

                    default:
                        return <h2>haha yikes bro :D</h2>
                }
            })}
        </div>
    );
}


export default PlotsContainer;