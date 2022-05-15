import { useEffect, useState } from 'react';
import { TagExtended } from '../../../../CountrySelector/SelectCountry';
import { DataType } from '../../../../DataContext/MasterDataType';
import PlotsContainer from '../../../../Graphs/PlotsContainer';
import { Plot, PlotType } from '../../../../Graphs/PlotType';
import { SearchTrendsList } from '../../../../DataContext/_old/Old_script';
import { Col, ProgressBar, Row } from 'react-bootstrap';
import BarRace from '../../../../Graphs/BarRace';

interface Props {
    MapData: Map<string, DataType[]>,
    SelectedCountries: TagExtended[],
    WindowDimensions: { width: number, height: number },
}

const HARDCODED = SearchTrendsList;
const LOCATION_KEYS_SEARCH_TRENDS = ["AU", "US", "GB", "SG", "IE", "NZ"];
const SEARCH_TRENDS = [
    "infection", "common_cold",
    "fever", "pain",
    "anosmia", "shortness_of_breath",
    "cough", "asthma",
    "anxiety", "depression",
    "fatigue", "dizziness"
]

let Graphs = SEARCH_TRENDS.map((st) => {

    let searchTrend: keyof DataType = "search_trends_" + st as keyof DataType

    let plot: Plot = { PlotType: PlotType.LineChart, MapData: new Map<string, DataType[]>(), Axis: ["date", searchTrend], Height: window.innerWidth * 0.20, Width: window.innerWidth * 0.4, Title: `Search Trend ${st.replaceAll("_", " ")}` }
    return plot
})

function SearchTrends({ MapData, SelectedCountries, WindowDimensions }: Props) {
    const [Plots, setPlots] = useState<Plot[]>(
        [
            { PlotType: PlotType.BarRace, MapData: MapData, Axis: HARDCODED, Height: 600, Width: window.innerWidth * 0.8, Title: `Search Trends in ${SelectedCountries[0].name}` },
            ...Graphs
        ]);

    function SelectedCountrySearchTrendsDataExists(): string[] {
        if (SelectedCountries.length === 0) {
            return ["Please select a location"]
        }

        // At least one country has search trends
        for (let country of SelectedCountries) {
            let countryCode = country.location_key.split("_")[0]
            if (LOCATION_KEYS_SEARCH_TRENDS.includes(countryCode)) {
                return []
            }
        }
        return [`None of the selected locations have search trend data`]
    }

    //Handle new Data
    useEffect(() => {
        let newPlots: Plot[] = new Array(Plots.length);
        Plots.forEach((Plot, i) => {
            let title = Plot.Title;
            let width = WindowDimensions.width * 0.48
            let height = WindowDimensions.height * 0.6

            if (WindowDimensions.width < 750) width = WindowDimensions.width;
            if (WindowDimensions.width > 1500) width = WindowDimensions.width * 0.3;

            if (Plot.PlotType === PlotType.BarRace) {
                title = `Search Trends in ${SelectedCountries[0].name}`;
                height = 600;
                width = WindowDimensions.width;
            }

            let newPlot: Plot = {
                PlotType: Plot.PlotType,
                MapData: MapData,
                Axis: Plot.Axis,
                Height: height,
                Width: width,
                Title: title
            };
            newPlots[i] = newPlot;
        })
        setPlots(newPlots);
    }, [MapData, WindowDimensions]);


    return (
        <>
            <div id="main">
                {
                    MapData.size === 0 ?
                        <Row md="auto" className="align-items-center">
                            <Col style={{ width: "500px" }}>
                                <ProgressBar animated now={100} />
                            </Col>
                        </Row>
                        :
                        <>
                            {SelectedCountrySearchTrendsDataExists().length === 0 ?
                                <>
                                    {
                                        MapData.size !== 1 ? <i className='note' style={{ margin: "20px 0px 20px 0px" }}>Select only one location to see a bar race visualization.</i>
                                            :
                                            <>
                                                <BarRace key={0} Width={Plots[0].Width} Height={Plots[0].Height} Plot={Plots[0]} MapData={MapData} />
                                                {SelectedCountries[0].location_key === "US" || SelectedCountries[0].location_key === "AU" ? <a href={`#/SearchTrendsMap/${SelectedCountries[0].location_key}`} className='trends-map-link'>Search Trends Map</a> : <></>}
                                            </>
                                    }


                                    <div style={{ display: 'flex', flexDirection: "row", flexWrap: "wrap", justifyContent: "space-evenly" }}>
                                        < PlotsContainer Plots={Plots.slice(1)} />
                                    </div>
                                </>
                                :
                                <h2>{SelectedCountrySearchTrendsDataExists()[0]}</h2>
                            }
                        </>
                }
            </div>

        </>
    );
}

export default SearchTrends;
