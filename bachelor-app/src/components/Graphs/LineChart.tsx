import { extent, group, line, scaleLinear } from 'd3';
import React, { useMemo } from 'react';
import { EpidemiologyData, EpidemiologyEnum } from "../DataContext/DataTypes";
import { Plot } from './PlotType';

// type Plot = {
//     [key: string]: PlotDataType[]
// }

interface LineChartProps {
    Width: number,
    Height: number,
    Plot: Plot,
    Title: string,
    // Data: EpidemiologyData[],
}

const MARGIN = { top: 30, right: 30, bottom: 50, left: 50 };

export const LineChart = ({ Width, Height, Title, Plot }: LineChartProps) => {
    
    const boundsWidth = Width - MARGIN.right - MARGIN.left - 0.5 * MARGIN.left; // ops på den - 0.5*margin.left, ser bedre ut med men det er jo hradcoda hehehehehehhe så det er ikke bra :PPPPPPPPPPPPPPPPPPPPPP
    const boundsHeight = Height - MARGIN.top - MARGIN.bottom;
    //@ts-ignore
    const reactLine = line().x(d => parseInt((d.new_confirmed))).y(parseInt((d => d.new_confirmed)));
    if (Plot.Data.length != 0){

        //@ts-ignore
        console.log(reactLine(Plot.Data));
    }

    
    console.log(`GroupBy: ${Plot.GroupBy}`)
    const sumstat = group(Plot.Data, (d) => d[Plot.GroupBy!]) // nest function allows to group the calculation per level of a factor

    const yScale = useMemo(() => {
        if (Plot.Data.length === 0) {
            return null;
        }
        // const [min, max] = extent(function (array: EpidemiologyData[]) {
        //     let res: number[] = [];
        //     // Go through dict
        //     array.forEach(function (Plot) {
        //         //Go through each value and concat to result array
        //         Plot.value.forEach((data) => res.concat(parseInt(data.yaxis)))
        //     });
        //     return (res);
        // }(Data)
        // );
        const [min, max] = extent(Plot.Data, function(d) {
            return parseInt(d[Plot.Axis[0]]!)
        })        



        if (min === undefined || max === undefined) {
            throw "Min or Max was undefined";
        }
        return scaleLinear().domain([min, max]).range([boundsHeight, 0]);
    }, [Plot, boundsHeight]);


    // X axis
    const xScale = useMemo(() => {
        if (Plot.Data.length === 0) {
            return null;
        }
        // const [min, max] = extent(function (array: Plot[]) {
        //     let res: number[] = [];
        //     array.forEach(function (Plot) {
        //         Plot.value.forEach((data) => res.concat(parseInt(data.xaxis)))
        //     });
        //     return (res);
        // }(Data)
        // );

        const [min, max] = extent(Plot.Data, function(d) {
            return parseInt(d[Plot.Axis[1]]!)
        }) 

        if (min === undefined || max === undefined) {
            throw "Min or Max was undefined";
        }
        return scaleLinear().domain([min, max]).range([0, boundsWidth]);
    }, [Plot, boundsWidth]);



    return (
        <div>
            <svg className="plot" id='LinePlot'>
                {Plot.Data.map((plot, index) => (
                    <path key={index} 
                        //@ts-ignore
                        d={reactLine ? reactLine(sumstat): "Sug en kuk"
                        }
                    ></path>

                ))}
            </svg>
            <h1> WORK IN PROGRESS</h1>
        </div>
    );

}  


export default LineChart;