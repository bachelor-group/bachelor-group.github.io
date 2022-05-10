import { useEffect, useState } from 'react';
import { Col, ProgressBar, Row } from 'react-bootstrap';
import { DataType } from '../../../../DataContext/MasterDataType';
import { VaccinationEnum } from '../../../../DataContext/VaccinationTypes';
import PlotsContainer from '../../../../Graphs/PlotsContainer';
import { Plot, PlotType } from '../../../../Graphs/PlotType';

export interface VaccinationProps {
    MapData: Map<string, DataType[]>,
    WindowDimensions: {
        width: number,
        height: number
    }
}

export const Vaccinations = ({ MapData, WindowDimensions }: VaccinationProps) => {
    const [Plots, setPlots] = useState<Plot[]>(
        [
            { PlotType: PlotType.LineChart, MapData: MapData, Axis: [VaccinationEnum.date, VaccinationEnum.cumulative_vaccine_doses_administered], Height: 300, Width: 600, Title: "Cumulative Vaccination Doses Administered" },
            { PlotType: PlotType.LineChart, MapData: MapData, Axis: [VaccinationEnum.date, VaccinationEnum.cumulative_persons_vaccinated], Height: 300, Width: 600, Title: "Cumulative Persons Vaccinated" },
            { PlotType: PlotType.LineChart, MapData: MapData, Axis: [VaccinationEnum.date, VaccinationEnum.new_persons_vaccinated], Height: 300, Width: 600, Title: "New Persons Vaccinated" },
            { PlotType: PlotType.Scatter, MapData: MapData, Axis: [VaccinationEnum.cumulative_persons_vaccinated, VaccinationEnum.new_persons_vaccinated], Height: 300, Width: 600, Title: "IDK" },
            // { PlotType: PlotType.Lollipop, Data: [], Axis: [VaccinationEnum.new_confirmed, VaccinationEnum.date], Height: 300, Width: 600, Title: "Lollipop" },
        ]);


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
            <div style={{ display: 'flex', flexDirection: "column", alignItems: "center" }}>
                {
                    MapData.size === 0 ?
                        <Row md="auto" className="align-items-center">
                            <Col style={{ width: "500px" }}>
                                <ProgressBar animated now={100} />
                            </Col>
                        </Row>
                        :
                        <PlotsContainer Plots={Plots} />
                }
            </div>
        </>
    )
}

export default Vaccinations;
