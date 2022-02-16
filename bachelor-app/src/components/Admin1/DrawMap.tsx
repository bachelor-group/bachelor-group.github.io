import { useEffect, useMemo, useState, SyntheticEvent, ChangeEvent, FormEvent, MouseEvent, useRef } from 'react'
import { GeoJsonProperties, Feature } from "geojson";
import { geoMercator, GeoPath, GeoPermissibleObjects, select, scaleSequential, csv, DSVRowString, DSVRowArray, GeoIdentityTransform, text, max, geoAlbersUsa, interpolateHsl, format } from 'd3';
import { zoom, zoomIdentity } from 'd3-zoom';
import { geoAlbers, geoIdentity, geoPath } from 'd3-geo'
import { interpolateYlOrRd } from "d3-scale-chromatic"

import { SearchTrendsList } from '../SearchTrends/Old_script';
// import { LoadData as _LoadData } from '../DataContext/LoadData';
import { DataType } from '../DataContext/MasterDataType';
import { hasKey } from '../DataContext/DataTypes';
import { Form, ProgressBar } from 'react-bootstrap';

// const covidUrl = "https://storage.googleapis.com/covid19-open-data/v3/latest/epidemiology.csv"
const url = "https://storage.googleapis.com/covid19-open-data/v3/location/"

interface DrawMapProps {
    data: GeoJsonProperties | undefined
    country: string
    LoadData?: typeof _LoadData
}

const width: number = 800;
const height: number = 500;

const MARGIN = { left: 5, right: 5, top: 5, bottom: 5 }

const SEARCHTRENDS = SearchTrendsList.map((e) => e.slice(14).replaceAll("_", " "))

