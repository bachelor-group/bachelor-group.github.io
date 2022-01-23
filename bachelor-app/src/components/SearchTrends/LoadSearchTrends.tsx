import { csv, DSVRowArray } from "d3"
import { useEffect, useState } from "react"
import { SearchTrendData } from "../DataContext/SearchTrendType"
import Epidemiology from "../EpidemiologyContext/Epidemiology"

const SearchTrendUrl = "https://storage.googleapis.com/covid19-open-data/v3/google-search-trends.csv"

let data: SearchTrendData[] = []

export const LoadSearchTrends = () => {
    return new Promise<SearchTrendData[]>((resolve) => {
        let Array2: SearchTrendData[] = []
        console.log("LOADING DATA")
        csv(SearchTrendUrl).then(d => {
            console.log("DATA IS HERE")
            d.forEach(element => {
                if (element["location_key"] == "NO") {
                    Array2.push(element)
                }
            });
            resolve(Array2);
        });
    })
}

export default LoadSearchTrends;