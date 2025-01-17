import { csv, geoAlbersUsa, max, scaleSequential, select } from 'd3';
import { geoIdentity, geoPath } from 'd3-geo';
import { interpolateOrRd } from "d3-scale-chromatic";
import { zoom, zoomIdentity } from 'd3-zoom';
import { Feature, GeoJsonProperties } from "geojson";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { DataType } from '../DataContext/MasterDataType';
import Translator from './helpers';
import { MapToolTip } from './ToolTip';

interface DrawMapProps {
    GeoJson: GeoJsonProperties | undefined
    InnerGeoJsonProp?: GeoJsonProperties | undefined
    country?: string
    DataTypeProperty: keyof DataType
    Data: Map<string, DataType[]>
    CurDate: string
    adminLvl: 0 | 1 | 2
    height: number
    width: number
    scalePer100K: boolean
}

const MARGIN = { left: 0, right: 0, top: 0, bottom: 0 }

export type FeatureData = { data: DataType, feature: Feature }

export const DrawMap = ({ GeoJson, InnerGeoJsonProp, country = "", DataTypeProperty, Data, CurDate, adminLvl, height, width, scalePer100K = false }: DrawMapProps) => {
    const translator = new Translator(adminLvl);

    //Refs
    const toolTipdivRef = useRef(null);
    const svgRef = useRef(null);
    const pathRef = useRef(null);
    const innerPathRef = useRef(null);
    const dateTextRef = useRef(null);

    // ToolTip
    const Tooltip = new MapToolTip({ width, translator: translator, DataTypeProperty, divRef: toolTipdivRef, scalePer100K, adminLvl });

    //Data
    const [curGeoJson, setCurGeoJson] = useState<GeoJsonProperties>();
    const [data, setData] = useState<Map<string, DataType[]>>(new Map());
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

    }, [curGeoJson, width, height])

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
            });

        // Translate and scale the initial map
        svg.call(Zoom.transform, InitialMapZoom);

        // Use Zoom function
        svg.call(Zoom)

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    let colorScale = useMemo(() => {
        let maxValue: number
        let dataList: DataType[] = Array.from(data.values()).flat()

        if (scalePer100K) {
            maxValue = max(dataList, d => {
                if (parseFloat(d["population"]!) > 1_000_000) {
                    return parseFloat(d[DataTypeProperty]!) / parseFloat(d["population"]!) * 100_000
                }
                return -1
            })!
        }
        else {
            maxValue = max(dataList, d => parseFloat(d[DataTypeProperty]!))!
        }

        return scaleSequential(interpolateOrRd).domain([0, maxValue])
    }, [data, DataTypeProperty]);

    useEffect(() => {
        drawMap();
    }, [curGeoJson, data, innerData, colorScale, DataTypeProperty, CurDate, selectedInnerFeatures, height, width, InnerGeoJson])

    useEffect(() => {
        DrawInnerFeatures();
    }, [selectedInnerFeatures, CurDate, height, width])

    // Draw the outer features, also updates and removes them
    function drawMap() {
        if (curGeoJson) {
            let currentData: FeatureData[] = [];

            for (let j = 0; j < curGeoJson!.features.length; j++) {
                const feature: Feature = curGeoJson!.features[j];
                let dataElement: DataType = {}

                let innerDataLoaded = false;

                // Find if innerData for country is shown
                for (let index in selectedInnerFeatures) {
                    let key = translator.countryCode(selectedInnerFeatures[index], 1)
                    if (key === translator.countryCode(feature, 0)) {
                        innerDataLoaded = true;
                        break;
                    }
                }

                if (!innerDataLoaded) {
                    let DataArray: DataType[] | undefined = data.get(translator.locationCode(feature))
                    if (DataArray !== undefined) {
                        for (let i = 0; i < DataArray.length; i++) {
                            dataElement = DataArray[i];
                            if (dataElement.date === CurDate) {
                                break;
                            }
                            dataElement = {}
                        }
                        currentData.push({ data: dataElement, feature: feature });
                    }
                    // To keep features even when there is no data
                    else {
                        currentData.push({ data: {}, feature: feature });
                    }
                }
            }

            let features = select(pathRef.current).selectAll<SVGSVGElement, FeatureData>("path").data(currentData, d => translator.locationCode(d.feature));
            features.select("*").remove();

            features
                .enter()
                .append("path")
                .on("click", (e, data) => clicked(e, data))
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
                .attr("d", d => path(d.feature))
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
            .attr("x", () => width / 2)
            .attr("y", () => 35)
            .attr('text-anchor', 'middle')
            .attr("dominant-baseline", "middle")
            .attr("style", "fill: white; stroke: black; stroke-width: 1; font-size: 2rem;")
            .html(d => CurDate)

        textSelection
            .attr("x", () => width / 2)
            .attr("y", () => 35)
            .attr('text-anchor', 'middle')
            .attr("dominant-baseline", "middle")
            .attr("style", "fill: white; stroke: black; stroke-width: 1; font-size: 2rem;")
            .html(() => CurDate)
    }

    const clicked = useCallback((event: PointerEvent, d: FeatureData) => {
        if (InnerGeoJson) {
            innerPaths(d)
        }
    }, [InnerGeoJson, innerData])

    // setInnerData after a click event
    const innerPaths = useCallback((d: FeatureData) => {
        if (InnerGeoJson) {
            let innerFeatures: Feature[] = [];
            let CurrentData: Map<string, DataType[]> = innerData;
            let locations: string[] = [];

            // FIND INNERDATA
            for (let j = 0; j < InnerGeoJson.features.length; j++) {
                const feature: Feature = InnerGeoJson.features[j];
                if (translator.countryCode(feature, adminLvl + 1 as 0 | 1 | 2) === d.data.location_key) {
                    if (feature.properties!.LOCATION_KEY) {
                        locations.push(feature.properties!.LOCATION_KEY)
                    }
                    innerFeatures.push(feature);
                }
            }

            // Check if data is loaded
            let needToLoad = true;
            for (let location of locations) {
                if (CurrentData.has(location)) {
                    needToLoad = false;
                    break;
                }
            }

            // Add data to loaded data
            let mergedData = CurrentData;
            if (needToLoad && locations.length !== 0) {
                loadInnerData(locations).then(data => {
                    let oldData = CurrentData;
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
    }, [innerData, InnerGeoJson])


    function setAllInnerData(Data: Map<string, DataType[]>, innerFeatures: Feature[]) {
        setInnerData(Data);
        setSelectedInnerFeatures(innerFeatures);
    }

    function DrawInnerFeatures() {
        // Drawing innerFeatures
        let innerFeaturesSelect = select(innerPathRef.current).selectAll<SVGSVGElement, Feature>("path").data(selectedInnerFeatures, d => translator.locationCode(d, 1));

        innerFeaturesSelect
            .enter()
            .append("path")
            .attr("d", d => path(d))
            .attr("style", (d, i) => {
                let data = innerData.get(translator.locationCode(d, 1));
                if (data) {
                    let date = findIndexToDate(data);
                    let color: string;

                    let fill = "gray"
                    if (date < data.length && date !== -1) {
                        let datapoint: number = parseFloat(data[date][DataTypeProperty]!);
                        if (scalePer100K) {
                            datapoint = datapoint / parseInt(data[date]["population"]!) * 100_000;
                        }
                        color = colorScale(datapoint);
                        fill = data[date][DataTypeProperty] ? color : "gray"
                    }

                    return `fill: ${fill} `
                }
                else {
                    return `fill: magenta`
                }
            })
            .on("mousemove", (e, featureData) => {
                Tooltip.updateTooltipdiv(e,
                    {
                        data: innerData.get(featureData.properties!.LOCATION_KEY) ?
                            innerData.get(featureData.properties!.LOCATION_KEY)![findIndexToDate(innerData.get(translator.locationCode(featureData, 1)))]
                            :
                            {},
                        feature: featureData
                    },
                    true,
                    1)
            })
            .on("mouseleave", (e, featureData) => {
                Tooltip.updateTooltipdiv(e, {
                    data: innerData.get(featureData.properties!.LOCATION_KEY) ?
                        innerData.get(featureData.properties!.LOCATION_KEY)![findIndexToDate(innerData.get(translator.locationCode(featureData, 1)))]
                        :
                        {},
                    feature: featureData
                },
                    true,
                    1)
            })
            .on("mouseleave", (e, data) => { Tooltip.updateTooltipdiv(e, { data: {}, feature: data }, false) });

        // Update
        innerFeaturesSelect
            .attr("style", (d, i) => {
                let data = innerData.get(translator.locationCode(d, 1));
                if (data) {
                    let date = findIndexToDate(data);
                    let color: string;
                    let fill = "gray"
                    if (date < data.length && date !== -1) {
                        let datapoint: number = parseFloat(data[date][DataTypeProperty]!);
                        if (scalePer100K) {
                            datapoint = datapoint / parseInt(data[date]["population"]!) * 100_000;
                        }
                        color = colorScale(datapoint);
                        fill = data[date][DataTypeProperty] ? color : "gray"
                    }

                    return `fill: ${fill} `
                }
                else {
                    return `fill: magenta`
                }
            })
            .attr("d", d => path(d))
            .on("mousemove", (e, featureData) => {
                Tooltip.updateTooltipdiv(e,
                    {
                        data: innerData.get(featureData.properties!.LOCATION_KEY) ?
                            innerData.get(featureData.properties!.LOCATION_KEY)![findIndexToDate(innerData.get(translator.locationCode(featureData, 1)))]
                            :
                            {},
                        feature: featureData
                    },
                    true,
                    1)
            })
            .on("mouseleave", (e, featureData) => {
                Tooltip.updateTooltipdiv(e, {
                    data: innerData.get(featureData.properties!.LOCATION_KEY) ?
                        innerData.get(featureData.properties!.LOCATION_KEY)![findIndexToDate(innerData.get(translator.locationCode(featureData, 1)))]
                        :
                        {},
                    feature: featureData
                },
                    true,
                    1)
            })
            .on("mouseleave", (e, data) => { Tooltip.updateTooltipdiv(e, { data: {}, feature: data }, false) });;

        innerFeaturesSelect.exit().remove()
    }

    function findIndexToDate(list: DataType[] | undefined): number {
        if (!list) {
            return -1
        }

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
        let newData: Map<string, DataType[]> = new Map();
        let loaded_location = 0;
        locations.forEach((location) => {
            csv("https://storage.googleapis.com/covid19-open-data/v3/location/" + location.replaceAll("-", "_") + ".csv").then(d => {
                newData.set(location, d)
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
