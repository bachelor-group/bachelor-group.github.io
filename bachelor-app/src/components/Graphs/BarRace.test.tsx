import { fireEvent, render, screen } from "@testing-library/react";
import { unmountComponentAtNode } from "react-dom";
import { setTimeout } from "timers/promises";
import SelectCountry, { TagExtended } from "../CountrySelector/SelectCountry";
import { DataType } from "../DataContext/MasterDataType";
import BarRace from "./BarRace";
import { Plot, PlotType } from "./PlotType";


beforeEach(() => {
});

afterEach(() => {
});

// Removed after Data is in Map Structure
// let FAKEPLOT: Plot = { PlotType: PlotType.LineChart, Data: [{ search_trends_abdominal_obesity: "1", date: "2020-01-01" }, { search_trends_abdominal_obesity: "2", date: "2020-01-02" }], Axis: ["date", "new_confirmed"], Height: 100, Width: 100, Title: "A Title" }

// test('render BarRace Component', () => {
//   render(<BarRace Width={100} Height={100} Plot={FAKEPLOT} />);
// });


// let FakeData: Plot = {
//   PlotType: PlotType.LineChart, Data:
//     [
//       { search_trends_abdominal_obesity: "1", date: "2020-01-01" },
//       { search_trends_abdominal_obesity: "2", date: "2020-01-02" },
//       { search_trends_abdominal_obesity: "2", date: "2020-01-02" },
//       { date: "2020-01-02" },
//       { search_trends_abdominal_obesity: "3", date: "2020-01-03" },
//     ],
//   Axis: ["date", "new_confirmed"], Height: 100, Width: 100, Title: "A Title"
// }


test('If all data from a date is undefined we expect to stop pushing to List with data', async () => {
  // render(<BarRace Width={100} Height={100} Plot={FAKEPLOT} />);
  // //See that bar was still rendered
  // await screen.findByText("abdominal obesity")
  // await screen.findByText("1.00")
  
  // let startButton = await screen.findByText("Start me")
  // // let barInput = await screen.findByLabelText("Number of Bars:")
  // let barInput = screen.getByLabelText("bars-input") as HTMLInputElement
  // fireEvent.change(barInput, {target: {value: "1"}})
  // await setTimeout(800, {})
  // fireEvent.click(startButton)
  // await setTimeout(1000, {})
  // fireEvent.click(startButton)
  // await setTimeout(2000, {})
  
  // screen.getByText("abdominal obesity")
  
  // await screen.findByText("2.00")
});