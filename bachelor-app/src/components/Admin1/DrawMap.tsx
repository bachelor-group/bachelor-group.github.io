import { useEffect, useMemo, useState } from 'react'
import { GeoJsonProperties, Feature } from "geojson";
import { geoMercator, GeoPath, GeoPermissibleObjects, select, scaleSequential, csv, DSVRowString, DSVRowArray } from 'd3';
import { zoom, zoomIdentity } from 'd3-zoom';
import { geoIdentity, geoPath } from 'd3-geo'
import { interpolateYlOrRd } from "d3-scale-chromatic"
import { iso31661NumericToAlpha2 } from 'iso-3166';

const covidUrl = "https://storage.googleapis.com/covid19-open-data/v3/latest/epidemiology.csv"

interface DrawMapProps {
    data: GeoJsonProperties | undefined
}

const width: number = window.innerWidth;
const height: number = window.innerHeight - 56;

export const DrawAdmin1Map = ({ data: GeoJson }: DrawMapProps) => {
    const [PathColors, setPathColors] = useState<Array<string>>([]);
    const [Highlight, setHighlight] = useState(-1);
    const [CovidData, setCovidData] = useState<DSVRowArray<string>>();
    const InitialMapZoom = zoomIdentity.scale(3)//zoomIdentity.scale(1.5).translate(-width / Math.PI / 2, 2 * (-height / Math.PI / 2) / 3);
    const [curGeoJson, setCurGeoJson] = useState<GeoJsonProperties | undefined>();

    let path: GeoPath<any, GeoPermissibleObjects>;


    
    if (GeoJson) {

        const projection = geoIdentity().reflectY(true).fitSize([width, height], { type: "FeatureCollection", features: GeoJson.features })
        path = geoPath(projection);
    }
    useEffect(() => {
        let temp = GeoJson;
        if (temp){
            console.log(GeoJson)
            let tempFeatures: Feature[] = []

            for (let i=0; i < temp.features.length; i++){
                let Feature = temp.features[i];
                if (Feature.properties.admin === "Norway"){
                    tempFeatures.push(Feature)
                }
            }     
            temp.features = tempFeatures;
            console.log(temp);
        }
        setCurGeoJson(temp); 
    }, [GeoJson])

    useEffect(() => {
        csv(covidUrl).then(d => {
            setCovidData(d)
        });

        const svg = select<SVGSVGElement, unknown>("svg#map");


        //Zoom function for the map
        let features = svg.selectAll("path")
        let Zoom = zoom<SVGSVGElement, unknown>()
            .scaleExtent([3, 15])
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
        let filteredData = CovidData.filter(e => e.location_key?.length === 2);
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


    return (
        <>
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