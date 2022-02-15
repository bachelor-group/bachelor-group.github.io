import { useEffect, useState } from 'react';
import SelectCountry, { TagExtended } from '../CountrySelector/SelectCountry';
import { DataType } from '../DataContext/MasterDataType';
import { SearchTrendsEnum } from '../DataContext/SearchTrendType';
import PlotsContainer from '../EpidemiologyContext/PlotsContainer';
import { Plot, PlotType } from '../Graphs/PlotType';
import { LoadData as _LoadData } from '../DataContext/LoadData';
import { SearchTrendsList } from './Old_script';
import SearchTrendsData from './SearchTrendsData';
import { Col, ProgressBar, Row } from 'react-bootstrap';
import BarRace from '../Graphs/BarRace';

interface Props {
    LoadData?: typeof _LoadData
}


const HARDCODED = SearchTrendsList


function SearchTrends({ LoadData = _LoadData }: Props) {
    const [Data, setData] = useState<DataType[]>([])
    const [Countries, setCountries] = useState<TagExtended[]>([]);
    const [LoadedCountries, setLoadedCountries] = useState<TagExtended[]>([]);
    const [Plots, setPlots] = useState<Plot[]>(
        [
            { PlotType: PlotType.BarRace, Data: [], Axis: HARDCODED, Height: 600, Width: window.innerWidth * 0.8, Title: `Search Trends in ${Countries[0] !== undefined ? Countries[0].name : "US"}` },
            { PlotType: PlotType.LineChart, Data: [], Axis: ["date", "search_trends_infection"], Height: window.innerWidth * 0.15, Width: window.innerWidth * 0.3, Title: `Search Trends in ${Countries[0] !== undefined ? Countries[0].name : "US"}`, GroupBy: "location_key" },
            { PlotType: PlotType.LineChart, Data: [], Axis: ["date", "search_trends_infection"], Height: window.innerWidth * 0.15, Width: window.innerWidth * 0.3, Title: `Search Trends in ${Countries[0] !== undefined ? Countries[0].name : "US"}`, GroupBy: "location_key" },
            { PlotType: PlotType.LineChart, Data: [], Axis: ["date", "search_trends_infection"], Height: window.innerWidth * 0.15, Width: window.innerWidth * 0.3, Title: `Search Trends in ${Countries[0] !== undefined ? Countries[0].name : "US"}`, GroupBy: "location_key" },
            { PlotType: PlotType.LineChart, Data: [], Axis: ["date", "search_trends_infection"], Height: window.innerWidth * 0.15, Width: window.innerWidth * 0.3, Title: `Search Trends in ${Countries[0] !== undefined ? Countries[0].name : "US"}`, GroupBy: "location_key" },
            { PlotType: PlotType.LineChart, Data: [], Axis: ["date", "search_trends_infection"], Height: window.innerWidth * 0.15, Width: window.innerWidth * 0.3, Title: `Search Trends in ${Countries[0] !== undefined ? Countries[0].name : "US"}`, GroupBy: "location_key" },
            // { PlotType: PlotType.Lollipop, Data: [], Axis: HARDCODED, Height: 600, Width: window.innerWidth * 0.8, Title: `Search Trends for AU in 2021-12-31` },
        ]);

    //let Data = LoadData().then((d) => setData)

    // Update Data if new Data is requested
    useEffect(() => {
        LoadData(Countries, LoadedCountries, Data).then((d) => {
            setData(d);

            setLoadedCountries(JSON.parse(JSON.stringify(Countries)));
        })
    }, [Countries]);

    //Handle new Data
    useEffect(() => {
        let newPlots: Plot[] = new Array(Plots.length);
        Plots.forEach((Plot, i) => {

            let xAxis = Plot.Axis[0];
            let yAxis = Plot.Axis[1];
            let newPlot: Plot;
            let PlotData: DataType[] = []

            for (let j = 0; j < Data.length; j++) {
                if (Plot.GroupBy !== undefined) {
                    PlotData.push({ [xAxis]: Data[j][xAxis], [yAxis]: Data[j][yAxis], [Plot.GroupBy]: Data[j][Plot.GroupBy] })
                } else {
                    PlotData.push(Data[j])
                }
            }

            newPlot = { PlotType: Plot.PlotType, Data: PlotData, Axis: Plot.Axis, Height: Plot.Height, Width: Plot.Width, Title: `Search Trends in ${Countries[0] !== undefined ? Countries[0].name : "US"}`, GroupBy: Plot.GroupBy };
            newPlots[i] = newPlot;
        })
        setPlots(newPlots);
    }, [Data]);

    const selectedCountries = (countries: TagExtended[]) => {
        setCountries(countries)
    }

    return (
        <>
            <SelectCountry selectedCountries={selectedCountries} LoadData={SearchTrendsData} />
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
                            {Data[0].location_key !== "NO" ?
                                <>
                                    <BarRace key={0} Width={Plots[0].Width} Height={Plots[0].Height} Plot={Plots[0]} />
                                    <div style={{ display: 'flex', flexDirection: "row", flexWrap: "wrap", justifyContent: "space-evenly" }}>
                                        < PlotsContainer Plots={Plots.slice(1)} />
                                    </div>
                                    <a href={`#/SearchTrendsMap/${Data[0].location_key}`}>Search Trends Map</a>
                                </>
                                :
                                <></>
                            }
                        </>
                }
            </div>

        </>
    );
}

export default SearchTrends;