import { logRoles, render, screen } from "@testing-library/react";
import { csv } from "d3";
import { useState } from "react";
import { unmountComponentAtNode } from "react-dom";
import { Tag } from "react-tag-autocomplete";
import { promises } from "stream";
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


const dummyCountries: TagExtended[] = []

let FakeData = () => {
  return new Promise<TagExtended[]>((resolve) => {
    for (let i = 0; i < 9; i++) {
      dummyCountries.push({id: i, name: 'Country'+i, location_key: 'C'+i})
    }
    setTimeout(() => (resolve(dummyCountries)), 1)
  })
}

test('renders SelectCountry', () => {
  render(<SelectCountry selectedCountries={() => []} LoadData={FakeData} />);
});


test('renders SelectCountry check first 6 countries match', async () => {
  render(<SelectCountry selectedCountries={() => []} LoadData={FakeData} />);
  let input = await screen.findAllByPlaceholderText("Add country")
  input[0].focus()

  for (let i = 0; i < 6; i++) {
    await screen.findByText(dummyCountries[i].name)

  }
});

test('render selectcountry and makes sure only 6 suggestions are displayed', async () => {
  render(<SelectCountry selectedCountries={() => dummyCountries} LoadData={FakeData} />);
  let input = await screen.findAllByPlaceholderText("Add country")
  input[0].focus()

  expect(screen.queryByText(dummyCountries[7].name)).toBeNull()
});