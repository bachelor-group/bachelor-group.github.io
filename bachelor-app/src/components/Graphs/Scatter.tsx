import { useEffect, useMemo, useRef, useState } from "react";
import { extent, scaleLinear, axisLeft, axisBottom, select } from 'd3';
import { DataType } from "../DataContext/LoadData";

interface ScatterProps {
  Width: number,
  Height: number,
  Data: DataType[]
}

// let data: dataType =  []
// for (let i = 0; i < 10; i++) {
//     data.push({ xaxis: i, yaxis: i })
// }

const MARGIN = { top: 30, right: 30, bottom: 50, left: 50 };

export const Scatter = ({ Width, Height, Data }: ScatterProps) => {

  const axesRef = useRef(null)
  const boundsWidth = Width - MARGIN.right - MARGIN.left;
  const boundsHeight = Height - MARGIN.top - MARGIN.bottom;

  // Y axis
  const yScale = useMemo(() => {
    const [min, max] = extent(Data.map((d) => d.yaxis));
    if (min === undefined || max === undefined) {
      throw "Min or Max was undefined";
    }
    return scaleLinear().domain([min, max]).range([boundsHeight, 0]);
  }, [Data, Height]);

  // X axis
  const xScale = useMemo(() => {
    const [min, max] = extent(Data.map((d) => d.xaxis));
    if (min === undefined || max === undefined) {
      throw "Min or Max was undefined";
    }
    return scaleLinear().domain([min, max]).range([0, boundsWidth]);
  }, [Data, Width]);

  useEffect(() => {
    const svgElement = select(axesRef.current);
    svgElement.selectAll("*").remove();
    const xAxisGenerator = axisBottom(xScale);
    svgElement
      .append("g")
      .attr("transform", "translate(0," + boundsHeight + ")")
      .call(xAxisGenerator);

    const yAxisGenerator = axisLeft(yScale);

    svgElement.append("g").call(yAxisGenerator);
  }, [xScale, yScale, boundsHeight]);

  // Build the shapes
  const allShapes = Data.map((d, i) => {
    return (
      <circle
        key={i}
        r={4}
        cx={xScale(d.xaxis)}
        cy={yScale(d.yaxis)}
        opacity={1}
        stroke="#9a6fb0"
        fill="#9a6fb0"
        fillOpacity={0.7}
        strokeWidth={1}
      />
    );
  });

  return (
    <div>
      <svg width={Width} height={Height} style={{ display: "inline-block" }}>
        {/* first group is for the violin and box shapes */}
        <g
          width={boundsWidth}
          height={boundsHeight}
          transform={`translate(${[MARGIN.left, MARGIN.top].join(",")})`}
        >
          {allShapes}
        </g>
        {/* Second is for the axes */}
        <g
          width={boundsWidth}
          height={boundsHeight}
          ref={axesRef}
          transform={`translate(${[MARGIN.left, MARGIN.top].join(",")})`}
        />
      </svg>
    </div>
  );
}


export default Scatter;
