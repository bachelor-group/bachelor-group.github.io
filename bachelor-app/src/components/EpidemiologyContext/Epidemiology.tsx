import { useEffect, useState } from 'react'
import { Col, ProgressBar, Row, } from 'react-bootstrap';
import { EpidemiologyData, EpidemiologyEnum } from '../DataContext/DataTypes';
import { LoadData} from '../DataContext/LoadData';
import LineChart from '../Graphs/LineChart';
import { Plot, PlotDataType, PlotType } from '../Graphs/PlotType';
import PlotsContainer from './PlotsContainer';


// TODO: Create a handleData that uses the string value so we can Send different data...

export const Epidemiology = () => {
    const [Plots, setPlots] = useState<Plot[]>(
        [{ PlotType: PlotType.Scatter, Data: [], Axis: [EpidemiologyEnum.new_confirmed, EpidemiologyEnum.date], Height: 300, Width: 600, Title: "New Cases" },
        { PlotType: PlotType.Scatter, Data: [], Axis: [EpidemiologyEnum.new_confirmed, EpidemiologyEnum.date], Height: 300, Width: 600, Title: "New Cases" },
        { PlotType: PlotType.Scatter, Data: [], Axis: [EpidemiologyEnum.new_confirmed, EpidemiologyEnum.date], Height: 300, Width: 600, Title: "New Cases" },
        ]);
    const [RequestedData, setRequestedData] = useState<string[]>(["new_confirmed", "date"]);
    const [Data, setData] = useState<EpidemiologyData[]>([]);


    // Update Data if new Data is requested
    useEffect(() => {
        LoadData().then((d: EpidemiologyData[]) => {
            setData(d);
        })
    }, [RequestedData]);

    //Handle new Data
    useEffect(() => {
        let newPlots: Plot[] = new Array(Plots.length);
        for (let i = 0; i < Plots.length; i++) {
            let PlotData: EpidemiologyData[] = []
            for (let j = 0; j < Data.length; j++) {
                //@ts-ignore
                PlotData.push({ [Plots[i].Axis[0]]: Data[j][Plots[i].Axis[0]], [Plots[i].Axis[1]]: Data[j][Plots[i].Axis[1]] })
            }
            newPlots[i] = { PlotType: PlotType.Scatter, Data: PlotData, Axis: [EpidemiologyEnum.new_confirmed, EpidemiologyEnum.date], Height: 300, Width: 600, Title: "New Cases" };
        }
        setPlots(newPlots);
        console.log(newPlots);
    }, [Data]);

    return (
        <div style={{ display: 'flex', justifyContent: 'center'}}>
            {
                Data.length === 0 ?
                    <Row  md="auto" className="align-items-center">
                        <Col style={{width: "500px"}}>
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