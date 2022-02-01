import { csv, DSVRowArray } from "d3"
import { useEffect, useState } from "react"
import { TagExtended } from "../CountrySelector/SelectCountry"
import Epidemiology from "../EpidemiologyContext/Epidemiology"
import { EpidemiologyData, EpidemiologyEnum } from "./DataTypes"

const NorwayEpidemiologyUrl = "https://storage.googleapis.com/covid19-open-data/v3/location/NO.csv"
const url = "https://storage.googleapis.com/covid19-open-data/v3/location/"
// const URL2 = "https://storage.googleapis.com/covid19-open-data/v3/location/DK.csv"

export const LoadData = (requestedCountries: TagExtended[], loadedCountries: TagExtended[], data: EpidemiologyData[]) => {
    return new Promise<EpidemiologyData[]>((resolve) => {
        let loaded_csv: number = loadedCountries.length;
        if (requestedCountries.length + 1 === loadedCountries.length) {
            csv(url + requestedCountries.at(-1)!.location_key + ".csv").then(d => {
                d.forEach(element => {
                    data.push(element)
                });
                loaded_csv++
                if (requestedCountries.length === loaded_csv) {
                    resolve(data);
                    return;
                }
            });
        }
        loaded_csv = 0;
        let data: EpidemiologyData[] = []
        if (requestedCountries.length === 0) {
            csv(NorwayEpidemiologyUrl).then(d => {
                d.forEach(element => {
                    data.push(element)
                });
                resolve(data);
            });
        } else {
            requestedCountries.forEach((country) => {
                csv(url + country.location_key + ".csv").then(d => {
                    d.forEach(element => {
                        data.push(element)
                    });
                    loaded_csv++
                    if (requestedCountries.length === loaded_csv) {
                        resolve(data);
                    }
                });
            });
        }
    })
}


export default LoadData;