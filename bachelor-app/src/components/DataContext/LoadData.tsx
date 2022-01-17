import { csv, DSVRowArray } from "d3"
import { useEffect, useState } from "react"
import Epidemiology from "../EpidemiologyContext/Epidemiology"
import { EpidemiologyData, EpidemiologyEnum } from "./DataTypes"

const NorwayEpidemiologyUrl = "https://storage.googleapis.com/covid19-open-data/v3/location/NO.csv"

let data: EpidemiologyData[] = []

for (let i = 0; i < 100; i++) {
    data.push({ [EpidemiologyEnum.new_confirmed]: (Math.ceil(Math.random() * 5 + i)).toString(), [EpidemiologyEnum.date]: (i).toString(), [EpidemiologyEnum.location_key]: Math.round(Math.random()) == 1 ? "France" : "Germany" })
}

export const LoadData = () => {
    return new Promise<EpidemiologyData[]>((resolve) => {
        csv(NorwayEpidemiologyUrl).then(d => {
            resolve(d)
        });
    })
}

export default LoadData;