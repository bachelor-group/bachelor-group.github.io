import { useEffect, useState } from 'react'
import { Col, ProgressBar, Row, } from 'react-bootstrap';
import { EpidemiologyEnum } from '../../../../DataContext/DataTypes';
import { DataType } from '../../../../DataContext/MasterDataType';
import { Plot, PlotType } from '../../../../Graphs/PlotType';
import PlotsContainer from '../../../../Graphs/PlotsContainer';


interface Props {
    MapData: Map<string, DataType[]>,
    WindowDimensions: {
        width: number,
        height: number
    }
}

const COLORS = ["Blue", "Coral", "DodgerBlue", "SpringGreen", "YellowGreen", "Green", "OrangeRed", "Red", "GoldenRod", "HotPink", "CadetBlue", "SeaGreen", "Chocolate", "BlueViolet", "Firebrick"]

export const Epidemiology = ({ MapData, WindowDimensions }: Props) => {
    const [Plots, setPlots] = useState<Plot[]>(
        [
            { PlotType: PlotType.LineChart, MapData: MapData, Axis: [EpidemiologyEnum.date, EpidemiologyEnum.new_confirmed], Height: 300, Width: 600, Title: "New Confirmed Cases" },
            { PlotType: PlotType.LineChart, MapData: MapData, Axis: [EpidemiologyEnum.date, EpidemiologyEnum.new_tested], Height: 300, Width: 600, Title: "New Tested" },
            { PlotType: PlotType.LineChart, MapData: MapData, Axis: [EpidemiologyEnum.date, EpidemiologyEnum.new_deceased], Height: 300, Width: 600, Title: "New Deaths" },
            { PlotType: PlotType.Scatter, MapData: MapData, Axis: [EpidemiologyEnum.new_tested, EpidemiologyEnum.new_confirmed], Height: 300, Width: 600, Title: "Tested(X) vs Confirmed(Y)" },
            // { PlotType: PlotType.Lollipop, Data: [], Axis: [EpidemiologyEnum.new_confirmed, EpidemiologyEnum.date], Height: 300, Width: 600, Title: "Lollipop" },
        ]);


    // TODO: same useEffect used several places, e.g. Vaccinations.tsx
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

    return (
        <>
            <div id='main'>
                {
                    MapData.size === 0 ?
                        <Row md="auto" className="align-items-center">
                            <Col style={{ width: "500px" }}>
                                <ProgressBar animated now={100} />
                            </Col>
                        </Row>
                        :
                        <PlotsContainer Plots={Plots} Colors={COLORS} />
                }
            </div>
        </>
    );
}

export default Epidemiology;