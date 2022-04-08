import { FormEventHandler, useEffect, useState } from 'react'
import { Button, Col, Form, ProgressBar, Row, } from 'react-bootstrap';
import { EpidemiologyEnum, hasKey } from '../DataContext/DataTypes';
import SelectCountry, { TagExtended } from '../CountrySelector/SelectCountry';
import { LoadData as _LoadData } from '../DataContext/LoadData';
import { DataType } from '../DataContext/MasterDataType';
import { Plot, PlotType } from '../Graphs/PlotType';
import PlotsContainer from './PlotsContainer';
import { setDefaultResultOrder } from 'dns/promises';
import CustomPlots from '../CustomPlots/CustomPlots';


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


    const addPlot = (plotType: PlotType, xAxis: keyof DataType, yAxis: keyof DataType) => {
        TEST++
        
        Plots.push(
            { PlotType: plotType, Data: [], Axis: [xAxis, yAxis], Height: WindowDimensions.height, Width: WindowDimensions.width, Title: yAxis.replaceAll("_", " "), GroupBy: EpidemiologyEnum.location_key }
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

                            <CustomPlots Data={Data[0]} AddPlot={addPlot}></CustomPlots>

                            <PlotsContainer Plots={Plots} />
                        </>
                }
            </div>
        </>
    );
}

export default Epidemiology;