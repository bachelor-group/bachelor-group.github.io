import React, { ReactNode, SVGProps } from 'react'
import { GeoJsonProperties, Feature } from "geojson";
import { geoMercator, geoPath } from 'd3';

interface DrawMapProps {
    data: GeoJsonProperties | undefined
}

const width: number = 1000;
const height: number = 1000;

export const DrawMap = ({ data }: DrawMapProps) => {

    const projection = geoMercator().scale(width);
    const path = geoPath(projection);
    const svg: JSX.Element = React.createElement("svg");

    // svg.width = width;
    // svg.height = height;
    console.log(data)

    return (
        <>
            <svg width={width} height={height}>
                
                {data?.features.map((feature: Feature, index: number) => {
                    <path key={index} d={path(feature)!} />
                })}

            </svg>
        </>
    );
}


export default DrawMap;