import { csv, DSVRowArray } from "d3"
import { useEffect, useState } from "react"
import { SearchTrendData } from "../DataContext/SearchTrendType"
import Epidemiology from "../EpidemiologyContext/Epidemiology"

const SearchTrendUrl = "https://storage.googleapis.com/covid19-open-data/v3/location/AU.csv"


let data: SearchTrendData[] = []

export const LoadSearchTrends = () => {
    return new Promise<SearchTrendData[]>((resolve) => {
        console.log("LOADING DATA")
        csv(SearchTrendUrl).then(d => {
            console.log("DATA IS HERE")
            resolve(d);
        });
    })
}

export default LoadSearchTrends;