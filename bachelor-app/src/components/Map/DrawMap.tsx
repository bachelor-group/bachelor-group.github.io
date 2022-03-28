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

    // Inner
    const [innerData, setInnerData] = useState<Map<string, DataType[]>>(new Map());
    const [selectedInnerFeatures, setSelectedInnerFeatures] = useState<Feature[]>([])

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
        let maxa = max(data, d => parseFloat(d[DataTypeProperty]!)/parseFloat(d["population"]!) * 100_000)!
        return scaleSequential(interpolateYlOrRd).domain([0, maxa])
    }, [data, DataTypeProperty]);

    useEffect(() => {
        // setDataTypeProp(DataTypeProperty);
        drawMap();
    }, [curGeoJson, data, colorScale, DataTypeProperty, CurDate, selectedInnerFeatures])

    useEffect(() => {
        // setDataTypeProp(DataTypeProperty)
        DrawInnerFeatures();
    }, [selectedInnerFeatures, CurDate])

    function drawMap() {
        if (curGeoJson) {
            let currentData: FeatureData[] = [];

            for (let j = 0; j < curGeoJson!.features.length; j++) {
                const feature: Feature = curGeoJson!.features[j];
                let dataElement: DataType = {}

                let innerDataLoaded = false;
                // console.log(innerData)
                // for (let index in selectedInnerFeatures) {
                //     let key = translater.countryCode(selectedInnerFeatures[index], 1)
                //     if (key === translater.countryCode(feature, 0)) {
                //         innerDataLoaded = true;
                //         break;
                //     }
                // }

                if (!innerDataLoaded) {
                    for (let i = 0; i < data.length; i++) {
                        dataElement = data[i];
                        if (dataElement.date === CurDate && dataElement["location_key"] === translater.locationCode(feature)) {
                            break;
                        }
                        dataElement = {}
                    }
                    currentData.push({ data: dataElement, feature: feature });
                }
            }

            let features = select(pathRef.current).selectAll<SVGSVGElement, FeatureData>("path").data(currentData, d => translater.locationCode(d.feature));
            features.select("*").remove();

            features
                .enter()
                .append("path")
                .attr("d", d => path(d.feature))
                .attr("style", (d, i) => `fill: ${d.data[DataTypeProperty] ? colorScale(parseFloat(d.data[DataTypeProperty]!)/parseInt(d.data["population"]!) * 100_000) : "gray"} `)
                .on("mousemove", (e, data) => { updateTooltipdiv(e, data, true, DataTypeProperty) })
                .on("mouseleave", (e, data) => { updateTooltipdiv(e, data, false, DataTypeProperty) });

            features
                .on("mousemove", (e, data) => { updateTooltipdiv(e, data, true, DataTypeProperty) })
                .on("mouseleave", (e, data) => { updateTooltipdiv(e, data, false, DataTypeProperty) })
                .on("click", (e, data) => clicked(e, data))
                .transition()
                .duration(200)
                .attr("style", (d, i) => `fill: ${d.data[DataTypeProperty] ? colorScale(parseFloat(d.data[DataTypeProperty]!)/parseInt(d.data["population"]!) * 100_000) : "gray"} `);

            features.exit().remove()
        }
    }


    function updateTooltipdiv(event: PointerEvent, data: FeatureData, show: boolean, dataType: keyof DataType) {
        // Should really only be one
        let selectedCountries: DataType[] = [];

        //Get Admin lvl
        let adminLvl = data.data.location_key?.split("_").length! - 1

        if (!show) {
            let test = select(toolTipdivRef.current)
                .selectAll<SVGSVGElement, typeof data>("div")
            test.remove()
            return
        }

        // Default to have popover go on right side of click
        let popoverLocation: "end" | "start" = "end";
        if (event.offsetX > width / 2) popoverLocation = "start";

        // Select elements and data
        let toolTipDiv = select(toolTipdivRef.current)
            .selectAll<SVGSVGElement, typeof data>("div")
            .data([data], d => translater.name(d.feature, adminLvl));

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
            .text(d => `${translater.name(d.feature, adminLvl)} `);

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
            .text(d => `${translater.name(d.feature, adminLvl)} `);

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
            .attr("style", `left: 0px; top: ${event.offsetY - 45}px; position: absolute; display: block; transform: translate(calc(${event.offsetX + (popoverLocation === "end" ? 1 : -1) * 8 * 2}px + ${popoverLocation === "end" ? 0 : -100}%), 0px)`);

        toolTipDiv.exit().remove()
    }

    function clicked(event: PointerEvent, d: FeatureData) {
        if (InnerGeoJson) {
            // let countryPaths = select(pathRef.current).selectAll<SVGSVGElement, FeatureData>("path")

            // countryPaths
            //     .attr("style", data => {
            //         if (d === data) {
            //             return 'display: none'
            //         }
            //         return `fill: ${data.data[DataTypeProperty] ? colorScale(parseFloat(data.data[DataTypeProperty]!)) : "gray"} `
            //     })
            innerPaths(d)
        }

    }

    // setInnerData after a click event
    function innerPaths(d: FeatureData) {
        if (InnerGeoJson) {
            let innerFeatures: Feature[] = [];
            let CurrentData: Map<string, DataType[]> = innerData;
            let locations: string[] = [];

            // FIND INNERDATA
            for (let j = 0; j < InnerGeoJson.features.length; j++) {
                const feature: Feature = InnerGeoJson.features[j];
                // TODO "1" is Hardcoded
                if (translater.countryCode(feature, 1) === d.data.country_code) {
                    locations.push(translater.locationCode(feature, 1))
                    innerFeatures.push(feature);
                }
            }

            // Check if data is loaded
            let needToLoad = true;
            for (let entry of Array.from(CurrentData.entries())) {
                let countryCode = entry[0].split("_")[0]
                if (countryCode === d.data.country_code) {
                    needToLoad = false;
                    console.log("FOUND IT BBY")
                    break;
                }
            }

            // Add data to loaded data
            let mergedData = innerData;
            if (needToLoad) {
                loadInnerData(locations).then(data => {
                    let oldData = innerData;
                    mergedData = new Map([...Array.from(oldData.entries()), ...Array.from(data.entries())]);
                    setAllInnerData(mergedData, innerFeatures);
                })
            }
            else {
                setAllInnerData(mergedData, innerFeatures);
            }
        }
        else {
            throw 'innerPaths was called, but InnerGeoJsonProps was undefined'
        }
    }

    function setAllInnerData(Data: Map<string, DataType[]>, innerFeatures: Feature[]) {
        setInnerData(Data);
        setSelectedInnerFeatures(innerFeatures);
    }
    function DrawInnerFeatures(){
         // Drawing innerFeatures
         let innerFeaturesSelect = select(innerPathRef.current).selectAll<SVGSVGElement, Feature>("path").data(selectedInnerFeatures, d => translater.locationCode(d, 1));

         innerFeaturesSelect
             .enter()
             .append("path")
             .attr("d", d => path(d))
             .attr("style", (d, i) => {
                 let data = innerData.get(translater.locationCode(d, 1));
                 if (data) {
                     let date = findIndexToDate(data);
                     return `fill: ${data[date][DataTypeProperty] ? colorScale(parseFloat(data[date][DataTypeProperty]!)) : "gray"} `;
                 }
                 else {
                     // TODO Colour for missing datapoint...
                     return `fill: magenta`
                 }
             })
             .on("mousemove", (e, featureData) => { updateTooltipdiv(e, {data: innerData.get(translater.locationCode(featureData, 1))![findIndexToDate(data)], feature: featureData}, true, DataTypeProperty) })
             .on("mouseleave", (e, featureData) => { updateTooltipdiv(e, {data: innerData.get(translater.locationCode(featureData, 1))![findIndexToDate(data)], feature: featureData}, true, DataTypeProperty) });

        // Update
        innerFeaturesSelect
            .attr("style", (d, i) => {
                let data = innerData.get(translater.locationCode(d, 1));
                if (data) {
                    let date = findIndexToDate(data);
                    return `fill: ${data[date][DataTypeProperty] ? colorScale(parseFloat(data[date][DataTypeProperty]!)) : "gray"} `;
                }
                else {
                    // TODO Colour for missing datapoint...
                    return `fill: magenta`
                }
            })

        innerFeaturesSelect.exit().remove()
    }

    function findIndexToDate(list: DataType[]): number {
        let index = -1;
        for (let i = 0; i < list.length; i++) {
            const element = list[i];
            if (element.date === CurDate) {
                return i;
            }
        }
        return index
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
    return new Promise<Map<string, DataType[]>>((resolve) => {
        let newData: DataType[] = [];
        let temp: Map<string, DataType[]> = new Map();
        let loaded_location = 0;
        locations.forEach((location) => {
            csv("https://storage.googleapis.com/covid19-open-data/v3/location/" + location.replaceAll("-", "_") + ".csv").then(d => {

                temp.set(location, d)

                // d.forEach(element => {
                //     newData.push(element)
                // });
                loaded_location++
                if (locations.length === loaded_location) {
                    resolve(temp);
                }
            }).catch((error) => {
                loaded_location++
                if (locations.length === loaded_location) {
                    resolve(temp);
                }
            }
            );
        });
    });
}

export default memo(DrawMap);
