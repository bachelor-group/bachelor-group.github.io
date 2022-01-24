import { geoMercator, geoPath, json } from 'd3';
import { resolve } from 'node:path/win32';
import React, { useEffect, useState } from 'react'
import { feature } from 'topojson';
import { Topology } from 'topojson-specification'
import { GeoJsonProperties } from "geojson";
import { setConstantValue } from 'typescript';
import DrawMap from './DrawMap';
import { iso31662, iso31661Alpha2ToNumeric, ISO31662Entry } from 'iso-3166'
import { DateHistogram, EpidemiologyMinimum } from './DateHistogram';



// console.log(iso31662)
// console.log(iso31661Alpha2ToNumeric)

// console.log(iso31661Alpha2ToNumeric["NO"])

// console.log(iso31662.find(x=> x.code === "AD-02"))
//
const xValue = (d: EpidemiologyMinimum) => d.date;

const width: number = window.innerWidth;
const height: number = window.innerHeight - 56;
const dateHistogramSize: number = 0.2;

export const LoadMapData = () => {
    const JsonUrl = "https://d3js.org/world-50m.v1.json"

    // backup url with 10m
    // const JsonUrl = "https://gist.githubusercontent.com/almccon/b2d9eaea25b73a16a0ffeb3a2485054c/raw/ce2f85c244be6f0a90f2444080f9d030d1046183/world-10m.json"

    // Backup Url
    //const JsonUrl = "https://unpkg.com/world-atlas@2.0.2/countries-50m.json"


    const [worldData, setWorldData] = useState<GeoJsonProperties>()
    const [brushExtent, setBrushExtent] = useState();

    useEffect(() => {
        json<Topology>(JsonUrl).then((data: Topology | undefined) => {


            if (data) {
                let countries: GeoJsonProperties = feature(data, data.objects.countries);
                setWorldData(countries)
            }
        })
        console.log("loaded data")
    }, [])


    //TODO GIVE REAL DATA:
    const data: EpidemiologyMinimum[] = [{ date: "2022-01-12", total_confirmed: 23 }, { date: "2022-01-13", total_confirmed: 100 }, { date: "2022-01-14", total_confirmed: 70 }]
    const filteredData = brushExtent
        ? data.filter(d => {
            const date = xValue(d);
            return date > brushExtent[0] && date < brushExtent[1];
        })
        : data;

    return (
        <>
            <DrawMap data={worldData}></DrawMap>
            <svg width={width} height={height*0.2}>
                <DateHistogram
                    Data={data}
                    width={width}
                    height={dateHistogramSize * height}
                    setBrushExtent={setBrushExtent}
                    xValue={xValue}
                />
            </svg>


        </>);
}


export default LoadMapData;