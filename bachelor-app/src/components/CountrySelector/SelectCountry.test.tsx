import { logRoles, render, screen } from "@testing-library/react";
import { csv } from "d3";
import { useState } from "react";
import { unmountComponentAtNode } from "react-dom";
import { Tag } from "react-tag-autocomplete";
import SelectCountry, { TagExtended } from "./SelectCountry";

const TIMEOUT_LONG = 6000
const TIMEOUT_MEDIUM = 3000
const TIMEOUT_SHORT = 100


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

const countries = [
    { id: 0, name: 'Andorra', location_key: 'AD' },
    { id: 1, name: 'United Arab Emirates', location_key: 'AE' },
    { id: 2, name: 'Afghanistan', location_key: 'AF' },
    { id: 3, name: 'Antigua and Barbuda', location_key: 'AG' },
    { id: 4, name: 'Anguilla', location_key: 'AI' },
    { id: 5, name: 'Albania', location_key: 'AL' },
    { id: 6, name: 'Armenia', location_key: 'AM' },
    { id: 7, name: 'Netherlands Antilles', location_key: 'AN' },
    { id: 8, name: 'Angola', location_key: 'AO' },
    { id: 9, name: 'Antarctica', location_key: 'AQ' },
    { id: 10, name: 'Argentina', location_key: 'AR' },
    { id: 11, name: 'American Samoa', location_key: 'AS' },
    { id: 12, name: 'Austria', location_key: 'AT' },
    { id: 13, name: 'Australia', location_key: 'AU' },
    { id: 14, name: 'Aruba', location_key: 'AW' }
]

test('renders SelectCountry check first 6 countries match', async () => {
    render(<SelectCountry selectedCountries={() => [countries]} />);
    let input = await screen.findAllByPlaceholderText("Add country")
    // const reactTags = await screen.findByTestId("tag")
    input[0].focus()
    // for (let i = 0; i < 7; i++) {
    //     await screen.findByText(countries[i].name)
    // }
    // await screen.findByText("Andorra")
    // const suggestions = await screen.findByText("Andorra")

    logRoles(input[0])
    // logRoles(suggestions)

    // expect(legendList).toBe(1);
    // expect(container!.textContent).toBe("AD");
    // let ScatterPlots = await screen.findAllByText("New Cases");
    // screen.getByText("New Confirmed Cases In Norway")
    // expect(ScatterPlots.length).toBe(3);
});

test('renders SelectCountry', async () => {
    render(<SelectCountry selectedCountries={() => [countries]} />);
});