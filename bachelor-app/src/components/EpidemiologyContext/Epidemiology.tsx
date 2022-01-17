import { useEffect, useState } from 'react'
import { Col, ProgressBar, Row, } from 'react-bootstrap';
import { EpidemiologyData, EpidemiologyEnum } from '../DataContext/DataTypes';
import { LoadData } from '../DataContext/LoadData';
import { Plot, PlotType } from '../Graphs/PlotType';
import PlotsContainer from './PlotsContainer';


// TODO: Create a handleData that uses the string value so we can Send different data...

export const Epidemiology = () => {
    const [Plots, setPlots] = useState<Plot[]>(
        [
            { PlotType: PlotType.LineChart, Data: [], Axis: [EpidemiologyEnum.date, EpidemiologyEnum.new_confirmed], Height: 300, Width: 600, Title: "New Confirmed Cases In Norway" },
            { PlotType: PlotType.Scatter, Data: [], Axis: [EpidemiologyEnum.date, EpidemiologyEnum.new_confirmed], Height: 300, Width: 600, Title: "New Cases" },
            { PlotType: PlotType.Scatter, Data: [], Axis: [EpidemiologyEnum.date, EpidemiologyEnum.new_confirmed], Height: 300, Width: 600, Title: "New Cases" },
            { PlotType: PlotType.Scatter, Data: [], Axis: [EpidemiologyEnum.date, EpidemiologyEnum.new_confirmed], Height: 300, Width: 600, Title: "New Cases" },
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

            if (Plots[i].PlotType === PlotType.Scatter) {
                // Only get relevant data for current plot
                for (let j = 0; j < Data.length; j++) {
                    PlotData.push({ [Plots[i].Axis[0]]: Data[j][Plots[i].Axis[0]], [Plots[i].Axis[1]]: Data[j][Plots[i].Axis[1]] })
                }
                newPlots[i] = { PlotType: PlotType.Scatter, Data: PlotData, Axis: [EpidemiologyEnum.date, EpidemiologyEnum.new_confirmed], Height: 300, Width: 600, Title: "New Cases", GroupBy: EpidemiologyEnum.location_key };
            }
            else {
                newPlots[i] = { PlotType: PlotType.LineChart, Data: Data, Axis: [EpidemiologyEnum.date, EpidemiologyEnum.new_confirmed], Height: 300, Width: 600, Title: "New Confirmed Cases In Norway", GroupBy: EpidemiologyEnum.location_key };
            }
        }
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