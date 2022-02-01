import { axisBottom, axisLeft, csv, scaleBand, scaleLinear, select } from 'd3';
import React, { useState } from 'react';
import { EpidemiologyEnum } from '../DataContext/DataTypes';
import { Plot, PlotType } from '../Graphs/PlotType';
import LoadSearchTrends from './LoadSearchTrends';


function SearchTrends() {

    const [Plots, setPlots] = useState<Plot[]>(
        [
            { PlotType: PlotType.Lollipop, Data: [], Axis: [EpidemiologyEnum.new_confirmed, EpidemiologyEnum.date], Height: 300, Width: 600, Title: "Lollipop" },
        ]);


    let Data = LoadSearchTrends().then((d) => console.log(d))
    // const [RequestedData, setRequestedData] = useState<string[]>(["new_confirmed", "date"]);
    //const [Data, setData] = useState<SearchTrendsData[]>([]);

    return (
        <div id="main">
            <h1>This is the Search Trends page!</h1>
        </div>
    );
}




export default SearchTrends;