import React, { ReactNode, SVGProps } from 'react'
import { GeoJsonProperties, Feature } from "geojson";
import { geoEquirectangular,geoMercator, GeoPath, GeoPermissibleObjects, select } from 'd3';
import { zoom, zoomIdentity} from 'd3-zoom';
import { Selection } from 'd3-selection';
import {geoPath} from 'd3-geo'

interface DrawMapProps {
    data: GeoJsonProperties | undefined
}

const width: number = window.innerWidth;
const height: number = window.innerHeight - 56;
// https://stackoverflow.com/questions/55972289/how-can-i-scale-my-map-to-fit-my-svg-size-with-d3-and-geojson-path-data
export const DrawMap = ({ data }: DrawMapProps) => {
    let path: GeoPath<any, GeoPermissibleObjects>;

    if (data) {

        const svg = select<SVGSVGElement, unknown>("svg#map");
        const projection = geoMercator() // .fitSize([width, height], { type: "FeatureCollection", features: data.features })
        path = geoPath(projection);

        console.log(data.features.length)
        let features = svg.selectAll("path")
            .data(data.features)
            .enter()
            .append("path");


        console.log(path)
        console.log(features)

        // Let the zoom take care of modifying the projection:
        // let Zoom = zoom<SVGSVGElement, unknown>()
        //     .scaleExtent([1, 2])
        // .on('zoom', (event, whatisthis) => {
        //     console.log(whatisthis)
        //     svg.append('g').attr('transform', event.transform)
        // });

        let Zoom = zoom<SVGSVGElement, unknown>()
            .scaleExtent([1, 2])
            .on('zoom', (event) => {
                let t = event.transform;
                projection.scale(t.k).translate([t.x, t.y]);
                console.log(projection)
                //svg.selectChildren("path").enter().append("path").attr("d")
                //console.log(svg.selectChildren("path").attr("d"))
                
                // @ts-ignore
                features.attr("d", path)
            });

        svg.call(Zoom)
        
        svg.call(Zoom.transform, zoomIdentity.translate(width/2,height/2).scale(width/Math.PI/2));

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
