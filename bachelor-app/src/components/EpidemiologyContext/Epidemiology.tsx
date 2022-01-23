import { useEffect, useState } from 'react'
import { Col, ProgressBar, Row, } from 'react-bootstrap';
import { EpidemiologyData, EpidemiologyEnum } from '../DataContext/DataTypes';
import { LoadData as _LoadData } from '../DataContext/LoadData';
import { Plot, PlotType } from '../Graphs/PlotType';
import PlotsContainer from './PlotsContainer';


// TODO: Create a handleData that uses the string value so we can Send different data...
interface Props {
    LoadData?: typeof _LoadData
}

export const Epidemiology = ({ LoadData = _LoadData }: Props) => {
    const [Plots, setPlots] = useState<Plot[]>(
        [
            { PlotType: PlotType.LineChart, Data: [], Axis: [EpidemiologyEnum.date, EpidemiologyEnum.new_confirmed], Height: 300, Width: 600, Title: "New Confirmed Cases In Norway", GroupBy: EpidemiologyEnum.location_key },
            { PlotType: PlotType.Scatter, Data: [], Axis: [EpidemiologyEnum.date, EpidemiologyEnum.new_confirmed], Height: 300, Width: 600, Title: "New Cases" },
            { PlotType: PlotType.Scatter, Data: [], Axis: [EpidemiologyEnum.date, EpidemiologyEnum.new_confirmed], Height: 300, Width: 600, Title: "New Cases" },
            { PlotType: PlotType.Scatter, Data: [], Axis: [EpidemiologyEnum.date, EpidemiologyEnum.new_confirmed], Height: 300, Width: 600, Title: "New Cases" },
            { PlotType: PlotType.Lollipop, Data: [], Axis: [EpidemiologyEnum.new_confirmed, EpidemiologyEnum.date], Height: 300, Width: 600, Title: "Lollipop" },
        ]);
    const [RequestedData, setRequestedData] = useState<string[]>(["new_confirmed", "date"]);
    const [Data, setData] = useState<EpidemiologyData[]>([]);


    // Update Data if new Data is requested
    useEffect(() => {
        _LoadData().then((d: EpidemiologyData[]) => {
            setData(d);
        })
    }, [RequestedData]);

    //Handle new Data
    useEffect(() => {
        let newPlots: Plot[] = new Array(Plots.length);
        Plots.forEach((Plot, i) => {

            let xAxis: EpidemiologyEnum = Plot.Axis[0];
            let yAxis: EpidemiologyEnum = Plot.Axis[1];
            let newPlot: Plot;
            let PlotData: EpidemiologyData[] = []

            for (let j = 0; j < Data.length; j++) {
                if (Plot.GroupBy !== undefined) {
                    PlotData.push({ [xAxis]: Data[j][xAxis], [yAxis]: Data[j][yAxis], [Plot.GroupBy]: Data[j][Plot.GroupBy] })
                } else {
                    PlotData.push({ [xAxis]: Data[j][xAxis], [yAxis]: Data[j][yAxis] })
                }
            }

            newPlot = { PlotType: Plot.PlotType, Data: PlotData, Axis: Plot.Axis, Height: Plot.Height, Width: Plot.Width, Title: Plot.Title, GroupBy: Plot.GroupBy };
            newPlots[i] = newPlot;
        })
        setPlots(newPlots);
    }, [Data]);

    return (
        <div style={{ display: 'flex', justifyContent: 'center' }}>
            {
                Data.length === 0 ?
                    <Row md="auto" className="align-items-center">
                        <Col style={{ width: "500px" }}>
                            <ProgressBar animated now={100} />
                        </Col>
                    </Row>
                    :
                    < PlotsContainer Plots={Plots} />
            }
        </div>
    );
}

export default Epidemiology;