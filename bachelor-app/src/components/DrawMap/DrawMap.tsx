import React, { ReactNode, SVGProps } from 'react'
import { GeoJsonProperties, Feature } from "geojson";
import { geoEquirectangular, geoMercator, GeoPath, GeoPermissibleObjects, select, scaleSequential, max, color } from 'd3';
import { zoom, zoomIdentity } from 'd3-zoom';
import { Selection } from 'd3-selection';
import { geoPath } from 'd3-geo'
// Kan denne stå i lag med d3 imports?
import { interpolateYlOrRd } from "d3-scale-chromatic"

let DUMMYDATA = new Array<Number>(241);
for (let i = 0; i < DUMMYDATA.length; i++) {
    DUMMYDATA[i] = i;
}

// @ts-ignore
const colorScale = scaleSequential(interpolateYlOrRd).domain([0, max(DUMMYDATA)])
console.log(colorScale(0))


interface DrawMapProps {
    data: GeoJsonProperties | undefined
}

const width: number = window.innerWidth;
const height: number = window.innerHeight - 56;
// https://stackoverflow.com/questions/55972289/how-can-i-scale-my-map-to-fit-my-svg-size-with-d3-and-geojson-path-data
export const DrawMap = ({ data }: DrawMapProps) => {
    let path: GeoPath<any, GeoPermissibleObjects>;

    if (data) {
        console.log(data);
        const svg = select<SVGSVGElement, unknown>("svg#map");
        const projection = geoMercator().fitSize([width, height], { type: "FeatureCollection", features: data.features })
        path = geoPath(projection);

        let features = svg.selectAll("path")
            .data(data.features)
            .enter()
            .append("path")
            // TODO: Preferably remove any type
            .style("fill", function(d: Feature | any): string
            { 
              return colorScale(d.id)
            })
            .on("mouseover", function() {
                    select(this)
                        //.style("fill", "black")
                        .style("opacity", 1)
                svg
                        //TODO: Make every country EXCEPT the hovered country
                    .selectAll("path")
                    .transition()
                    .duration(200)
                    .style("opacity", .5);
            })
            .on("mouseout", function(){
                svg
                .selectAll("path")
                .transition()
                .duration(200)
                .style("opacity", 1)
                //.style("fill", colorScale(241))
                
            });

        // // Set color of country:
        // console.log(features.data())
        // //@ts-ignore data() gir ikke typen :(
        // features.data().map(feature => {
        //     console.log(feature)
        // })

        //Zoom function for the map
        let Zoom = zoom<SVGSVGElement, unknown>()
            .scaleExtent([1, 6])
            .translateExtent([[0, 0], [width, height]]) // Set pan Borders
            .on('zoom', (event) => {
                svg
                    .selectAll('path')
                    .attr('transform', event.transform);

                // TODO: remove comment beneath
                // @ts-ignore
                features.attr("d", path)
            });

        // Translate and scale the initial map
        svg.call(Zoom.transform, zoomIdentity.scale(1.5).translate(-width/Math.PI/2, 2*(-height/Math.PI/2)/3));

        // Use Zoom function
        svg.call(Zoom)

    }

    return (
        <>
            <svg width={width} height={height} id={"map"}>

                {/* {data?.features.map((feature: Feature, index: number) => (
                    <path key={index} d={path(feature)!} id={"path"} />
                ))} */}

            </svg>
        </>
    );
}


export default DrawMap;
