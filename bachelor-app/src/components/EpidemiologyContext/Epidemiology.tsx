import { useEffect, useState } from 'react'
import { Col, ProgressBar, Row, } from 'react-bootstrap';
import { EpidemiologyEnum, hasKey } from '../DataContext/DataTypes';
import SelectCountry, { TagExtended } from '../CountrySelector/SelectCountry';
import { LoadData as _LoadData } from '../DataContext/LoadData';
import { DataType } from '../DataContext/MasterDataType';
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
            { PlotType: PlotType.LineChart, Data: [], Axis: [EpidemiologyEnum.date, EpidemiologyEnum.new_tested], Height: 300, Width: 600, Title: "New Tested In", GroupBy: EpidemiologyEnum.location_key },
            { PlotType: PlotType.LineChart, Data: [], Axis: [EpidemiologyEnum.date, EpidemiologyEnum.new_deceased], Height: 300, Width: 600, Title: "New Deaths In", GroupBy: EpidemiologyEnum.location_key },
            { PlotType: PlotType.Scatter, Data: [], Axis: [EpidemiologyEnum.new_tested, EpidemiologyEnum.new_confirmed], Height: 300, Width: 600, Title: "Tested(X) vs Confirmed(Y)" },
            { PlotType: PlotType.Lollipop, Data: [], Axis: [EpidemiologyEnum.new_confirmed, EpidemiologyEnum.date], Height: 300, Width: 600, Title: "Lollipop" },
        ]);
    const [Data, setData] = useState<DataType[]>([]);
    const [LoadedCountries, setLoadedCountries] = useState<TagExtended[]>([]);
    const [Countries, setCountries] = useState<TagExtended[]>([]);


    // Update Data if new Data is requested
    useEffect(() => {
        _LoadData(Countries, LoadedCountries, Data).then((d: DataType[]) => {
            setData(d);

            // ensure deep copy
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
                //TODO: Two different ways of doing this, See in !== undefined
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
    };

    return (
        <>
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
    );
}

export default Epidemiology;