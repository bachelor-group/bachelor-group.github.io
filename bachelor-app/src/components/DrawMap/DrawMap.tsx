import React, { useEffect, useRef, useState } from 'react'
import { GeoJsonProperties, Feature } from "geojson";
import { geoMercator, GeoPath, GeoPermissibleObjects, select, scaleSequential, csv, DSVRowString, DSVRowArray } from 'd3';
import { zoom, zoomIdentity } from 'd3-zoom';
import { Selection } from 'd3-selection';
import { geoPath } from 'd3-geo'
import { interpolateYlOrRd } from "d3-scale-chromatic"
import { iso31661Alpha2ToNumeric, ISO31661Entry, iso31661NumericToAlpha2 } from 'iso-3166';
import { Color } from 'react-bootstrap/esm/types';
import { DateHistogram } from './DateHistogram';

// const covidUrl = "https://storage.googleapis.com/covid19-open-data/v3/latest/epidemiology.csv"
const covidUrlUpdated = "csvData/epidemiology_min.csv"

interface DrawMapProps {
    data: GeoJsonProperties | undefined
}

const width: number = window.innerWidth;
const height: number = window.innerHeight - 56;

const dateHistogramSize = 0.2;

// TODO: total_confirmed blir ikke sendt inn, men må regnes ut, enten js eller python (om python så blir den sendt inn)
export type CovidDataType = {
   date: string,
   total_confirmed: number 
   location_key?: string,
   new_confirmed?: number

}

export const DrawMap = ({ data: GeoJson }: DrawMapProps) => {
    const [PathColors, setPathColors] = useState<Array<string>>([]);
    const [Highlight, setHighlight] = useState(-1);
    const [CovidData, setCovidData] = useState<CovidDataType[]>();
    const InitialMapZoom = zoomIdentity.scale(1.5).translate(-width / Math.PI / 2, 2 * (-height / Math.PI / 2) / 3);

    const [brushExtent, setBrushExtent] = useState();

    let path: GeoPath<any, GeoPermissibleObjects>;

    if (GeoJson) {
        const projection = geoMercator().fitSize([width, height], { type: "FeatureCollection", features: GeoJson.features })
        path = geoPath(projection);
    }

    useEffect(() => {
        csv(covidUrlUpdated).then(d  => {
            //TODO
            //@ts-ignore
            setCovidData(d)
        });

        const svg = select<SVGSVGElement, unknown>("svg#map");


        //Zoom function for the map
        let features = svg.selectAll("path")
        let Zoom = zoom<SVGSVGElement, unknown>()
            .scaleExtent([1.5, 6])
            .translateExtent([[0, 0], [width, height]]) // Set pan Borders
            .on('zoom', (event) => {
                svg
                    .selectAll('path')
                    .attr('transform', event.transform);

                //@ts-ignore
                features.attr("d", path)
            });
        // Translate and scale the initial map
        svg.call(Zoom.transform, InitialMapZoom);

        // Use Zoom function
        svg.call(Zoom)

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);


    useEffect(() => {
        if (CovidData === undefined || GeoJson === undefined) {
            return
        }
        let filteredData = CovidData.filter(e => e.location_key?.length === 2 && e.date === '2022-01-18');
        console.log(filteredData)
        // Get data from filteredData
        let countriesData = GetCountries(filteredData);
        console.log(countriesData)
        if (!countriesData) {
            return
        }
        // Create and get colors
        let colorScale = scaleSequential(interpolateYlOrRd).domain([0, countriesData.maxValue])
        let colors = new Array<string>(0);
        console.log(GeoJson)
        GeoJson?.features.forEach((feature: Feature, index: number) => {
            let countryCode = iso31661NumericToAlpha2[feature.id!];

            let Color: string = colorScale(countriesData!.countriesData[countryCode]);
            if (!Color) {
                Color = "gray"
            }
            colors.push(Color);
        });
        setPathColors(colors);
    }, [CovidData, GeoJson]);


    // Changes opacity of clicked country
    function toggleInfo(index: number) {
        if (index === -1 && Highlight !== -1) {
            setHighlight(-1)
        } else if (index !== -1) {
            if (Highlight !== -1) {
                setHighlight(-1)
            } else {
                setHighlight(index)
            }
        }
    }

    // https://www.youtube.com/watch?v=Gf40jrJTsQU
    return (
        <>
            <svg width={width} height={height} id={"map"} onClick={() => toggleInfo(-1)}>
                {GeoJson?.features.map((feature: Feature, index: number) => (
                    <path key={index} d={path(feature)!} id={"path"} style={{ fill: PathColors[index], opacity: Highlight === index || Highlight === -1 ? 1 : 0.5 }}
                        transform={InitialMapZoom.toString()}
                        onClick={() => toggleInfo(index)} />
                ))}

            </svg>
            <DateHistogram
                data={CovidData!}
                width={width}
                height={dateHistogramSize * height}
                setBrushExtent={setBrushExtent}
            />
        </>
    );
}


export default DrawMap;

function GetCountries(colorData: CovidDataType[]): undefined | { countriesData: { [name: string]: number }, maxValue: number } {

    // console.log(colorData)
    let countriesData: { [name: string]: number } = {};
    let maxValue: number = 0;
    colorData.forEach(countryRow => {
        if (!countryRow.location_key || !countryRow.new_confirmed) {
            return
        }
        let value = countryRow.new_confirmed
        countriesData[countryRow.location_key] = value;

        if (maxValue < value) {
            maxValue = value;
        }
    });
    return { countriesData, maxValue }
}
