import { useEffect, useMemo, useState, MouseEvent, useRef, memo } from 'react'
import { GeoJsonProperties, Feature } from "geojson";
import { geoMercator, GeoPath, GeoPermissibleObjects, select, scaleSequential, geoAlbersUsa, interpolateHsl, format, color, max } from 'd3';
import { zoom, zoomIdentity } from 'd3-zoom';
import { geoIdentity, geoPath } from 'd3-geo'
import { interpolateYlOrRd } from "d3-scale-chromatic"
import { SearchTrendsList } from '../SearchTrends/Old_script';
import { DataType } from '../DataContext/MasterDataType';
import { feature } from 'topojson';

interface DrawMapProps {
    GeoJson: GeoJsonProperties | undefined
    country: string
    DataTypeProperty: keyof DataType
    Data: DataType[]
    Date: string
    adminLvl: number
    height: number
    width: number
}

//TODO MIGHT ADD LATER TO COLORSCALES
// parseFloat(d.data[DataTypeProperty]!)/ parseFloat(d.data["population"]!)*100_000)

function helperObject(adminLvl: number) {
    return { adminLvl: adminLvl, name: adminLvl === 0 ? "NAME" : "name", countryCode: adminLvl === 0 ? "ISO_A2_EH" : "iso_3166_2" }
}

const MARGIN = { left: 0, right: 0, top: 0, bottom: 0 }

type FeatureData = { data: DataType, feature: Feature }

export const DrawAdmin1Map = ({ GeoJson, country = "", DataTypeProperty, Data, Date, adminLvl, height, width }: DrawMapProps) => {
    //Refs
    const toolTipdivRef = useRef(null);
    const svgRef = useRef(null);
    const pathRef = useRef(null);

    let helper = helperObject(adminLvl);

    //Data
    const [curGeoJson, setCurGeoJson] = useState<GeoJsonProperties>();
    const [data, setData] = useState<DataType[]>([]);
    const InitialMapZoom = zoomIdentity.scale(1)//zoomIdentity.scale(1.5).translate(-width / Math.PI / 2, 2 * (-height / Math.PI / 2) / 3);
    const [chosenDate, setChosenDate] = useState<string>();
    const [dataTypeProp, setDataTypeProp] = useState<keyof DataType>();


    const [PathColors, setPathColors] = useState<Array<string>>([]);
    const [Highlight, setHighlight] = useState(-1);

    // Set state on new data
    useEffect(() => {
        setData(Data)
    }, [Data])

    useEffect(() => {
        setCurGeoJson(GeoJson);
    }, [GeoJson])

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

    let colorScale = useMemo(() => {
        //TODO per 100K,
        let maxa = max(data, d => parseFloat(d[DataTypeProperty]!))!
        return scaleSequential(interpolateYlOrRd).domain([0, maxa])
    }, [data, DataTypeProperty]);

    useEffect(() => {
        setDataTypeProp(DataTypeProperty);
        drawMap();
    }, [curGeoJson, data, colorScale, DataTypeProperty, Date])

    function drawMap() {
        if (curGeoJson && data.length !== 0) {
            let currentData: FeatureData[] = [];

            for (let j = 0; j < curGeoJson!.features.length; j++) {
                const feature: Feature = curGeoJson!.features[j];
                let dataElement: DataType = {}
                for (let i = 0; i < data.length; i++) {
                    dataElement = data[i];
                    if (dataElement.date === Date && dataElement["location_key"] === feature.properties![helper.countryCode].replaceAll("-", "_")) {
                        break;
                    }
                    dataElement = {}
                }
                currentData.push({ data: dataElement, feature: feature });
            }


            let features = select(pathRef.current).selectAll<SVGSVGElement, { data: DataType, feature: Feature }>("path").data(currentData, d => d.feature.properties![helper.countryCode]);
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
                .on("click", clicked)
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
            console.log("REMOVE")
            test.remove()
            return
        }

        // Default to have popover go on right side of click
        let popoverLocation: "end" | "start" = "end";
        if (event.offsetX > width / 2) popoverLocation = "start";

        // Select elements and data
        let toolTipDiv = select(toolTipdivRef.current)
            .selectAll<SVGSVGElement, typeof data>("div")
            .data([data], d => d.feature.properties![helper.name]);

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
            .text(d => `${d.feature.properties![helper.name]} `);

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
            .text(d => `${d.feature.properties![helper.name]} `);

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
        console.log(event)
        console.log(d)

        let g = select(pathRef.current)

        console.log(g.attr("transform"))
        if (!g.attr("transform")) {
            var bounds = path.bounds(d.feature),
                dx = bounds[1][0] - bounds[0][0],
                dy = bounds[1][1] - bounds[0][1],
                x = (bounds[0][0] + bounds[1][0]) / 2,
                y = (bounds[0][1] + bounds[1][1]) / 2,
                scale = .9 / Math.max(dx / width, dy / height),
                translate = [width / 2 - scale * x, height / 2 - scale * y];

            g.transition()
                .duration(750)
                // .style("stroke-width", 1.5 / scale + "px")
                .attr("transform", "translate(" + translate + ")scale(" + scale + ")");
        } else {
            g.transition()
                .duration(750)
                // .attr("transform", "translate(" + 0 + ")scale(" + 0 + ")")
                .attr("transform", null);
        }

    }

    return (
        <>
            <svg style={{ width: width, height: height }} id={"map"} ref={svgRef}>
                {/* Paths */}
                <g ref={pathRef} />

                {/* onClick={(e) => updateTooltip(e)} > */}
                {/* {curGeoJson?.features.map((feature: Feature, index: number) => (
                    <path key={index} d={path(feature)!} id={"path"} style={{ fill: PathColors[index], opacity: Highlight === index || Highlight === -1 ? 1 : 0.5 }}
                        transform={InitialMapZoom.toString()}
                        onClick={(e) => updateTooltip(e, index)} />
                ))} */}
            </svg>
            <div ref={toolTipdivRef} />
        </>
    );
}

export default memo(DrawAdmin1Map);
