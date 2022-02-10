import { useEffect, useMemo, useRef, useState, MouseEvent } from 'react'
import { GeoJsonProperties, Feature } from "geojson";
import { geoMercator, GeoPath, GeoPermissibleObjects, select, scaleSequential, csv, DSVRowString, format } from 'd3';
import { zoom, zoomIdentity } from 'd3-zoom';
import { geoPath } from 'd3-geo'
import { interpolateYlOrRd } from "d3-scale-chromatic"
import { iso31661NumericToAlpha2 } from 'iso-3166';
import { DateHistogram, EpidemiologyMinimum } from './DateHistogram';
import { DataType } from '../DataContext/MasterDataType';
import { TagExtended, _LoadCountries } from '../CountrySelector/SelectCountry';
import LoadData from '../DataContext/LoadData';

const covidUrl = "https://storage.googleapis.com/covid19-open-data/v3/latest/aggregated.csv"

interface DrawMapProps {
    data: GeoJsonProperties | undefined
}

const width: number = window.innerWidth;
const height: number = window.innerHeight - 56;
const dateHistogramSize: number = 0.225;
export const DrawMap = ({ data: GeoJson }: DrawMapProps) => {
    const toolTipdivRef = useRef(null);
    const [PathColors, setPathColors] = useState<Array<string>>([]);
    const [Highlight, setHighlight] = useState(-1);
    const [CovidData, setCovidData] = useState<DataType[]>();
    const [Data, setData] = useState<DataType[]>([]);
    const [HistogramData, setHistogramData] = useState<EpidemiologyMinimum[]>([]);

    const [chosenDate, setChosenDate] = useState<string>();

    const InitialMapZoom = zoomIdentity.scale(1.5).translate(-width / Math.PI / 2, 2 * (-height / Math.PI / 2) / 3);

    let path: GeoPath<any, GeoPermissibleObjects>;

    if (GeoJson) {
        const projection = geoMercator().fitSize([width, height], { type: "FeatureCollection", features: GeoJson.features })
        path = geoPath(projection);
    }

    useMemo(() => {
        if (Data.length === 0) {
            return
        }
        var HistogramData = new Map<string, number>()
        Data.forEach(d => {
            if (HistogramData.has(d.date!)) {
                if (!isNaN(parseInt(d.new_confirmed!))) {
                    HistogramData.set(d.date!, HistogramData.get(d.date!)! + parseInt(d.new_confirmed!))
                }

            } else {
                if (!isNaN(parseInt(d.new_confirmed!))) {
                    HistogramData.set(d.date!, parseInt(d.new_confirmed!))
                }
            }
        })
        setHistogramData(Array.from(HistogramData, ([date, total_confirmed]) => ({ date, total_confirmed })));
    }, [Data])

    useMemo(() => {
        csv(covidUrl).then((d: DataType[]) => {
            setCovidData(d)
        });

        _LoadCountries().then((d: TagExtended[]) => {
            LoadData(d, []).then((d: DataType[]) => {
                setData(d)
            })
        })

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
        if (Data === undefined || GeoJson === undefined || CovidData === undefined) {
            return
        }
        let filteredData = Data.filter(d => d.date === chosenDate);
        let filteredRecentData = CovidData.filter(d => d.location_key!.length === 2);

        // Get data from filteredData

        let countriesData: {
            countriesData: {
                [name: string]: number;
            };
            maxValue: number;
        } | undefined

        if (chosenDate !== undefined) {
            countriesData = GetCountries(filteredData);
        } else {
            countriesData = GetCountries(filteredRecentData);
        }

        if (!countriesData) {
            return
        }

        // Create and get colors
        let colorScale = scaleSequential(interpolateYlOrRd).domain([0, countriesData.maxValue])
        let colors = new Array<string>(0);
        GeoJson?.features.forEach((feature: Feature, index: number) => {
            let countryCode = iso31661NumericToAlpha2[feature.id!];

            let Color: string = colorScale(countriesData!.countriesData[countryCode]);
            if (!Color) {
                Color = "gray"
            }
            colors.push(Color);
        });
        setPathColors(colors);

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [GeoJson, chosenDate, CovidData]);


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

    function updateTooltip(event: MouseEvent<SVGPathElement, globalThis.MouseEvent>, index: number) {
        let show = false;
        if (index === -1 && Highlight !== -1) {
            setHighlight(-1)
        } else if (index !== -1) {
            if (Highlight !== -1) {
                setHighlight(-1)
            } else {
                setHighlight(index)
                show = true;
            }
        }
        // Create the tooltip if show
        if (show) {
            let countryCode = iso31661NumericToAlpha2[GeoJson!.features[index].id!];
            // Should really only be one
            let selectedCountries: DataType[] = []

            for (let i = 0; i < Data.length; i++) {
                const element = Data[i];
                if (element["location_key"] === countryCode && element["date"] === chosenDate) {
                    selectedCountries = [element];
                    break;
                }
            }

            let toolTipDiv = select(toolTipdivRef.current)
                .attr("position", "relative")
                .attr("class", "fade show popover bs-popover-end")
                .attr("style", `left: ${event.clientX + 10}px; top: ${event.clientY-45}px; position: absolute`)
                .attr("display", "block")
                .selectAll<SVGSVGElement, DataType>("div")
                .data(selectedCountries, d => d.location_key!)
            setHighlight(index)

            toolTipDiv.enter().append("div")
            .attr("class", "popover-arrow")
            .attr("style", "position: absolute; top: 0px; transform: translate(0px, 37px);")

            toolTipDiv.enter()
                .append("div")
                .attr("class", "popover-header")
                // .attr("style", `left: ${event.nativeEvent.offsetX + 10}px; top: ${event.nativeEvent.offsetY}px; position: absolute`)
                // .attr("display", "block")
                .text(`${selectedCountries[0]["country_name"]}`)

            toolTipDiv.enter()
                .append("div")
                .attr("class", "popover-body")
                .html(d => `<strong>new confirmed:</strong> ${d.new_confirmed} </br>
                            <strong>Per 100k:</strong> ${format(',.2f')(parseFloat(d.new_confirmed!)/parseFloat(d.population!)*100000)}`)


            // toolTipDiv.transition().duration(0)
            //     .attr("style", `left: ${event.nativeEvent.offsetX + 10}px; top: ${event.nativeEvent.offsetY}px; position: absolute`)
            //     .attr("display", "block")
            //     .text("HEISANN")

            toolTipDiv.exit().remove()
        }



    }

    const selectedDate = (date: string) => {
        setChosenDate(date)
    }

    return (
        <>
            <svg width={width} height={height} id={"map"} onClick={() => toggleInfo(-1)}>
                {GeoJson?.features.map((feature: Feature, index: number) => (
                    <path key={index} d={path(feature)!} id={"path"} style={{ fill: PathColors[index], opacity: Highlight === index || Highlight === -1 ? 1 : 0.5 }}
                        transform={InitialMapZoom.toString()}
                        onClick={(e) => updateTooltip(e, index)} />
                ))}

                <DateHistogram
                    Data={HistogramData}
                    width={width}
                    height={dateHistogramSize * height}
                    selectedDate={selectedDate}
                />
            </svg>
            <div ref={toolTipdivRef} style={{ opacity: Highlight !== -1 ? 1 : 0, position: "absolute", display: "none" }} className='tool-tip'></div>
        </>
    );
}


export default DrawMap;

function GetCountries(colorData: DSVRowString<string>[]): undefined | { countriesData: { [name: string]: number }, maxValue: number } {

    let countriesData: { [name: string]: number } = {};
    let maxValue: number = 0;
    colorData.forEach(countryRow => {
        if (!countryRow.location_key || !countryRow.new_confirmed || !countryRow.population) {
            return
        }

        let value = parseInt(countryRow.new_confirmed) / parseInt(countryRow.population) * 10000
        countriesData[countryRow.location_key] = value;

        if (maxValue < value) {
            maxValue = value;
        }
    });
    return { countriesData, maxValue }
}
