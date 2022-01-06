import React from 'react';
import ReactDOM from 'react-dom';
import { useData } from './borderData';
import { Marks } from './marks';


function MapC(){
    const data = useData();
    const width = 960*2;
    const height = 500*2;
    if (!data) {
        return <pre>Loading...</pre>;
    }

    return (
        <svg width={width} height={height}>
            <Marks data={data} />
        </svg>
    );
}

export default MapC