import { useEffect, useMemo, useState } from 'react'
import { GeoJsonProperties, Feature } from "geojson";
import { geoMercator, GeoPath, GeoPermissibleObjects, select, scaleSequential, csv, DSVRowString, DSVRowArray, sum } from 'd3';
import { zoom, zoomIdentity } from 'd3-zoom';
import { geoPath } from 'd3-geo'
import { interpolateYlOrRd } from "d3-scale-chromatic"
import { iso31661Alpha2ToNumeric, ISO31661Entry, iso31661NumericToAlpha2 } from 'iso-3166';
import { Color } from 'react-bootstrap/esm/types';
import { DateHistogram, EpidemiologyMinimum } from './DateHistogram';
import { EpidemiologyData } from '../DataContext/DataTypes';
import { DataType } from '../DataContext/MasterDataType';
import { TagExtended, _LoadCountries } from '../CountrySelector/SelectCountry';
import LoadData from '../DataContext/LoadData';

const covidUrl = "https://storage.googleapis.com/covid19-open-data/v3/latest/epidemiology.csv"
const covidUrlUpdated = "csvData/epidemiology_min.csv"
const fullEpidemiologyUrl = "https://storage.googleapis.com/covid19-open-data/v3/epidemiology.csv"

interface DrawMapProps {
    data: GeoJsonProperties | undefined
}

const width: number = window.innerWidth;
const height: number = window.innerHeight - 56;
const dateHistogramSize: number = 0.2;
export const DrawMap = ({ data: GeoJson }: DrawMapProps) => {
    const [PathColors, setPathColors] = useState<Array<string>>([]);
    const [Highlight, setHighlight] = useState(-1);
    const [CovidData, setCovidData] = useState<EpidemiologyData[]>();
    const [Data, setData] = useState<DataType[]>([]);
    const [HistogramData, setHistogramData] = useState<EpidemiologyMinimum[]>([]);

    // let today = new Date();
    // let dd = String(today.getDate()).padStart(2, '0');
    // let mm = String(today.getMonth() + 1).padStart(2, '0');
    // let yyyy = today.getFullYear();

    // let todayDate = yyyy + '-' + mm + '-' + dd;
    const [chosenDate, setChosenDate] = useState<string>();

    const InitialMapZoom = zoomIdentity.scale(1.5).translate(-width / Math.PI / 2, 2 * (-height / Math.PI / 2) / 3);

    let path: GeoPath<any, GeoPermissibleObjects>;

    if (GeoJson) {
        const projection = geoMercator().fitSize([width, height], { type: "FeatureCollection", features: GeoJson.features })
        path = geoPath(projection);
    }

    useEffect(() => {
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
        csv(covidUrl).then(d => {
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
        if (Data === undefined || GeoJson === undefined) {
            return
        }
        let filteredData = Data.filter(d => d.date === chosenDate);

        // Get data from filteredData
        let countriesData = GetCountries(filteredData);
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
    }, [GeoJson, Data, chosenDate]);


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

    const selectedDate = (date: string) => {
        setChosenDate(date)
    }

    return (
        <>
            <svg width={width} height={height} id={"map"} onClick={() => toggleInfo(-1)}>
                {GeoJson?.features.map((feature: Feature, index: number) => (
                    <path key={index} d={path(feature)!} id={"path"} style={{ fill: PathColors[index], opacity: Highlight === index || Highlight === -1 ? 1 : 0.5 }}
                        transform={InitialMapZoom.toString()}
                        onClick={() => toggleInfo(index)} />
                ))}

                <DateHistogram
                    Data={HistogramData}
                    width={width}
                    height={dateHistogramSize * height}
                    selectedDate={selectedDate}
                />

            </svg>
        </>
    );
}


export default DrawMap;

function GetCountries(colorData: DSVRowString<string>[]): undefined | { countriesData: { [name: string]: number }, maxValue: number } {

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
