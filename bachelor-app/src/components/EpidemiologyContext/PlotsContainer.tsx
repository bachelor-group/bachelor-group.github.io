import { useEffect, useState } from "react";
import LineChart from "../Graphs/LineChart";
import Lollipop from "../Graphs/Lollipop";
import { Plot, PlotType } from "../Graphs/PlotType";
import Scatter from "../Graphs/Scatter";
import WordCloud from "../Graphs/WordCloud";

interface PlotsProps {
    Plots: Plot[]
}

export const PlotsContainer = ({ Plots }: PlotsProps) => {
    const [temp, setTemp] = useState(Plots)

    //Used to make the container Rerender
    useEffect(() => {
        setTemp(Plots);
    }, [Plots])

    return (
        <div className="PlotsContainer">
            {Plots.map((Plot, index) => {
                switch (Plot.PlotType) {
                    case PlotType.Scatter:
                        return <Scatter key={index} Width={Plot.Width} Height={Plot.Height} Plot={Plot} />

                    case PlotType.WorldCloud:
                        return <WordCloud key={index} Width={Plot.Width} Height={Plot.Height} />

                    case PlotType.LineChart:
                        return <LineChart key={index} Width={Plot.Width} Height={Plot.Height} Plot={Plot} />

                    case PlotType.Lollipop:
                        return <Lollipop key={index} Width={Plot.Width} Height={Plot.Height} Plot={Plot} />

                    default:
                        throw `Plottype: ${Plot.PlotType} not supported`
                }
            })}
        </div>
    );
}

export default PlotsContainer;