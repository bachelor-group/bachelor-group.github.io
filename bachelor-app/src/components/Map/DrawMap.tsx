import { useEffect, useMemo, useState, MouseEvent, useRef, memo } from 'react'
import { GeoJsonProperties, Feature, Geometry } from "geojson";
import { geoMercator, GeoPath, GeoPermissibleObjects, select, scaleSequential, geoAlbersUsa, interpolateHsl, format, color, max, svg, csv } from 'd3';
import { zoom, zoomIdentity } from 'd3-zoom';
import { geoIdentity, geoPath } from 'd3-geo'
import { interpolateYlOrRd } from "d3-scale-chromatic"
import { SearchTrendsList } from '../SearchTrends/Old_script';
import { DataType } from '../DataContext/MasterDataType';
import { feature } from 'topojson';
import Translater from './helpers';

interface DrawMapProps {
    GeoJson: GeoJsonProperties | undefined
    InnerGeoJsonProp?: GeoJsonProperties | undefined
    country?: string
    DataTypeProperty: keyof DataType
    Data: DataType[]
    CurDate: string
    adminLvl: 0 | 1 | 2
    height: number
    width: number
}

//TODO MIGHT ADD LATER TO COLORSCALES
// parseFloat(d.data[DataTypeProperty]!)/ parseFloat(d.data["population"]!)*100_000)

const MARGIN = { left: 0, right: 0, top: 0, bottom: 0 }

type FeatureData = { data: DataType, feature: Feature }

