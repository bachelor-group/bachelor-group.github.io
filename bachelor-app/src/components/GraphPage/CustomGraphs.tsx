import { FormEventHandler, useEffect, useState } from 'react'
import { Button, Col, Form, ProgressBar, Row, } from 'react-bootstrap';
import { EpidemiologyEnum, hasKey } from '../DataContext/DataTypes';
import SelectCountry, { TagExtended } from '../CountrySelector/SelectCountry';
import { LoadData as _LoadData } from '../DataContext/LoadData';
import { DataType } from '../DataContext/MasterDataType';
import { Plot, PlotType } from '../Graphs/PlotType';
import PlotsContainer from '../EpidemiologyContext/PlotsContainer';
import { setDefaultResultOrder } from 'dns/promises';
import GraphForm from './GraphForm';


interface Props {
    LoadData?: typeof _LoadData,
    Data: DataType[],
    WindowDimensions: {
        width: number,
        height: number
    }
}


export const CustomGraphs = ({ LoadData = _LoadData, Data, WindowDimensions }: Props) => {
    const [Plots, setPlots] = useState<Plot[]>([]);


    //Handle new Data
    useEffect(() => {
        let newPlots: Plot[] = new Array(Plots.length);
        Plots.forEach((Plot, i) => {

            let xAxis = Plot.Axis[0];
            let yAxis = Plot.Axis[1];
            let newPlot: Plot;
            let PlotData: DataType[] = []


            for (let j = 0; j < Data.length; j++) {
                //TODO: Two different ways of doing this, See in !== undefined
                if (hasKey(Data[j], xAxis) && hasKey(Data[j], yAxis)) {
                    if (Plot.GroupBy !== undefined) {
                        PlotData.push({ [xAxis]: Data[j][xAxis], [yAxis]: Data[j][yAxis], [Plot.GroupBy]: Data[j][Plot.GroupBy] })
                    } else {
                        PlotData.push({ [xAxis]: Data[j][xAxis], [yAxis]: Data[j][yAxis] })
                    }
                }
            }

            newPlot = { PlotType: Plot.PlotType, Data: PlotData, Axis: Plot.Axis, Height: WindowDimensions.height, Width: WindowDimensions.width, Title: Plot.Title, GroupBy: Plot.GroupBy };
            newPlots[i] = newPlot;
        })
        setPlots(newPlots);
    }, [Data, WindowDimensions]);


    const addPlot = (plotType: PlotType, xAxis: keyof DataType, yAxis: keyof DataType) => {
        let title: string;
        
        if (plotType === PlotType.Scatter){
            title = `${xAxis.replaceAll("_", " ")} (X) vs ${yAxis.replaceAll("_", " ")} (Y)`
            
        } else {
            title = yAxis.replaceAll("_", " ")
        }

        
        let Plot: Plot = { PlotType: plotType, Data: [], Axis: [xAxis, yAxis], Height: WindowDimensions.height, Width: WindowDimensions.width, Title: title, GroupBy: EpidemiologyEnum.location_key }
        let PlotData: DataType[] = []

        for (let j = 0; j < Data.length; j++) {
            if (hasKey(Data[j], xAxis) && hasKey(Data[j], yAxis)) {
                if (Plot.GroupBy !== undefined) {
                    PlotData.push({ [xAxis]: Data[j][xAxis], [yAxis]: Data[j][yAxis], [Plot.GroupBy]: Data[j][Plot.GroupBy] })
                } else {
                    PlotData.push({ [xAxis]: Data[j][xAxis], [yAxis]: Data[j][yAxis] })
                }
            }
        }

        Plot = { PlotType: Plot.PlotType, Data: PlotData, Axis: Plot.Axis, Height: WindowDimensions.height, Width: WindowDimensions.width, Title: Plot.Title, GroupBy: Plot.GroupBy };

        let newPlots: Plot[] = [Plot];

        setPlots(newPlots.concat(Plots))
    }


    return (
        <>

            <div style={{ display: 'flex', flexDirection: "column", alignItems: "center" }}>
                {
                    Data.length === 0 ?
                        <Row md="auto" className="align-items-center">
                            <Col style={{ width: "500px" }}>
                                <ProgressBar animated now={100} />
                            </Col>
                        </Row>
                        :
                        <>

                        <GraphForm Data={Data[0]} AddPlot={addPlot}></GraphForm>
                       {Plots.length === 0 ? <h3><br></br><br></br>Define your own plots here</h3>:<PlotsContainer Plots={Plots} />}
                        </>
                }
            </div>
        </>
    );
}

export default CustomGraphs;