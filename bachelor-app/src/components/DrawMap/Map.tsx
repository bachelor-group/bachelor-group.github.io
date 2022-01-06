import { geoMercator, geoPath, json } from 'd3';
import { resolve } from 'node:path/win32';
import React, { useEffect, useState } from 'react'
import { feature } from 'topojson';
import { Topology } from 'topojson-specification'
import { GeoJsonProperties } from "geojson";
import { setConstantValue } from 'typescript';
import DrawMap from './DrawMap';


export const LoadMapData = () => {
    const JsonUrl = "https://d3js.org/world-50m.v1.json"


    const [worldData, setWorldData] = useState<GeoJsonProperties>()

    useEffect(() => {
        json<Topology>(JsonUrl).then((data: Topology | undefined) => {

            
            if (data) {
                let countries: GeoJsonProperties = feature(data, data.objects.countries);
                // console.log(countries);
                // console.log(countries.features);
                setWorldData(countries)
            }
        })
        console.log("loaded data")
    }, [])

    // console.log(worldData?.objects);
    return (
        <>
            <DrawMap data={worldData}></DrawMap>
        
        </>
    );
}


export default LoadMapData;