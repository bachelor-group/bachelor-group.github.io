import { FormEventHandler, useEffect, useState } from 'react'
import { Button, Col, Form, ProgressBar, Row, } from 'react-bootstrap';
import { EpidemiologyEnum, hasKey } from '../DataContext/DataTypes';
import SelectCountry, { TagExtended } from '../CountrySelector/SelectCountry';
import { LoadData as _LoadData } from '../DataContext/LoadData';
import { DataType } from '../DataContext/MasterDataType';
import { Plot, PlotType } from '../Graphs/PlotType';
import PlotsContainer from './PlotsContainer';
import { setDefaultResultOrder } from 'dns/promises';


interface Props {
    LoadData?: typeof _LoadData,
    Data: DataType[],
    WindowDimensions: {
        width: number,
        height: number
    }
}

let TEST = 0;

export const Epidemiology = ({ LoadData = _LoadData, Data, WindowDimensions }: Props) => {
    const [customPlotType, setCustomPlotType] = useState<string>("Scatter")
    const [customPlotYaxis, setCustomPlotYaxis] = useState<string>("new_confirmed")
    const [customPlotXaxis, setCustomPlotXaxis] = useState<string>("date")
    const [Redraw, setRedraw] = useState<number>(0)
    const [Plots, setPlots] = useState<Plot[]>(
        [
            // { PlotType: PlotType.LineChart, Data: [], Axis: [EpidemiologyEnum.date, EpidemiologyEnum.new_confirmed], Height: 300, Width: 600, Title: "New Confirmed Cases", GroupBy: EpidemiologyEnum.location_key },
            // { PlotType: PlotType.LineChart, Data: [], Axis: [EpidemiologyEnum.date, EpidemiologyEnum.new_tested], Height: 300, Width: 600, Title: "New Tested", GroupBy: EpidemiologyEnum.location_key },
            // { PlotType: PlotType.LineChart, Data: [], Axis: [EpidemiologyEnum.date, EpidemiologyEnum.new_deceased], Height: 300, Width: 600, Title: "New Deaths", GroupBy: EpidemiologyEnum.location_key },
            // { PlotType: PlotType.Scatter, Data: [], Axis: [EpidemiologyEnum.new_tested, EpidemiologyEnum.new_confirmed], Height: 300, Width: 600, Title: "Tested(X) vs Confirmed(Y)" },
            // { PlotType: PlotType.Lollipop, Data: [], Axis: [EpidemiologyEnum.new_confirmed, EpidemiologyEnum.date], Height: 300, Width: 600, Title: "Lollipop" },
        ]);


    //Handle new Data
    useEffect(() => {
        console.log("handle new data")
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
                        console.log("check")
                        PlotData.push({ [xAxis]: Data[j][xAxis], [yAxis]: Data[j][yAxis] })
                    }
                }
            }

            newPlot = { PlotType: Plot.PlotType, Data: PlotData, Axis: Plot.Axis, Height: WindowDimensions.height, Width: WindowDimensions.width, Title: Plot.Title, GroupBy: Plot.GroupBy };
            newPlots[i] = newPlot;
        })
        setPlots(newPlots);
    }, [Data, WindowDimensions, Redraw]);


    const addPlot = () => {
        TEST++
        
        Plots.push(
            // { PlotType: PlotType.LineChart, Data: [], Axis: [customPlotXaxis as unknown as keyof DataType, customPlotYaxis as unknown as keyof DataType], Height: WindowDimensions.height, Width: WindowDimensions.width, Title: customPlotYaxis.replaceAll("_", " "), GroupBy: EpidemiologyEnum.location_key }
            { PlotType: customPlotType as unknown as PlotType, Data: [], Axis: [customPlotXaxis as unknown as keyof DataType, customPlotYaxis as unknown as keyof DataType], Height: WindowDimensions.height, Width: WindowDimensions.width, Title: customPlotYaxis.replaceAll("_", " "), GroupBy: EpidemiologyEnum.location_key }
        )
        setRedraw(TEST)
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
                            <fieldset>
                                <Form.Group className="mb-3">
                                    <Form.Label htmlFor="plottypeSelect">Choose plot type: </Form.Label>
                                    <Form.Control id="plottypeSelect" as="select" onChange={(e => setCustomPlotType(e.target.value))}>
                                        {Object.keys(PlotType).splice(5).map((d, i) => (
                                            <option key={i} value={d}>{d}</option>
                                        ))}
                                    </Form.Control>
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label htmlFor="axisSelect">Choose plot y-axis: </Form.Label>
                                    <Form.Control as="select" id="axisSelect" onChange={(e => setCustomPlotYaxis(e.target.value))}>
                                        {Object.keys(Data[0]).splice(10).map((d, i) => (
                                            <option key={i} value={d}>{d.replaceAll("_", " ")}</option>
                                        ))}
                                        <option>date</option>
                                    </Form.Control>
                                </Form.Group>

                                {customPlotType === "Scatter" ? <>
                                    <Form.Group className="mb-3">
                                        <Form.Label htmlFor="plottypeSelect">Choose plot x-axis: </Form.Label>
                                        <Form.Control id="plottypeSelect" as="select" onChange={(e => setCustomPlotXaxis(e.target.value))}>
                                            <option>date</option>
                                            {Object.keys(Data[0]).splice(10).map((d, i) => (
                                                <option key={i} value={d}>{d.replaceAll("_", " ")}</option>
                                            ))}
                                        </Form.Control>
                                    </Form.Group>

                                </> : <></>}


                                <Button type="submit" onClick={addPlot}>Add Plot</Button>
                            </fieldset>


                            < PlotsContainer Plots={Plots} />
                        </>
                }
            </div>
        </>
    );
}

export default Epidemiology;