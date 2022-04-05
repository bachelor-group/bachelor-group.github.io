import { useEffect, useMemo, useState } from 'react'
import SelectCountry, { TagExtended } from '../CountrySelector/SelectCountry'
import { LoadData as _LoadData } from '../DataContext/LoadData';
import { DataType } from '../DataContext/MasterDataType';
import { Plot, PlotType } from '../Graphs/PlotType';
import PlotsContainer from '../EpidemiologyContext/PlotsContainer';
import { Row, Col, ProgressBar } from 'react-bootstrap';
import { hasKey, VaccinationEnum } from '../DataContext/VaccinationTypes';
import { FaWindowRestore } from 'react-icons/fa';

export interface VaccinationProps {
    LoadData?: typeof _LoadData
}

export const Vaccinations = ({ LoadData = _LoadData }: VaccinationProps) => {
    const [Countries, setCountries] = useState<TagExtended[]>([]);
    const [LoadedCountries, setLoadedCountries] = useState<TagExtended[]>([]);
    const [Data, setData] = useState<DataType[]>([]);
    const [Plots, setPlots] = useState<Plot[]>(
        [
            { PlotType: PlotType.LineChart, Data: [], Axis: [VaccinationEnum.date, VaccinationEnum.cumulative_vaccine_doses_administered], Height: 300, Width: 600, Title: "Cumulative Vaccination Doses Administered", GroupBy: VaccinationEnum.location_key },
            { PlotType: PlotType.LineChart, Data: [], Axis: [VaccinationEnum.date, VaccinationEnum.cumulative_persons_vaccinated], Height: 300, Width: 600, Title: "Cumulative Persons Vaccinated", GroupBy: VaccinationEnum.location_key },
            { PlotType: PlotType.LineChart, Data: [], Axis: [VaccinationEnum.date, VaccinationEnum.new_persons_vaccinated], Height: 300, Width: 600, Title: "New Persons Vaccinated", GroupBy: VaccinationEnum.location_key },
            { PlotType: PlotType.Scatter, Data: [], Axis: [VaccinationEnum.cumulative_persons_vaccinated, VaccinationEnum.new_persons_vaccinated], Height: 300, Width: 600, Title: "IDK" },
            // { PlotType: PlotType.Lollipop, Data: [], Axis: [VaccinationEnum.new_confirmed, VaccinationEnum.date], Height: 300, Width: 600, Title: "Lollipop" },
        ]);

    //get window size
    const [windowDimensions, setWindowDimensions] = useState({ width: window.innerWidth, height: window.innerHeight });
    useEffect(() => {
        window.addEventListener("resize", () => setWindowDimensions({ width: window.innerWidth, height: window.innerHeight }));
        return () => window.removeEventListener("resize", () => setWindowDimensions({ width: window.innerWidth, height: window.innerHeight }));
    }, []);


    useEffect(() => {
        _LoadData(Countries, LoadedCountries, Data).then((d: DataType[]) => {
            setData(d);

            setLoadedCountries(JSON.parse(JSON.stringify(Countries)));
        })
    }, [Countries]);


    //Handle new Data
    useEffect(() => {
        let newPlots: Plot[] = new Array(Plots.length);
        Plots.forEach((Plot, i) => {

            let xAxis = Plot.Axis[0];
            let yAxis = Plot.Axis[1];
            let newPlot: Plot;
            let PlotData: DataType[] = []

            for (let j = 0; j < Data.length; j++) {
                if (hasKey(Data[j], xAxis) && hasKey(Data[j], yAxis)) {
                    if (Plot.GroupBy !== undefined) {
                        PlotData.push({ [xAxis]: Data[j][xAxis], [yAxis]: Data[j][yAxis], [Plot.GroupBy]: Data[j][Plot.GroupBy] })
                    } else {
                        PlotData.push({ [xAxis]: Data[j][xAxis], [yAxis]: Data[j][yAxis] })
                    }
                }
            }

            newPlot = { PlotType: Plot.PlotType, Data: PlotData, Axis: Plot.Axis, Height: Plot.Height, Width: Plot.Width, Title: Plot.Title, GroupBy: Plot.GroupBy };
            newPlots[i] = newPlot;
        })
        setPlots(newPlots);
    }, [Data]);


    const selectedCountries = (countries: TagExtended[]) => {
        setCountries(countries)
    }

    return (
        <>
            <p>{windowDimensions.width} x {windowDimensions.height}</p>

            <SelectCountry selectedCountries={selectedCountries} />

            <div style={{ display: 'flex', flexDirection: "column", alignItems: "center" }}>
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
        </>
    )
}

export default Vaccinations