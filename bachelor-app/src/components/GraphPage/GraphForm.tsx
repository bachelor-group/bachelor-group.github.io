import { useState } from 'react'
import { Button, Form } from 'react-bootstrap'
import { DataType } from '../DataContext/MasterDataType'
import { PlotType } from '../Graphs/PlotType'

interface GraphFormInterface {
    Data: DataType
    AddPlot: (plotType: PlotType, xAxis: keyof DataType, yAxis: keyof DataType) => void
}

export const GraphForm = ({ Data, AddPlot }: GraphFormInterface) => {
    const [customPlotType, setCustomPlotType] = useState<string>("Scatter")
    const [customPlotYaxis, setCustomPlotYaxis] = useState<string>("new_confirmed")
    const [customPlotXaxis, setCustomPlotXaxis] = useState<string>("date")


    return (
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
                    {Object.keys(Data).splice(10).map((d, i) => (
                        <option key={i} value={d}>{d.replaceAll("_", " ")}</option>
                    ))}
                    <option value="date">date</option>
                </Form.Control>
            </Form.Group>

            {customPlotType === "Scatter" ? <>
                <Form.Group className="mb-3">
                    <Form.Label htmlFor="axisSelect">Choose plot x-axis: </Form.Label>
                    <Form.Control as="select" id="axisSelect" onChange={(e => setCustomPlotXaxis(e.target.value))}>
                        <option value="date">date</option>
                        {Object.keys(Data).splice(10).map((d, i) => (
                            <option key={i} value={d}>{d.replaceAll("_", " ")}</option>
                        ))}
                    </Form.Control>
                </Form.Group>

            </> : <></>}


            <Button type="submit" onClick={() => AddPlot(PlotType[customPlotType as keyof typeof PlotType], customPlotXaxis as unknown as keyof DataType, customPlotYaxis as unknown as keyof DataType)}>Add Plot</Button>
        </fieldset>
    )
}

export default GraphForm