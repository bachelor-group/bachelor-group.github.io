import { useEffect, useMemo, useState, useRef, memo } from 'react'
import { GeoJsonProperties, Feature } from "geojson";
import { select, scaleSequential, geoAlbersUsa, max, csv } from 'd3';
import { zoom, zoomIdentity } from 'd3-zoom';
import { geoIdentity, geoPath } from 'd3-geo'
import { interpolateOrRd } from "d3-scale-chromatic"
import { DataType } from '../DataContext/MasterDataType';
import Translater from './helpers';
import { MapToolTip } from './ToolTip';

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
    scalePer100K: boolean
}

const MARGIN = { left: 0, right: 0, top: 0, bottom: 0 }

export type FeatureData = { data: DataType, feature: Feature }

export const DrawMap = ({ GeoJson, InnerGeoJsonProp, country = "", DataTypeProperty, Data, CurDate, adminLvl, height, width, scalePer100K = false}: DrawMapProps) => {
    const translater = new Translater(adminLvl);

    //Refs
    const toolTipdivRef = useRef(null);
    const svgRef = useRef(null);
    const pathRef = useRef(null);
    const innerPathRef = useRef(null);
    const dateTextRef = useRef(null);

    // ToolTip
    const Tooltip = new MapToolTip({ width, translater, DataTypeProperty, divRef: toolTipdivRef, scalePer100K });

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
                    .selectAll('.move-on-zoom')
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
        let maxa: number

        if (scalePer100K) {
            maxa = max(data, d => parseFloat(d[DataTypeProperty]!) / parseFloat(d["population"]!) * 100_000)!
        }
        else {
            maxa = max(data, d => parseFloat(d[DataTypeProperty]!))!
        }

        return scaleSequential(interpolateOrRd).domain([0, maxa])
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

                // Find if innerData for country is shown
                for (let index in selectedInnerFeatures) {
                    let key = translater.countryCode(selectedInnerFeatures[index], 1)
                    if (key === translater.countryCode(feature, 0)) {
                        innerDataLoaded = true;
                        break;
                    }
                }

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
                .attr("style", (d, i) => {
                    let color: string;
                    let datapoint: number = parseFloat(d.data[DataTypeProperty]!);
                    if (scalePer100K) {
                        datapoint = datapoint / parseInt(d.data["population"]!) * 100_000;
                    }
                    color = colorScale(datapoint);

                    return `fill: ${d.data[DataTypeProperty] ? color : "gray"} `
                })
                .on("mousemove", (e, data) => { Tooltip.updateTooltipdiv(e, data, true) })
                .on("mouseleave", (e, data) => { Tooltip.updateTooltipdiv(e, data, false) })
                .on("click", (e, data) => clicked(e, data));

            features
                .on("mousemove", (e, data) => { Tooltip.updateTooltipdiv(e, data, true) })
                .on("mouseleave", (e, data) => { Tooltip.updateTooltipdiv(e, data, false) })
                .on("click", (e, data) => clicked(e, data))
                .transition()
                .duration(200)
                .attr("style", (d, i) => {
                    let color: string;
                    let datapoint: number = parseFloat(d.data[DataTypeProperty]!);
                    if (scalePer100K) {
                        datapoint = datapoint / parseInt(d.data["population"]!) * 100_000;
                    }
                    color = colorScale(datapoint);

                    return `fill: ${d.data[DataTypeProperty] ? color : "gray"} `
                })

            features.exit().remove()

            updateDateText(CurDate)
        }
    }

    function updateDateText(date: string) {
            let textSelection = select(dateTextRef.current).selectAll("text").data([date])

            textSelection.enter()
                .append('text')
                .attr("x", d => width / 2)
                .attr("y", d => 35)
                .attr('text-anchor', 'middle')
                .attr("dominant-baseline", "middle")
                .attr("style", "fill: white; stroke: black; stroke-width: 1; font-size: 2rem;")
                .html(d => CurDate)

            textSelection
                .attr("x", d => width / 2)
                .attr("y", d => 35)
                .attr('text-anchor', 'middle')
                .attr("dominant-baseline", "middle")
                .attr("style", "fill: white; stroke: black; stroke-width: 1; font-size: 2rem;")
                .html(d => CurDate)
    }

    function clicked(event: PointerEvent, d: FeatureData) {
        if (InnerGeoJson) {
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
                if (translater.countryCode(feature, 1) === d.data.location_key) {
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
    function DrawInnerFeatures() {
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

                    let color: string;
                    let datapoint: number = parseFloat(data[date][DataTypeProperty]!);
                    if (scalePer100K) {
                        datapoint = datapoint / parseInt(data[date]["population"]!) * 100_000;
                    }
                    color = colorScale(datapoint);

                    return `fill: ${data[date][DataTypeProperty] ? color : "gray"} `
                }
                else {
                    // TODO Colour for missing datapoint...
                    return `fill: magenta`
                }
            })
            .on("mousemove", (e, featureData) => { Tooltip.updateTooltipdiv(e, { data: innerData.get(translater.locationCode(featureData, 1))![findIndexToDate(data)], feature: featureData }, true) })
            .on("mouseleave", (e, featureData) => { Tooltip.updateTooltipdiv(e, { data: innerData.get(translater.locationCode(featureData, 1))![findIndexToDate(data)], feature: featureData }, true) });

        // Update
        innerFeaturesSelect
            .attr("style", (d, i) => {
                let data = innerData.get(translater.locationCode(d, 1));
                if (data) {
                    let date = findIndexToDate(data);
                    let color: string;
                    let datapoint: number = parseFloat(data[date][DataTypeProperty]!);
                    if (scalePer100K) {
                        datapoint = datapoint / parseInt(data[date]["population"]!) * 100_000;
                    }
                    color = colorScale(datapoint);

                    return `fill: ${data[date][DataTypeProperty] ? color : "gray"} `
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
                <g ref={pathRef} className="move-on-zoom" />
                <g ref={innerPathRef} className="move-on-zoom" />
                <g ref={dateTextRef} />
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
