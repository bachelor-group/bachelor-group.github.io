import { render, screen } from '@testing-library/react';
import { timeParse } from 'd3';
import { EpidemiologyData, EpidemiologyEnum } from '../DataContext/DataTypes';
import { Plot, PlotType } from './PlotType';
import { DataAccessor, Scale } from './Scaling';

let Data: EpidemiologyData[] = []

for (let i = 0; i < 101; i++) {
    Data.push({ [EpidemiologyEnum.new_confirmed]: (i).toString(), [EpidemiologyEnum.date]: "2000-01-0" + (i).toString(), [EpidemiologyEnum.location_key]: "Germany" })
}

let DateData: EpidemiologyData[] = []

for (let i = 1; i < 10; i++) {
    DateData.push({ [EpidemiologyEnum.new_confirmed]: (i).toString(), [EpidemiologyEnum.date]: "2000-01-0" + (i).toString(), [EpidemiologyEnum.location_key]: "Germany" })
}

let FakeLoader = () => {
    return new Promise<EpidemiologyData[]>((resolve) => {
        setTimeout(() => (resolve(Data)), 1500)
    })
}

// Removed after data structure update
// let PLOT: Plot = { PlotType: PlotType.LineChart, Data: Data, Axis: [EpidemiologyEnum.date, EpidemiologyEnum.new_confirmed], Height: 300, Width: 600, Title: "New Confirmed Cases In Norway", GroupBy: EpidemiologyEnum.location_key }


test('DataAccessor Non Dates', () => {
    let Accessor = DataAccessor(EpidemiologyEnum.new_confirmed);
    expect(Accessor(Data[0])).toBe(0)
    expect(Accessor(Data[1])).toBe(1)
    expect(Accessor(Data[45])).toBe(45)
});

// test('Data Accessor Date', () => {
//     let Accessor = DataAccessor(EpidemiologyEnum.date);
//     //expect(Accessor(data[0])).toBe(new Date("1999-12-31"))
//     expect(Accessor(DateData[0]).getYear()).toBe("2000-01-01T23:00");
// });

// Removed after data structure update
// test('Check if scaling is correct', async () => {
//     let Scaler = Scale(PLOT, 200, DataAccessor(PLOT.Axis[1]))
//     expect(Scaler(0)).toBe(0)
//     expect(Scaler(25)).toBe(50)
//     expect(Scaler(50)).toBe(100)
//     expect(Scaler(75)).toBe(150)
//     expect(Scaler(100)).toBe(200)
// });
