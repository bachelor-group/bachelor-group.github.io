import { useEffect, useState } from 'react'
import { Button, Form } from 'react-bootstrap'
import { hasKey } from '../../../../DataContext/DataTypes'
import { DataType } from '../../../../DataContext/MasterDataType'
import PlotsContainer from '../../../../Graphs/PlotsContainer'
import { Plot, PlotType } from '../../../../Graphs/PlotType'

interface GraphFormInterface {
    MapData: Map<string, DataType[]>,
    AddPlot: (plotType: PlotType, xAxis: keyof DataType, yAxis: keyof DataType) => void
}

export const GraphForm = ({ MapData, AddPlot }: GraphFormInterface) => {
    const [customPlotType, setCustomPlotType] = useState<PlotType>(PlotType.Scatter)
    const [customPlotYaxis, setCustomPlotYaxis] = useState<keyof DataType>("new_confirmed")
    const [customPlotXaxis, setCustomPlotXaxis] = useState<keyof DataType>("date")
    const [plot, setPlot] = useState<Plot[]>([]);
    const [objectWithAllProps, setObjectWithAllProps] = useState<DataType>({});

    useEffect(() => {
        let xAxis = customPlotXaxis;

        if (customPlotType === PlotType.LineChart) {
            xAxis = "date"
        }

        let curPlot: Plot = {
            PlotType: customPlotType,
            MapData: MapData,
            Axis: [xAxis, customPlotYaxis],
            Height: 300,
            Width: 600,
            Title: 'Preview'
        }
        setPlot([curPlot])
    }, [customPlotXaxis, customPlotYaxis, customPlotType, MapData]);

    useEffect(() => {
        let newObject: DataType = {}
        MapData.forEach((data) => {
            Object.keys(data[0]).forEach((key) => {
                if (hasKey<DataType>(data[0], key)) newObject[key] = "";
            })
        })
        setObjectWithAllProps(newObject);
    }, [MapData]);

    return (<>
        <fieldset>
            <Form.Group className="mb-3">
                <Form.Label htmlFor="plottypeSelect">Choose plot type: </Form.Label>
                <Form.Control id="plottypeSelect" as="select" onChange={e => {

                    setCustomPlotType(Number(e.target.value))
                }
                }>

                    {Object.keys(PlotType).filter((v) => isNaN(Number(v))).map((d, i) => (
                          <option key={i} disabled={d == "Lollipop"|| d == "BarRace" || d == "WordCloud" ? 
                          true : false} value={i}>{d}</option>
                    ))}

                </Form.Control>
            </Form.Group>

            <Form.Group className="mb-3">
                <Form.Label htmlFor="axisSelect">Choose plot y-axis: </Form.Label>
                <Form.Control as="select" id="axisSelect" onChange={e => {
                    if (hasKey<DataType>(objectWithAllProps, e.target.value)) {
                        setCustomPlotYaxis(e.target.value);
                    }
                }}>

                    {Object.keys(objectWithAllProps).splice(10).map((d, i) => (
                        <option key={i} value={d}>{d.replaceAll("_", " ")}</option>
                    ))}
                    {Object.keys(objectWithAllProps).length !== 0 ?
                        <option value="date">date</option>: <></>
                    }

                </Form.Control>
            </Form.Group>

            {customPlotType === PlotType.Scatter ? <>
                <Form.Group className="mb-3">
                    <Form.Label htmlFor="axisSelect">Choose plot x-axis: </Form.Label>
                    <Form.Control as="select" id="axisSelect" onChange={e => {
                        if (hasKey<DataType>(objectWithAllProps, e.target.value)) {
                            setCustomPlotXaxis(e.target.value);
                        }
                    }}>
                        <option value="date">date</option>
                        {Object.keys(objectWithAllProps).splice(10).map((d, i) => (
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