export const DrawMap = ({ GeoJson, InnerGeoJsonProp, country = "", DataTypeProperty, Data, CurDate, adminLvl, height, width }: DrawMapProps) => {
    const translater = new Translater(adminLvl);

    //Refs
    const toolTipdivRef = useRef(null);
    const svgRef = useRef(null);
    const pathRef = useRef(null);
    const innerPathRef = useRef(null);

    // let helper = newHelperObject(adminLvl);

    //Data
    const [curGeoJson, setCurGeoJson] = useState<GeoJsonProperties>();
    const [data, setData] = useState<DataType[]>([]);
    const InitialMapZoom = zoomIdentity.scale(1)//zoomIdentity.scale(1.5).translate(-width / Math.PI / 2, 2 * (-height / Math.PI / 2) / 3);
    const [InnerGeoJson, setInnerGeoJson] = useState<GeoJsonProperties | undefined>(InnerGeoJsonProp);


    // Set state on new data
    useEffect(() => {
        setData(Data)
    }, [Data])

    useEffect(() => {
        setCurGeoJson(GeoJson);
    }, [GeoJson])


    useEffect(() => {
        setInnerGeoJson(InnerGeoJsonProp);
    }, [InnerGeoJsonProp])

    // IMPORTANT!
    let path = useMemo(() => {
        if (curGeoJson) {
            let projection = geoIdentity().reflectY(true).fitExtent([[MARGIN.left, MARGIN.top], [width - MARGIN.right, height - MARGIN.bottom]], { type: "FeatureCollection", features: curGeoJson.features });

            if (country === "US") {
                return geoPath(geoAlbersUsa().fitExtent([[MARGIN.left, MARGIN.top], [width - MARGIN.right, height - MARGIN.bottom]], { type: "FeatureCollection", features: curGeoJson.features }))
            } else {
                return geoPath(projection);
            }
        }
        return geoPath()

    }, [curGeoJson])

    useEffect(() => {
        const svg = select<SVGSVGElement, unknown>("svg#map");

        //Zoom function for the map
        let features = svg.selectAll("g")
        let Zoom = zoom<SVGSVGElement, unknown>()
            .scaleExtent([1, 15])
            .translateExtent([[0, 0], [width, height]]) // Set pan Borders
            .on('zoom', (event) => {
                svg
                    .selectAll('g')
                    .attr('transform', event.transform);

                //@ts-ignore
                // features.attr("d", path)
            });

        // Translate and scale the initial map
        svg.call(Zoom.transform, InitialMapZoom);

        // Use Zoom function
        svg.call(Zoom)

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    let colorScale = useMemo(() => {
        //TODO per 100K,
        let maxa = max(data, d => parseFloat(d[DataTypeProperty]!))!
        return scaleSequential(interpolateYlOrRd).domain([0, maxa])
    }, [data, DataTypeProperty]);

    useEffect(() => {
        // setDataTypeProp(DataTypeProperty);
        drawMap();
    }, [curGeoJson, data, colorScale, DataTypeProperty, CurDate])

    function drawMap() {
        if (curGeoJson)// && data.length !== 0) 
        {
            let currentData: FeatureData[] = [];

            for (let j = 0; j < curGeoJson!.features.length; j++) {
                const feature: Feature = curGeoJson!.features[j];
                let dataElement: DataType = {}

                for (let i = 0; i < data.length; i++) {
                    dataElement = data[i];
                    if (dataElement.date === CurDate && dataElement["location_key"] === translater.locationCode(feature)) {
                        break;
                    }
                    dataElement = {}
                }
                currentData.push({ data: dataElement, feature: feature });
            }

            let features = select(pathRef.current).selectAll<SVGSVGElement, FeatureData>("path").data(currentData, d => translater.locationCode(d.feature));
            features.select("*").remove();

            features
                .enter()
                .append("path")
                .attr("d", d => path(d.feature))
                .attr("style", (d, i) => `fill: ${d.data[DataTypeProperty] ? colorScale(parseFloat(d.data[DataTypeProperty]!)) : "gray"} `)
                .on("mousemove", (e, data) => { updateTooltipdiv(e, data, true, DataTypeProperty) })
                .on("mouseleave", (e, data) => { updateTooltipdiv(e, data, false, DataTypeProperty) });

            features
                .on("mousemove", (e, data) => { updateTooltipdiv(e, data, true, DataTypeProperty) })
                .on("mouseleave", (e, data) => { updateTooltipdiv(e, data, false, DataTypeProperty) })
                .on("click", (e, data) => clicked(e, data))
                .transition()
                .duration(200)
                .attr("style", (d, i) => `fill: ${d.data[DataTypeProperty] ? colorScale(parseFloat(d.data[DataTypeProperty]!)) : "gray"} `);

            features.exit().remove()
        }
    }


    function updateTooltipdiv(event: PointerEvent, data: FeatureData, show: boolean, dataType: keyof DataType) {
        // Should really only be one
        let selectedCountries: DataType[] = [];

        if (!show) {
            let test = select(toolTipdivRef.current)
                .selectAll<SVGSVGElement, typeof data>("div")
            // console.log("REMOVE")
            test.remove()
            return
        }

        // Default to have popover go on right side of click
        let popoverLocation: "end" | "start" = "end";
        if (event.offsetX > width / 2) popoverLocation = "start";

        // Select elements and data
        let toolTipDiv = select(toolTipdivRef.current)
            .selectAll<SVGSVGElement, typeof data>("div")
            .data([data], d => translater.name(d.feature));

        // Append main div
        let toolTipDivEnterSelection = toolTipDiv.enter().append("div")
            .attr("class", `fade show popover bs-popover-${popoverLocation} `);

        // Append all child divs
        toolTipDivEnterSelection
            .append("div")
            .attr("class", "popover-arrow")
            .attr("style", d => "top: 0px; transform: translate(0px, 37px);");

        toolTipDivEnterSelection
            .append("div")
            .attr("class", "popover-header")
            .text(d => `${translater.name(d.feature)} `);

        toolTipDivEnterSelection
            .append("div")
            .attr("class", "popover-body")
            .html(d => {
                let html = "";
                let selectedData = d.data[DataTypeProperty]
                if (selectedData !== undefined) {
                    html = `<strong> ${dataType.replaceAll("_", " ")}:</strong> ${selectedData.replace(/\B(?=(\d{3})+(?!\d))/g, " ")} </br >
                    <strong>Per 100k:</strong> ${format(',.2f')(parseFloat(selectedData) / parseFloat(d.data.population!) * 100000).replace(/\B(?=(\d{3})+(?!\d))/g, " ")} `
                } else {
                    html = "<strong>Insufficient Data</strong>"
                }
                return html;
            });

        // Translate the div to correct location. We wait so the div get its width from text. this ensures there is no wrapping
        toolTipDivEnterSelection
            .transition()
            .attr("style", `left: 0px; top: ${event.offsetY - 45}px; position: absolute; display: block; transform: translate(calc(${event.offsetX + (popoverLocation === "end" ? 1 : -1) * 8 * 2}px + ${popoverLocation === "end" ? 0 : -100}%), 0px)`);

        // toolTipDiv
        //     .attr("style", `left: 0px; top: 0; position: absolute; display: block;`);

        // Append main div
        let toolTipDivTransitionSelection = toolTipDiv
            .attr("class", `fade show popover bs-popover-${popoverLocation} `);


        // Append all child divs
        toolTipDivTransitionSelection
            .append("div")
            .attr("class", "popover-arrow")
            .attr("style", d => "top: 0px; transform: translate(0px, 37px);");

        toolTipDivTransitionSelection
            .append("div")
            .attr("class", "popover-header")
            .text(d => `${translater.name(d.feature)} `);

        toolTipDivTransitionSelection
            .append("div")
            .attr("class", "popover-body")
            .html(d => {
                let html = "";
                let selectedData = d.data[DataTypeProperty]
                if (selectedData !== undefined) {
                    html = `<strong> ${dataType.replaceAll("_", " ")}:</strong> ${selectedData.replace(/\B(?=(\d{3})+(?!\d))/g, " ")} </br >
                    <strong>Per 100k:</strong> ${format(',.2f')(parseFloat(selectedData) / parseFloat(d.data.population!) * 100000).replace(/\B(?=(\d{3})+(?!\d))/g, " ")} `
                } else {
                    html = "<strong>Insufficient Data</strong>"
                }
                return html;
            });


        toolTipDivTransitionSelection
            // .transition()
            .attr("style", `left: 0px; top: ${event.offsetY - 45}px; position: absolute; display: block; transform: translate(calc(${event.offsetX + (popoverLocation === "end" ? 1 : -1) * 8 * 2}px + ${popoverLocation === "end" ? 0 : -100}%), 0px)`);

        toolTipDiv.exit().remove()
    }

    function clicked(event: PointerEvent, d: FeatureData) {
        console.log(InnerGeoJson)
        if (InnerGeoJson) {
            let countryPaths = select(pathRef.current).selectAll<SVGSVGElement, FeatureData>("path")

            countryPaths
                .attr("style", data => {
                    if (d === data) {
                        return 'display: none'
                    }
                    return `fill: ${data.data[DataTypeProperty] ? colorScale(parseFloat(data.data[DataTypeProperty]!)) : "gray"} `
                })
            innerPaths(d)
        }

    }

    // Draw innerPaths after a click event
    function innerPaths(d: FeatureData) {
        if (InnerGeoJson) {
            let g = select(pathRef.current);
            let currentData: FeatureData[] = []
            // console.log(innerGeoJson)
            let innerFeatures: Feature[] = []

            let DUMMYDATA: FeatureData[] = [];
            let locations: string[] = [];
            // FIND INNERDATA
            for (let j = 0; j < InnerGeoJson.features.length; j++) {
                const feature: Feature = InnerGeoJson.features[j];
                // TODO "1" is Hardcoded
                if (translater.countryCode(feature, 1) === d.data.country_code) {
                    // console.log(translater.countryCode(feature, 1))
                    locations.push(translater.locationCode(feature, 1))
                    innerFeatures.push(feature);

                    // fetch(`https://storage.googleapis.com/covid19-open-data/v3/location/${translater.locationCode(feature, 1)}.csv`).then(d => {
                    //     let curData: DataType = {};
                    //     for (let i = 0; i < data.length; i++) {
                    //         const element = data[i];
                    //         if (element.date === CurDate) {
                    //             curData = element;
                    //             break;
                    //         }
                    //     }

                    //     if (curData === {}){
                    //         console.log(`curData = {} for ${translater.locationCode(feature, 1)}, Yikes...`)
                    //     }

                    //     DUMMYDATA.push({ feature: feature, data: curData})
                    // });

                    // ORIGINAL
                    // DUMMYDATA.push({ feature: feature, data: {} })
                }
            }
            loadInnerData(locations).then(data => {
                for (let j = 0; j < innerFeatures.length; j++) {
                    const feature = innerFeatures[j];
                    let dataElement: DataType = {}

                    for (let i = 0; i < data.length; i++) {
                        dataElement = data[i];
                        if (dataElement.date === CurDate && dataElement["location_key"] === translater.locationCode(feature, 1)) {
                            break;
                        }
                        dataElement = {}
                    }
                    DUMMYDATA.push({data: dataElement, feature: feature });
                }


                // Drawing innerFeatures
                let innerFeaturesSelect = select(innerPathRef.current).selectAll<SVGSVGElement, FeatureData>("path").data(DUMMYDATA, d => translater.locationCode(d.feature, 1));

                innerFeaturesSelect
                    .enter()
                    .append("path")
                    .attr("d", d => path(d.feature))
                    .attr("style", (d, i) => `fill: ${d.data[DataTypeProperty] ? colorScale(parseFloat(d.data[DataTypeProperty]!)) : "gray"} `)
                    .on("mousemove", (e, data) => { updateTooltipdiv(e, data, true, DataTypeProperty) })
                    .on("mouseleave", (e, data) => { updateTooltipdiv(e, data, false, DataTypeProperty) });

                // console.log(currentData)


                innerFeaturesSelect.exit().remove()
            })

            // console.log(DUMMYDATA)   
            // DUMMYDATA.forEach(d => {console.log(d.feature.properties!.iso_3166_2)})


        }
        else {
            throw 'innerPaths was called, but InnerGeoJsonProps was undefined'
        }
    }

    return (
        <>
            <svg style={{ width: width, height: height }} id={"map"} ref={svgRef}>
                {/* Paths */}
                <g ref={pathRef} />
                <g ref={innerPathRef} />
            </svg>
            <div ref={toolTipdivRef} />
        </>
    );
}

const loadInnerData = (locations: string[]) => {
    return new Promise<DataType[]>((resolve) => {
        let newData: DataType[] = []
        let loaded_location = 0
        locations.forEach((location) => {
            csv("https://storage.googleapis.com/covid19-open-data/v3/location/" + location.replaceAll("-", "_") + ".csv").then(d => {
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

export default memo(DrawMap);
