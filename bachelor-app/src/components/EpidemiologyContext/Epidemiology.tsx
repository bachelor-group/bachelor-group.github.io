import { useEffect, useState } from 'react'
import { Col, ProgressBar, Row, } from 'react-bootstrap';
import { EpidemiologyData, PlotDataType } from '../DataContext/DataTypes';
import { LoadData} from '../DataContext/LoadData';
import { Plot, PlotType } from '../Graphs/PlotType';
import PlotsContainer from './PlotsContainer';

interface EpidemiologyProps {

}

// TODO: Create a handleData that uses the string value so we can Send different data...

export const Epidemiology = ({ }: EpidemiologyProps) => {
    const [Plots, setPlots] = useState<Plot[]>(
        [{ PlotType: PlotType.Scatter, Data: [], Axis: ["new_confirmed", "date"], Height: 300, Width: 600, Title: "New Cases" },
        { PlotType: PlotType.Scatter, Data: [], Axis: ["new_confirmed", "date"], Height: 300, Width: 600, Title: "New Cases" },
        { PlotType: PlotType.Scatter, Data: [], Axis: ["cumulative_confirmed", "date"], Height: 300, Width: 600, Title: "New Cases" },
        { PlotType: PlotType.Scatter, Data: [], Axis: ["cumulative_confirmed", "date"], Height: 300, Width: 600, Title: "New Cases" },
        ]);
    const [RequestedData, setRequestedData] = useState<string[]>(["new_confirmed", "date", "cumulative_confirmed"]);
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
            let PlotData: PlotDataType[] = []
            for (let j = 0; j < Data.length; j++) {
                //@ts-ignore
                PlotData.push({ xaxis: Data[j][Plots[i].Axis[0]], yaxis: Data[j][Plots[i].Axis[1]] })
            }
            newPlots[i] = { PlotType: PlotType.Scatter, Data: PlotData, Axis: ["cumulative_confirmed", "date"], Height: 300, Width: 600, Title: "New Cases" };
        }
        setPlots(newPlots);
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