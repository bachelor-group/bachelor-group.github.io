import { csv, DSVRowArray } from "d3"
import { useEffect, useState } from "react"
import { TagExtended } from "../CountrySelector/SelectCountry"
import Epidemiology from "../EpidemiologyContext/Epidemiology"
import { EpidemiologyData, EpidemiologyEnum } from "./DataTypes"

const NorwayEpidemiologyUrl = "https://storage.googleapis.com/covid19-open-data/v3/location/NO.csv"
const url = "https://storage.googleapis.com/covid19-open-data/v3/location/"
// const URL2 = "https://storage.googleapis.com/covid19-open-data/v3/location/DK.csv"

export const LoadData = (countries: TagExtended[]) => {
    return new Promise<EpidemiologyData[]>((resolve) => {
        let data: EpidemiologyData[] = []
        let loaded_csv: number = 0;
        if (countries.length === 0) {
            csv(NorwayEpidemiologyUrl).then(d => {
                d.forEach(element => {
                    data.push(element)
                });
                resolve(data);
            });

        } else {
            countries.forEach((country) => {
                csv(url + country.location_key + ".csv").then(d => {
                    console.log(url+country.location_key+".csv")
                    d.forEach(element => {
                        data.push(element)
                    });
                    loaded_csv++
                    if (countries.length === loaded_csv) {
                        resolve(data);
                    }
                });
            });

        }
    })
}


export default LoadData;