export const DrawAdmin1Map = ({ data: GeoJson, country, LoadData = _LoadData }: DrawMapProps) => {
    const toolTipdivRef = useRef(null);

    const [PathColors, setPathColors] = useState<Array<string>>([]);
    const [Highlight, setHighlight] = useState(-1);
    // const [data, setCovidData] = useState<DSVRowArray<string>>();
    const InitialMapZoom = zoomIdentity.scale(1)//zoomIdentity.scale(1.5).translate(-width / Math.PI / 2, 2 * (-height / Math.PI / 2) / 3);
    // const [path, setPath] = useState<GeoPath<any, GeoPermissibleObjects>>(geoPath());
    const [curGeoJson, setCurGeoJson] = useState<GeoJsonProperties | undefined>();
    const [suggestions, setSuggestions] = useState<string[]>(SEARCHTRENDS);
    const [data, setData] = useState<DataType[]>([]);
    const [chosenDate, setChosenDate] = useState<string>();

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


        // Create and get colors
        let colorScale = scaleSequential(interpolateYlOrRd).domain([0, 100])
        let colors = new Array<string>(0);

        for (let i = 0; i < curGeoJson.features.length; i++) {
            const element = curGeoJson.features[i];
            // let countryCode = iso31661NumericToAlpha2[feature.id!];
            let currentLocation = data.findIndex((d) => { return d.location_key === element.properties.iso_3166_2.replaceAll("-", "_") })
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
        setPathColors(colors);
    }, [data, curGeoJson, curSearchTrend]);

    function setSearchTrend(e: MouseEvent<HTMLOptionElement, MouseEvent> | ChangeEvent<HTMLSelectElement>) {
        //@ts-ignore
        let newValue = e.target.value;
        let newKey = `search_trends_${newValue.replaceAll(" ", "_")}`

        if (hasKey(data[0], newKey)) {
            console.log(`New key: ${newKey}`)
            setCurSearchTrend(newKey)
        }
    }

    function updateTooltip(event: MouseEvent<SVGPathElement | SVGSVGElement, globalThis.MouseEvent>, index: number = -1) {
        let show = false;
        // If svg click and country highlighted
        if (index === -1 && Highlight !== -1) {
            setHighlight(-1)
        }
        // If pathclick
        else if (index !== -1) {
            // Return if country already selected. Svg takes care of this
            if (Highlight !== -1) {
                return
            } else {
                setHighlight(index)
                show = true;
            }
        }
        // If svg and not highlighted the path will take care of it...
        else {
            return
        }
        // Should really only be one
        let selectedCountries: DataType[] = [];

        // Default to have popover go on right side of click
        let popoverLocation: "end" | "start" = "end";

        // Create the tooltip if show
        if (show) {
            let curdata: DataType[] = [];
            if (chosenDate) {
                curdata = data;
            } else {
                curdata = data;//latestData;
            }

            let countryCode = curGeoJson!.features[index].properties.iso_3166_2.replaceAll("-", "_");

            for (let i = 0; i < curdata.length; i++) {
                const element = curdata[i];
                if (element["location_key"] === countryCode) {
                    console.log(element)
                    if (!chosenDate || element["date"] === chosenDate) {
                        console.log("hei")
                        selectedCountries = [element];
                        break;
                    }
                }
            }
            if (event.clientX > width / 2) popoverLocation = "start";
        }

        console.log(selectedCountries)
        // Select elements and data
        let toolTipDiv = select(toolTipdivRef.current)
            // .attr("style", `left: ${event.clientX + (popoverLocation === "end" ? 1 : -1) * 10}px; top: ${event.clientY - 45}px; position: absolute; display: block; transform: translate(${popoverLocation === "end" ? 0 : -100}%, 0px)`)
            .selectAll<SVGSVGElement, DataType>("div")
            .data(selectedCountries, d => d.location_key!)

        // Append main div
        let toolTipDivEnterSelection = toolTipDiv.enter().append("div")
            .attr("class", `fade show popover bs-popover-${popoverLocation}`)

        // Append all child divs
        toolTipDivEnterSelection
            .append("div")
            .attr("class", "popover-arrow")
            .attr("style", d => "position: absolute; top: 0px; transform: translate(0px, 37px);")

        toolTipDivEnterSelection
            .append("div")
            .attr("class", "popover-header")
            .text(`${selectedCountries[0] === undefined ? "" : selectedCountries[0]["country_name"]}`)

        toolTipDivEnterSelection
            .append("div")
            .attr("class", "popover-body")
            .html(d => `<strong>new confirmed:</strong> ${d.new_confirmed!.replace(/\B(?=(\d{3})+(?!\d))/g, " ")} </br>
                        <strong>Per 100k:</strong> ${format(',.2f')(parseFloat(d.new_confirmed!) / parseFloat(d.population!) * 100000).replace(/\B(?=(\d{3})+(?!\d))/g, " ")}`)

        // Translate the div to correct location. We wait so the div get its width from text. this ensures there is no wrapping
        toolTipDivEnterSelection
            .transition()
            .attr("style", `left: 0px; top: ${event.nativeEvent.offsetY - 45}px; position: absolute; display: block; transform: translate(calc(${event.nativeEvent.offsetX + (popoverLocation === "end" ? 1 : -1) * 8}px + ${popoverLocation === "end" ? 0 : -100}%), 0px)`)


        toolTipDiv.exit().attr("style", "display: none;").remove()
    }

    return (
        <div style={{ position: "relative" }} className='plot-container'>
            <div className='trends-search'>
                <Form.Select onChange={(e) => setSearchTrend(e)} disabled={data.length === 0 ? true : false}>
                    {suggestions.map((suggestion) =>
                        <option value={suggestion} className='suggestion'>{suggestion}</option>
                    )}
                </Form.Select>
                {data.length === 0 ? <ProgressBar animated now={100} /> : <></>}
            </div>


            <svg width={width} height={height} id={"map"} onClick={(e) => updateTooltip(e)}>
                {curGeoJson?.features.map((feature: Feature, index: number) => (
                    <path key={index} d={path(feature)!} id={"path"} style={{ fill: PathColors[index], opacity: Highlight === index || Highlight === -1 ? 1 : 0.5 }}
                        transform={InitialMapZoom.toString()}
                        onClick={(e) => updateTooltip(e, index)} />
                ))}
            </svg>
            <div ref={toolTipdivRef} className='tool-tip'></div>
        </div>
    );
}


const _LoadData = (locations: string[]) => {
    return new Promise<DataType[]>((resolve) => {
        let newData: DataType[] = []
        let loaded_location = 0
        locations.forEach((location) => {
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
                }
            }
            );
        });
    });
}


export default DrawAdmin1Map;
