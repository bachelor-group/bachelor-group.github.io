import { useEffect, useState } from 'react';
import { TagExtended } from '../CountrySelector/SelectCountry';
import { DataType } from '../DataContext/MasterDataType';
import PlotsContainer from '../EpidemiologyContext/PlotsContainer';
import { Plot, PlotType } from '../Graphs/PlotType';
import { SearchTrendsList } from './Old_script';
import { Col, ProgressBar, Row } from 'react-bootstrap';
import BarRace from '../Graphs/BarRace';

interface Props {
    MapData: Map<string, DataType[]>,
    SelectedCountries: TagExtended[]
}

const HARDCODED = SearchTrendsList
const LOCATION_KEYS_SEARCH_TRENDS = ["AU", "US", "GB", "SG", "IE", "NZ"]
const COLORS = ["Blue", "Coral", "DodgerBlue", "SpringGreen", "YellowGreen", "Green", "OrangeRed", "Red", "GoldenRod", "HotPink", "CadetBlue", "SeaGreen", "Chocolate", "BlueViolet", "Firebrick"]


function SearchTrends({ MapData, SelectedCountries }: Props) {
    // TODO: Data is used to fix error with Data[0], need to find a better way...
    const [Data, setData] = useState<DataType[]>([]);
    const [Plots, setPlots] = useState<Plot[]>(
        [
            { PlotType: PlotType.BarRace, MapData: MapData, Axis: HARDCODED, Height: 600, Width: window.innerWidth * 0.8, Title: `Search Trends in ${Data[0] !== undefined ? Data[0].country_name : "US"}` },
            { PlotType: PlotType.LineChart, MapData: MapData, Axis: ["date", "search_trends_infection"], Height: window.innerWidth * 0.15, Width: window.innerWidth * 0.3, Title: `Search Trends in ${Data[0] !== undefined ? Data[0].country_name : "US"}` },
            { PlotType: PlotType.LineChart, MapData: MapData, Axis: ["date", "search_trends_infection"], Height: window.innerWidth * 0.15, Width: window.innerWidth * 0.3, Title: `Search Trends in ${Data[0] !== undefined ? Data[0].country_name : "US"}` },
            { PlotType: PlotType.LineChart, MapData: MapData, Axis: ["date", "search_trends_infection"], Height: window.innerWidth * 0.15, Width: window.innerWidth * 0.3, Title: `Search Trends in ${Data[0] !== undefined ? Data[0].country_name : "US"}` },
            { PlotType: PlotType.LineChart, MapData: MapData, Axis: ["date", "search_trends_infection"], Height: window.innerWidth * 0.15, Width: window.innerWidth * 0.3, Title: `Search Trends in ${Data[0] !== undefined ? Data[0].country_name : "US"}` },
            { PlotType: PlotType.LineChart, MapData: MapData, Axis: ["date", "search_trends_infection"], Height: window.innerWidth * 0.15, Width: window.innerWidth * 0.3, Title: `Search Trends in ${Data[0] !== undefined ? Data[0].country_name : "US"}` },
        ]);

    function SelectedCountrySearchTrendsDataExists(): string[] {
        if (SelectedCountries.length === 0) {
            return ["Please select a location"]
        }
        else if (SelectedCountries.length !== 1) {
            return [`Only one location can be shown`]
        }

        let countryCode = SelectedCountries[0].location_key.split("_")[0]

        if (LOCATION_KEYS_SEARCH_TRENDS.includes(countryCode)) {
            return []
        }
        else {
            return [`Location ${SelectedCountries[0].name} does not have search trend data`]
        }
    }

    //Handle new Data
    useEffect(() => {
        let newPlots: Plot[] = new Array(Plots.length);
        Plots.forEach((Plot, i) => {
            let newPlot: Plot = {
                PlotType: Plot.PlotType,
                MapData: MapData,
                Axis: Plot.Axis,
                Height: Plot.Height,
                Width: Plot.Width,
                Title: `Search Trends in ${Data[0] !== undefined ? Data[0].country_name : "US"}`
            };
            newPlots[i] = newPlot;
        })
        setPlots(newPlots);
        setData(Array.from(MapData.values()).flat())
    }, [MapData]);


    return (
        <>
            <div id="main">
                {
                    Data.length === 0 ?
                        <Row md="auto" className="align-items-center">
                            <Col style={{ width: "500px" }}>
                                <ProgressBar animated now={100} />
                            </Col>
                        </Row>
                        :
                        <>
                            {SelectedCountrySearchTrendsDataExists().length === 0 ?
                                <>
                                    <BarRace key={0} Width={Plots[0].Width} Height={Plots[0].Height} Plot={Plots[0]} />

                                    {Data[0].location_key === "US" || Data[0].location_key === "AU" ? <a href={`#/SearchTrendsMap/${Data[0].location_key}`} className='trends-map-link'>Search Trends Map</a> : <></>}

                                    <div style={{ display: 'flex', flexDirection: "row", flexWrap: "wrap", justifyContent: "space-evenly" }}>
                                        < PlotsContainer Plots={Plots.slice(1)} Colors={COLORS} />
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
