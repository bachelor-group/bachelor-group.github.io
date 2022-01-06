import { geoNaturalEarth1, geoPath, geoGraticule } from 'd3';

const projection = geoNaturalEarth1().scale(100,100);
const path = geoPath(projection);
const graticule = geoGraticule();

export const Marks = ({ data: { land, interiors } }) => (
  <g className="marks">
    <path className="sphere" d={path({ type: 'Sphere' })} />
    <path className="graticules" d={path(graticule())} />
    {land.features.map((feature, index) => (
      <path className="land" key={index} d={path(feature)} />
    ))}
    <path className="interiors" d={path(interiors)} />
  </g>
);