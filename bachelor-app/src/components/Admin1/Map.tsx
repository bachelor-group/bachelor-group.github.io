import { json } from 'd3';
import { useEffect, useState } from 'react'
import { feature } from 'topojson';
import { Topology } from 'topojson-specification'
import { GeoJsonProperties } from "geojson";
import DrawMap from './DrawMap';

// import MapData from '../../geojson/admin_1_topojson.json'

export const LoadAdmin1MapData = () => {
    const JsonUrl = "https://d3js.org/world-50m.v1.json"

    // backup url with 10m
    // const JsonUrl = "https://gist.githubusercontent.com/almccon/b2d9eaea25b73a16a0ffeb3a2485054c/raw/ce2f85c244be6f0a90f2444080f9d030d1046183/world-10m.json"

    // Backup Url
    //const JsonUrl = "https://unpkg.com/world-atlas@2.0.2/countries-50m.json"


    const [worldData, setWorldData] = useState<GeoJsonProperties>()

    useEffect(() => {


        fetch('./admin_1_topojson.json', {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        }).then(d => { 
            let temp = d.json()
            temp.then(w => {
                console.log(w.objects.ne_10m_admin_1_states_provinces)
                let countries: GeoJsonProperties = feature(w, w.objects.ne_10m_admin_1_states_provinces)
                setWorldData(countries)
            })
            console.log(temp) })
        // @ts-ignore
        // let countries: GeoJsonProperties = feature(MapData, MapData.objects.countries);
        // setWorldData(countries)


    }, [])

    return (
        <>
            <DrawMap data={worldData}></DrawMap>

        </>
    );
}


export default LoadAdmin1MapData;