import { useEffect, useState } from 'react'
import { Col, ProgressBar, Row, } from 'react-bootstrap';
import { DataType } from '../../../../DataContext/MasterDataType';
import { Plot, PlotType } from '../../../../Graphs/PlotType';
import PlotsContainer from '../../../../Graphs/PlotsContainer';
import GraphForm from './GraphForm';

interface Props {
    MapData: Map<string, DataType[]>,
    WindowDimensions: {
        width: number,
        height: number
    }
}

const COLORS = ["Blue", "Coral", "DodgerBlue", "SpringGreen", "YellowGreen", "Green", "OrangeRed", "Red", "GoldenRod", "HotPink", "CadetBlue", "SeaGreen", "Chocolate", "BlueViolet", "Firebrick"]

export const CustomGraphs = ({ MapData, WindowDimensions }: Props) => {
    const [Plots, setPlots] = useState<Plot[]>([]);


    //Handle new Data
    useEffect(() => {
        let newPlots: Plot[] = new Array(Plots.length);
        Plots.forEach((Plot, i) => {
            let newPlot: Plot = {
                PlotType: Plot.PlotType,
                MapData: MapData,
                Axis: Plot.Axis,
                Height: WindowDimensions.height,
                Width: WindowDimensions.width,
                Title: Plot.Title
            };
            newPlots[i] = newPlot;
        })
        setPlots(newPlots);
    }, [MapData, WindowDimensions]);


    const addPlot = (plotType: PlotType, xAxis: keyof DataType, yAxis: keyof DataType) => {
        let title: string;

        if (plotType === PlotType.Scatter) {
            title = `${xAxis.replaceAll("_", " ")} (X) vs ${yAxis.replaceAll("_", " ")} (Y)`

        } else {
            title = yAxis.replaceAll("_", " ")
        }

        if (plotType === PlotType.LineChart) {
            xAxis = "date";
        }

        let Plot: Plot = {
            PlotType: plotType,
            MapData: MapData,
            Axis: [xAxis, yAxis],
            Height: WindowDimensions.height,
            Width: WindowDimensions.width,
            Title: title
        };

        let newPlots: Plot[] = [Plot];

        setPlots(newPlots.concat(Plots))
    }


    return (
        <>
            <div style={{ display: 'flex', flexDirection: "column", alignItems: "center" }}>
                {
                    MapData.size === 0 ?
                        <Row md="auto" className="align-items-center">
                            <Col style={{ width: "500px" }}>
                                <ProgressBar animated now={100} />
                            </Col>
                        </Row>
                        :
                        <>

                            <GraphForm MapData={MapData} AddPlot={addPlot}></GraphForm>
                            <i className='note'>Note: that saved plots will be removed once you leave this page! </i>
                            <h3><br></br><br></br>Your Saved Plots</h3>
                            <PlotsContainer Plots={Plots} Colors={COLORS} />
                        </>
                }
            </div>
        </>
    );
}

export default CustomGraphs;
