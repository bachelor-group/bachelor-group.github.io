import { json } from 'd3';
import { useEffect, useState } from 'react'
import { feature } from 'topojson';
import { Topology } from 'topojson-specification'
import { GeoJsonProperties } from "geojson";
import DrawMap from './DrawMap';

export const LoadMapData = () => {
    const JsonUrl = "https://d3js.org/world-50m.v1.json"

    // backup url with 10m
    // const JsonUrl = "https://gist.githubusercontent.com/almccon/b2d9eaea25b73a16a0ffeb3a2485054c/raw/ce2f85c244be6f0a90f2444080f9d030d1046183/world-10m.json"

    // Backup Url
    //const JsonUrl = "https://unpkg.com/world-atlas@2.0.2/countries-50m.json"


    const [worldData, setWorldData] = useState<GeoJsonProperties>()

    useEffect(() => {
        json<Topology>(JsonUrl).then((data: Topology | undefined) => {


            if (data) {
                let countries: GeoJsonProperties = feature(data, data.objects.countries);
                setWorldData(countries)
            }
        })
        console.log("loaded data")
    }, [])

    return (
        <>
            <DrawMap data={worldData}></DrawMap>

        </>
    );
}


export default LoadMapData;