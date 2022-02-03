import { useEffect, useState } from 'react';
import SelectCountry, { TagExtended } from '../CountrySelector/SelectCountry';
import { DataType } from '../DataContext/MasterDataType';
import { SearchTrendsEnum } from '../DataContext/SearchTrendType';
import PlotsContainer from '../EpidemiologyContext/PlotsContainer';
import { Plot, PlotType } from '../Graphs/PlotType';
import { LoadData as _LoadData } from '../DataContext/LoadData';
import { SearchTrendsList } from './Old_script';
import SearchTrendsData from './SearchTrendsData';

interface Props {
    LoadData?: typeof _LoadData
}


const HARDCODED = SearchTrendsList


function SearchTrends({ LoadData = _LoadData }: Props) {
    const [Data, setData] = useState<DataType[]>([])
    const [Plots, setPlots] = useState<Plot[]>(
        [
            { PlotType: PlotType.BarRace, Data: [], Axis: HARDCODED, Height: 600, Width: 800, Title: `3, 2 ,1 ... RACE!` },
            { PlotType: PlotType.Lollipop, Data: [], Axis: HARDCODED, Height: 600, Width: 1200, Title: `Search Trends for AU in 2021-12-31` },
        ]);
    const [Countries, setCountries] = useState<TagExtended[]>([]);
    const [LoadedCountries, setLoadedCountries] = useState<TagExtended[]>([]);

    //let Data = LoadData().then((d) => setData)

    // Update Data if new Data is requested
    useEffect(() => {
        LoadData(Countries, LoadedCountries, Data).then((d) => {
            setData(d);

            setLoadedCountries(JSON.parse(JSON.stringify(Countries)));
            // console.log(d)
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

            newPlot = { PlotType: Plot.PlotType, Data: PlotData, Axis: Plot.Axis, Height: Plot.Height, Width: Plot.Width, Title: Plot.Title, GroupBy: Plot.GroupBy };
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
                <PlotsContainer Plots={Plots} />
            </div>

        </>
    );
}

export default SearchTrends;