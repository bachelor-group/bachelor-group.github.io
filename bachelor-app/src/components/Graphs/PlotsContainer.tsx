import { useEffect, useState } from "react";
import BarRace from "./BarRace";
import LineChart from "./LineChart";
import Lollipop from "./Lollipop";
import { Plot, PlotType } from "./PlotType";
import Scatter from "./Scatter";
import WordCloud from "./WordCloud";

interface PlotsProps {
    Plots: Plot[],
    Colors?: string[]
}

const COLORS = ["Blue", "Coral", "DodgerBlue", "SpringGreen", "YellowGreen", "Green", "OrangeRed", "Red", "GoldenRod", "HotPink", "CadetBlue", "SeaGreen", "Chocolate", "BlueViolet", "Firebrick"];

export const PlotsContainer = ({ Plots, Colors = COLORS }: PlotsProps) => {
    const [temp, setTemp] = useState(Plots)

    // Used to make the container Rerender
    useEffect(() => {
        setTemp(Plots)
    }, [Plots])

    return (
        <>
            {Plots.length !== 0 ?
                Plots.map((Plot, index) => {
                    switch (Plot.PlotType) {
                        case PlotType.Scatter:
                            return <Scatter key={index} Width={Plot.Width} Height={Plot.Height} Plot={Plot} Colors={Colors} />

                        case PlotType.WordCloud:
                            return <WordCloud key={index} Width={Plot.Width} Height={Plot.Height} />

                        case PlotType.LineChart:
                            return <LineChart key={index} Width={Plot.Width} Height={Plot.Height} Plot={Plot} Colors={Colors} />

                        case PlotType.Lollipop:
                            return <Lollipop key={index} Width={Plot.Width} Height={Plot.Height} YAxis={Plot.Axis} Plot={Plot} />

                        case PlotType.BarRace:
                            return <BarRace key={index} Width={Plot.Width} Height={Plot.Height} Plot={Plot} MapData={Plot.MapData} />

                        default:
                            throw `Plottype: ${Plot.PlotType} not supported`
                    }
                })
                :
                <></>
            }
        </>
    );
}

export default PlotsContainer;
