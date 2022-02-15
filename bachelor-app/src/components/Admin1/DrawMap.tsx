import { useEffect, useMemo, useState, SyntheticEvent, ChangeEvent, FormEvent } from 'react'
import { GeoJsonProperties, Feature } from "geojson";
import { geoMercator, GeoPath, GeoPermissibleObjects, select, scaleSequential, csv, DSVRowString, DSVRowArray, GeoIdentityTransform, text, max } from 'd3';
import { zoom, zoomIdentity } from 'd3-zoom';
import { geoIdentity, geoPath } from 'd3-geo'
import { interpolateYlOrRd } from "d3-scale-chromatic"

import { SearchTrendsList } from '../SearchTrends/Old_script';
import { LoadData as _LoadData } from '../DataContext/LoadData';
import { DataType } from '../DataContext/MasterDataType';

// const covidUrl = "https://storage.googleapis.com/covid19-open-data/v3/latest/epidemiology.csv"
const url = "https://storage.googleapis.com/covid19-open-data/v3/location/"

interface DrawMapProps {
    data: GeoJsonProperties | undefined
    country: string
    LoadData?: typeof _LoadData
}

const width: number = window.innerWidth;
const height: number = window.innerHeight - 56;

const MARGIN = { left: 50, right: 50, top: 50, bottom: 50 }

const SEARCHTRENDS = SearchTrendsList.map((e) => e.slice(14).replaceAll("_", " "))

export const DrawAdmin1Map = ({ data: GeoJson, country, LoadData = _LoadData }: DrawMapProps) => {
    const [PathColors, setPathColors] = useState<Array<string>>([]);
    const [Highlight, setHighlight] = useState(-1);
    // const [data, setCovidData] = useState<DSVRowArray<string>>();
    const InitialMapZoom = zoomIdentity.scale(1)//zoomIdentity.scale(1.5).translate(-width / Math.PI / 2, 2 * (-height / Math.PI / 2) / 3);
    // const [path, setPath] = useState<GeoPath<any, GeoPermissibleObjects>>(geoPath());
    const [curGeoJson, setCurGeoJson] = useState<GeoJsonProperties | undefined>();
    const [suggestions, setSuggestions] = useState<string[]>(SEARCHTRENDS);
    const [data, setData] = useState<DataType[]>([]);

    useEffect(() => {
        if (GeoJson) {
            let temp = JSON.parse(JSON.stringify(GeoJson));
            let tempFeatures: Feature[] = []

            for (let i = 0; i < temp.features.length; i++) {
                let Feature = temp.features[i];
                if (Feature.properties.iso_a2.toLowerCase() === country.toLowerCase()) {
                    tempFeatures.push(Feature)
                }
            }
            temp.features = tempFeatures;
            setCurGeoJson(temp);
        }
    }, [GeoJson, country])

    let path: GeoPath<any, GeoPermissibleObjects>;
    if (curGeoJson) {
        const projection = geoIdentity().reflectY(true).fitExtent([[MARGIN.left, MARGIN.top], [width - MARGIN.right, height - MARGIN.bottom]], { type: "FeatureCollection", features: curGeoJson.features })
        path = geoPath(projection);
    }

    useEffect(() => {
        let newdata = data;
        if (curGeoJson) {
            let locations: string[] = []
            for (let i = 0; i < curGeoJson.features.length; i++) {
                const element = curGeoJson.features[i];
                locations.push(element.properties.iso_3166_2)
            }
            // _LoadData(locations)
            let loaded_location = 0
            locations.forEach((location) => {
                csv(url + location.replaceAll("-", "_") + ".csv").then(d => {
                    d.forEach(element => {
                        data.push(element)
                    });
                    loaded_location++
                    if (locations.length === loaded_location) {
                        setData(newdata);
                        console.log(newdata);
                    }
                }).catch((error) => {
                    console.log(location)
                    loaded_location++
                    if (locations.length === loaded_location) {
                        setData(newdata);
                        console.log(newdata);
                    }
                }
                );
            });
        }
        setData([]);
    }, [curGeoJson])


    useEffect(() => {
        const svg = select<SVGSVGElement, unknown>("svg#map");


        //Zoom function for the map
        let features = svg.selectAll("path")
        let Zoom = zoom<SVGSVGElement, unknown>()
            .scaleExtent([1, 15])
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
        if (data.length === 0 || !curGeoJson) {
            return
        }
        // let filteredData = data.filter(e => e.location_key?.length === 2);
        // Get data from filteredData
        // let countriesData = GetCountries(filteredData);
        // if (!countriesData) {
        //     return
        // }
        // Create and get colors


        let colorScale = scaleSequential(interpolateYlOrRd).domain([0, 100])
        let colors = new Array<string>(0);

        for (let i = 0; i < curGeoJson.features.length; i++) {
            const element = curGeoJson.features[i];
            // let countryCode = iso31661NumericToAlpha2[feature.id!];
            let currentLocation = data.findIndex((d) => { return d.location_key === element.properties.iso_3166_2.replaceAll("-", "_") })
            console.log(currentLocation)
            console.log(element.properties.iso_3166_2.replaceAll("-", "_"))
            if (currentLocation !== -1) {
                let Color: string = colorScale(parseFloat(data[currentLocation]["search_trends_infection"]!));
                if (!Color) {
                    Color = "gray"
                }
                colors.push(Color);
            }
        }
        setPathColors(colors);
    }, [data, curGeoJson]);


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

    function filterSearchTrends(e: FormEvent<HTMLInputElement>) {
        var reg = new RegExp(e.currentTarget.value)
        setSuggestions(SEARCHTRENDS.filter(function (term) {
            if (term.match(reg)) {
                return term;
            }
        })
        );

    }

    return (
        <>
            <div className='trends-search'>
                <input type='search' className='form-control' onChange={(e) => filterSearchTrends(e)} />
                {suggestions.map((suggestion) =>
                    <option>{suggestion}</option>
                )}

            </div>
            <svg width={width} height={height} id={"map"} onClick={() => toggleInfo(-1)}>
                {curGeoJson?.features.map((feature: Feature, index: number) => (
                    <path key={index} d={path(feature)!} id={"path"} style={{ fill: PathColors[index], opacity: Highlight === index || Highlight === -1 ? 1 : 0.5 }}
                        transform={InitialMapZoom.toString()}
                        onClick={() => toggleInfo(index)} />
                ))}

            </svg>
        </>
    );
}


export default DrawAdmin1Map;

// function GetCountries(colorData: DSVRowString<string>[]): undefined | { countriesData: { [name: string]: number }, maxValue: number } {
//     let countriesData: { [name: string]: number } = {};
//     let maxValue: number = 0;
//     colorData.forEach(countryRow => {
//         if (!countryRow.search_trends_infection {
//             return
//         }
//         let value = parseFloat(countryRow.search_trends_infection)
//         countriesData[countryRow.location_key] = value;

//         if (maxValue < value) {
//             maxValue = value;
//         }
//     });
//     return { countriesData, maxValue }
// }
