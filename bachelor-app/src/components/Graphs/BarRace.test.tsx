import { fireEvent, render, screen } from "@testing-library/react";
import { unmountComponentAtNode } from "react-dom";
import SelectCountry, { TagExtended } from "../CountrySelector/SelectCountry";
import { DataType } from "../DataContext/MasterDataType";
import BarRace from "./BarRace";
import { Plot, PlotType } from "./PlotType";




beforeEach(() => {
});

afterEach(() => {
});

let FAKEPLOT: Plot = { PlotType: PlotType.LineChart, Data: [{search_trends_abdominal_obesity: "1",date: "2020-01-01"}, {search_trends_abdominal_obesity: "2",date: "2020-01-02"}], Axis: ["date", "new_confirmed"], Height: 100, Width: 100, Title: "A Title" }

test('renders SelectCountry', () => {
  render(<BarRace Width={100} Height={100} Plot={FAKEPLOT}/>); 
});

