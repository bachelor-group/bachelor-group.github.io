import { csv, DSVRowArray } from "d3"
import { useEffect, useState } from "react"
import Epidemiology from "../EpidemiologyContext/Epidemiology"
import { EpidemiologyData, EpidemiologyEnum } from "./DataTypes"

const NorwayEpidemiologyUrl = "https://storage.googleapis.com/covid19-open-data/v3/location/NO.csv"
const URL2 = "https://storage.googleapis.com/covid19-open-data/v3/location/DK.csv"

export const LoadData = () => {
    return new Promise<EpidemiologyData[]>((resolve) => {
        let data: EpidemiologyData[] = []
        csv(NorwayEpidemiologyUrl).then(d => {
            d.forEach(element => {
                data.push(element)
            });
            csv(URL2).then(d2 => {
                d2.forEach(element => {
                    data.push(element)
                }) 
                resolve(data);
            });
        });
    })
}

export default LoadData;