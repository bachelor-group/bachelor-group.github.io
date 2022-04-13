import { useEffect, useState } from 'react'
import { Button, Form } from 'react-bootstrap'
import { hasKey } from '../DataContext/DataTypes'
import { DataType } from '../DataContext/MasterDataType'
import PlotsContainer from '../EpidemiologyContext/PlotsContainer'
import { Plot, PlotType } from '../Graphs/PlotType'

interface GraphFormInterface {
    Data: DataType[]
    AddPlot: (plotType: PlotType, xAxis: keyof DataType, yAxis: keyof DataType) => void
}

export const GraphForm = ({ Data, AddPlot }: GraphFormInterface) => {
    const [customPlotType, setCustomPlotType] = useState<PlotType>(PlotType.Scatter)
    const [customPlotYaxis, setCustomPlotYaxis] = useState<keyof DataType>("new_confirmed")
    const [customPlotXaxis, setCustomPlotXaxis] = useState<keyof DataType>("date")
    const [plot, setPlot] = useState<Plot[]>([]);

    useEffect(() => {
        let xAxis = customPlotXaxis;

        if (customPlotType === PlotType.LineChart) xAxis = "date"


        let curPlot: Plot = {
            PlotType: customPlotType,
            Data: Data,
            Axis: [xAxis, customPlotYaxis],
            Height: 300,
            Width: 600,
            Title: 'Preview'
        }
        setPlot([curPlot])
    }, [customPlotXaxis, customPlotYaxis, customPlotType])

    return (<>
        <fieldset>
            <Form.Group className="mb-3">
                <Form.Label htmlFor="plottypeSelect">Choose plot type: </Form.Label>
                {/* <Form.Control id="plottypeSelect" as="select" onChange={(e => setCustomPlotType(e.target.value))}> */}
                <Form.Control id="plottypeSelect" as="select" onChange={e => {

                    let fuckYou: PlotType = Number(e.target.value);
                    console.log(fuckYou)
                    setCustomPlotType(Number(e.target.value))
                }
                }>


                    {Object.keys(PlotType).filter((v) => isNaN(Number(v))).map((d, i) => (
                        <option key={i} value={i}>{d}</option>
                    ))}

                    {/* {Object.keys(PlotType).splice(5).map((d, i) => (
                        <option key={i} value={d}>{d}</option>
                    ))} */}
                </Form.Control>
            </Form.Group>

            <Form.Group className="mb-3">
                <Form.Label htmlFor="axisSelect">Choose plot y-axis: </Form.Label>
                <Form.Control as="select" id="axisSelect" onChange={e => {
                    if (hasKey<DataType>(Data[0], e.target.value)) {
                        setCustomPlotYaxis(e.target.value);
                    }
                }}>

                    {Object.keys(Data[0]).splice(10).map((d, i) => (
                        <option key={i} value={d}>{d.replaceAll("_", " ")}</option>
                    ))}
                    <option value="date">date</option>

                </Form.Control>
            </Form.Group>

            {customPlotType === PlotType.Scatter ? <>
                <Form.Group className="mb-3">
                    <Form.Label htmlFor="axisSelect">Choose plot x-axis: </Form.Label>
                    <Form.Control as="select" id="axisSelect" onChange={e => {
                        if (hasKey<DataType>(Data[0], e.target.value)) {
                            setCustomPlotXaxis(e.target.value);
                        }
                    }}>
                        <option value="date">date</option>
                        {Object.keys(Data[0]).splice(10).map((d, i) => (
                            <option key={i} value={d}>{d.replaceAll("_", " ")}</option>
                        ))}
                    </Form.Control>
                </Form.Group>

            </> : <></>}


            <Button type="submit" onClick={() => AddPlot(customPlotType, customPlotXaxis, customPlotYaxis)}>Save Plot</Button>
        </fieldset>

        <PlotsContainer Plots={plot} />
    </>)
}

export default GraphForm