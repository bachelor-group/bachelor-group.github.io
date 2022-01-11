import React, { ReactNode, SVGProps, useEffect, useState } from 'react'
import { GeoJsonProperties, Feature } from "geojson";
import { geoEquirectangular, geoMercator, GeoPath, GeoPermissibleObjects, select, scaleSequential, max, color, csv, svg, DSVRowString } from 'd3';
import { zoom, zoomIdentity } from 'd3-zoom';
import { Selection } from 'd3-selection';
import { geoPath } from 'd3-geo'
// Kan denne stå i lag med d3 imports?
import { interpolateYlOrRd } from "d3-scale-chromatic"
import { iso31661Alpha2ToNumeric, ISO31661Entry, iso31661NumericToAlpha2, ISO31662Entry } from 'iso-3166';
import { Color } from 'react-bootstrap/esm/types';

const covidUrl = "https://storage.googleapis.com/covid19-open-data/v3/latest/epidemiology.csv"

interface DrawMapProps {
    data: GeoJsonProperties | undefined
}

interface CovidData {
    cumulative_confirmed: string,
    cumulative_deceased: string,
    cumulative_recovered: string,
    cumulative_tested: string,
    date: string,
    location_key: string,
    new_confirmed: string,
    new_deceased: string,
    new_recovered: string,
    new_tested: string,
}

const width: number = window.innerWidth;
const height: number = window.innerHeight - 56;
// https://stackoverflow.com/questions/55972289/how-can-i-scale-my-map-to-fit-my-svg-size-with-d3-and-geojson-path-data
export const DrawMap = ({ data: GeoJson }: DrawMapProps) => {
    // TODO: remove hard-coded value
    const [PathColors, setPathColors] = useState<Array<string>>([]);
    const [Highlight, setHighlight] = useState(-1);
    const [CovidData, setCovidData] = useState(new Array<CovidData>());
    //const [GeoJson, setGeoJson] = useState<GeoJsonProperties>();

    let path: GeoPath<any, GeoPermissibleObjects>;
    if (GeoJson) {
        const projection = geoMercator().fitSize([width, height], { type: "FeatureCollection", features: GeoJson.features })
        path = geoPath(projection);
    }

    useEffect(() => {
        console.log("H")
        csv(covidUrl).then(d => {
            //@ts-ignore
            setCovidData(d)
        });

        const svg = select<SVGSVGElement, unknown>("svg#map");


        //Zoom function for the map
        let features = svg.selectAll("path")
        let Zoom = zoom<SVGSVGElement, unknown>()
            .scaleExtent([1, 6])
            .translateExtent([[0, 0], [width, height]]) // Set pan Borders
            .on('zoom', (event) => {
                svg
                    .selectAll('path')
                    .attr('transform', event.transform);

                // TODO: remove comment beneath
                // @ts-ignore
                features.attr("d", path)
            });
        // Translate and scale the initial map
        svg.call(Zoom.transform, zoomIdentity.scale(1.5).translate(-width / Math.PI / 2, 2 * (-height / Math.PI / 2) / 3));

        // Use Zoom function
        svg.call(Zoom)


    }, []);

    useEffect(() => {
        if (CovidData.length == 0 || GeoJson === undefined) {
            return
        }
        console.log("A")
        let filteredData = CovidData.filter(e => e.date == "2022-01-09" || e.date == "2022-01-08" || e.date == "2022-01-10" && e.location_key?.length == 2);
        // Get data from filteredData
        //@ts-ignore
        let countriesData = GetCountries(filteredData);
        if (!countriesData) {
            return
        }
        // Create and get colors
        let colorScale = scaleSequential(interpolateYlOrRd).domain([0, countriesData.maxValue])
        let colors = new Array<string>(PathColors.length);
        console.log(GeoJson)
        GeoJson?.features.forEach((feature: Feature, index: number) => {
            //@ts-ignore
            let countryCode = iso31661NumericToAlpha2[feature.id];
            //@ts-ignore
            let Color: string = colorScale(countriesData?.countriesData[countryCode]);
            if (!Color) {
                Color = "gray"
            }
            colors.push(Color);
        });
        setPathColors(colors);
    }, [CovidData, GeoJson]);


    function mouseOver(index: number) {
        setHighlight(index)
    }
    function mouseLeave() {
        setHighlight(-1)
    }

    return (
        <>
            <svg width={width} height={height} id={"map"}>
                {GeoJson?.features.map((feature: Feature, index: number) => (
                    <path key={index} d={path(feature)!} id={"path"} style={{ fill: PathColors[index], opacity: Highlight===index || Highlight === -1 ? 1:0.5 }} 
                    onMouseEnter={()=>mouseOver(index)} onMouseLeave={()=>mouseLeave()} />
                ))}
            </svg>
        </>
    );
}


export default DrawMap;
// function GetColor(countryCode: string, colorScale: ScaleSequential<string, never>): string {

//     return "black";
//}

function GetCountries(colorData: DSVRowString<string>[]): undefined | { countriesData: { [name: string]: number }, maxValue: number } {

    // console.log(colorData)
    let countriesData: { [name: string]: number } = {};
    let maxValue: number = 0;
    colorData.forEach(countryRow => {
        if (!countryRow.location_key || !countryRow.new_confirmed) {
            return
        }
        let value = parseInt(countryRow.new_confirmed)
        countriesData[countryRow.location_key] = value;

        if (maxValue < value) {
            maxValue = value;
        }
    });
    return { countriesData, maxValue }
}
