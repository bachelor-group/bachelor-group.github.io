import { useEffect, useMemo, useState, SyntheticEvent, ChangeEvent, FormEvent, MouseEvent, useRef } from 'react'
import { GeoJsonProperties, Feature } from "geojson";
import { geoMercator, GeoPath, GeoPermissibleObjects, select, scaleSequential, csv, DSVRowString, DSVRowArray, GeoIdentityTransform, text, max, geoAlbersUsa } from 'd3';
import { zoom, zoomIdentity } from 'd3-zoom';
import { geoAlbers, geoIdentity, geoPath } from 'd3-geo'
import { interpolateYlOrRd } from "d3-scale-chromatic"

import { SearchTrendsList } from '../SearchTrends/Old_script';
// import { LoadData as _LoadData } from '../DataContext/LoadData';
import { DataType } from '../DataContext/MasterDataType';
import ReactTags, { Tag } from 'react-tag-autocomplete';
import { isKeyObject } from 'util/types';
import { hasKey } from '../DataContext/DataTypes';
import { Form, ProgressBar } from 'react-bootstrap';

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

    // Search box
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [curSearchTrend, setCurSearchTrend] = useState<keyof DataType>("search_trends_abdominal_obesity");
    const searchInputRef = useRef(null);


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
            // console.log(tempFeatures)
            setCurGeoJson(temp);
        }
    }, [GeoJson, country])

    let path: GeoPath<any, GeoPermissibleObjects>;
    if (curGeoJson) {
        let projection = geoIdentity().reflectY(true).fitExtent([[MARGIN.left, MARGIN.top], [width - MARGIN.right, height - MARGIN.bottom]], { type: "FeatureCollection", features: curGeoJson.features });

        if (country === "US") {
            path = geoPath(geoAlbersUsa().fitExtent([[MARGIN.left, MARGIN.top], [width - MARGIN.right, height - MARGIN.bottom]], { type: "FeatureCollection", features: curGeoJson.features }))
        } else {
            path = geoPath(projection);
        }
    }

    useEffect(() => {
        if (curGeoJson) {
            let locations: string[] = []
            for (let i = 0; i < curGeoJson.features.length; i++) {
                const element = curGeoJson.features[i];
                locations.push(element.properties.iso_3166_2)
            }
            LoadData(locations).then(d => setData(d))
        } else {
            setData([]);
        }
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

        console.log("hei Igjen")
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
            // console.log(currentLocation)
            // console.log(element.properties.iso_3166_2.replaceAll("-", "_"))
            if (currentLocation !== -1) {
                let Color: string = colorScale(parseFloat(data[currentLocation][curSearchTrend]!));
                if (!Color) {
                    Color = "gray"
                }
                colors.push(Color);
            } else {
                colors.push("gray");
            }
        }
        console.log(colors)
        setPathColors(colors);
    }, [data, curGeoJson, curSearchTrend]);


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

    function setSearchTrend(e: MouseEvent<HTMLOptionElement, MouseEvent> | ChangeEvent<HTMLSelectElement>) {
        //@ts-ignore
        let newValue = e.target.value;
        let newKey = `search_trends_${newValue.replaceAll(" ", "_")}`

        if (hasKey(data[0], newKey)) {
            console.log(`New key: ${newKey}`)
            setCurSearchTrend(newKey)
        }
    }

    return (
        <>
            <div className='trends-search'>
                <Form.Select onChange={(e) => setSearchTrend(e)}>
                    {suggestions.map((suggestion) =>
                        <option value={suggestion} className='suggestion'>{suggestion}</option>
                    )}
                </Form.Select>
                {data.length === 0 ? <ProgressBar animated now={100} /> : <></>}
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


const _LoadData = (locations: string[]) => {
    return new Promise<DataType[]>((resolve) => {
        let newData: DataType[] = []
        let loaded_location = 0
        locations.forEach((location) => {
            console.log("Loading")
            csv(url + location.replaceAll("-", "_") + ".csv").then(d => {
                d.forEach(element => {
                    newData.push(element)
                });
                loaded_location++
                if (locations.length === loaded_location) {
                    resolve(newData);
                }
            }).catch((error) => {
                loaded_location++
                if (locations.length === loaded_location) {
                    resolve(newData);
                    console.log("Hei2")
                }
            }
            );
        });
    });
}


export default DrawAdmin1Map;


