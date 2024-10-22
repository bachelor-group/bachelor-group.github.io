// LineChart.test.js

import React from "react";
import { jest } from '@jest/globals';
import { render, unmountComponentAtNode } from "react-dom";
import { act } from "react-dom/test-utils";
import LineChart from "./LineChart";
import { Plot, PlotType } from "./PlotType";
import { EpidemiologyData, EpidemiologyEnum } from "../DataContext/DataTypes";

let container: HTMLDivElement | null = null;
beforeEach(() => {
  // setup a DOM element as a render target
  container = document.createElement("div");
  document.body.appendChild(container);
});

afterEach(() => {
  // cleanup on exiting
  if (container) {
    unmountComponentAtNode(container);
    container.remove();
    container = null;
  }
});

it("renders with or without a name", () => {

  // Removed after data structure update
  // let FAKEPLOT: Plot = { PlotType: PlotType.LineChart, Data: [{date: "2020-01-01",new_confirmed: "50"}], Axis: ["date", "new_confirmed"], Height: 100, Width: 100, Title: "A Title" }
  // act(() => {
  //   render(<LineChart Width={100} Height={100} Plot={FAKEPLOT} Data={FAKEPLOT.Data} />, container);
  // });
  // expect(container!.textContent?.trimEnd()).toBe(FAKEPLOT.Title);

  // act(() => {
  //   render(<Hello name="Jenny" />, container);
  // });
  // expect(container!.textContent).toBe("Hello, Jenny!");

  // act(() => {
  //   render(<Hello name="Margaret" />, container);
  // });
  // expect(container!.textContent).toBe("Hello, Margaret!");
});
