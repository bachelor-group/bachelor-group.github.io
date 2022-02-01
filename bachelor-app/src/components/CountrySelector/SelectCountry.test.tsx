import { fireEvent, logRoles, render, screen } from "@testing-library/react";
import { csv } from "d3";
import { useState } from "react";
import { unmountComponentAtNode } from "react-dom";
import { Tag } from "react-tag-autocomplete";
import { promises } from "stream";
import SelectCountry, { TagExtended } from "./SelectCountry";

const TIMEOUT_LONG = 6000
const TIMEOUT_MEDIUM = 3000
const TIMEOUT_SHORT = 100


let dummyCountries: TagExtended[] = []
let container: HTMLDivElement | null = null;
beforeEach(() => {
  // setup a DOM element as a render target
  container = document.createElement("div");
  document.body.appendChild(container);
  dummyCountries = []
});

afterEach(() => {
  // cleanup on exiting
  if (container) {
    unmountComponentAtNode(container);
    container.remove();
    container = null;
  }
});


let FakeData = () => {
  return new Promise<TagExtended[]>((resolve) => {
    for (let i = 0; i < 9; i++) {
      dummyCountries.push({ id: i, name: 'Country' + i, location_key: 'C' + i })
    }
    setTimeout(() => (resolve(dummyCountries)), 1)
  })
}

test('renders SelectCountry', () => {
  render(<SelectCountry selectedCountries={() => []} LoadData={FakeData} />);
});


test('renders SelectCountry check first 6 countries match', async () => {
  render(<SelectCountry selectedCountries={() => []} LoadData={FakeData} />);
  let input = await screen.findByPlaceholderText("Add country")
  input.focus()

  for (let i = 0; i < 6; i++) {
    await screen.findByText(dummyCountries[i].name)

  }
});

test('render selectcountry and makes sure only 6 suggestions are displayed', async () => {
  render(<SelectCountry selectedCountries={() => ([])} LoadData={FakeData} />);
  let input = await screen.findAllByPlaceholderText("Add country")
  input[0].focus()

  expect(screen.queryByText(dummyCountries[7].name)).toBeNull()
});


test.each`
NumberOfCountriesToSelect
${1}
${2}
${3}
${4}
${5}
${6}
${7}
${8}
`('checks that selected countries are correct, number of selected countries: $NumberOfCountriesToSelect', async ({ NumberOfCountriesToSelect }) => {
  render(<SelectCountry selectedCountries={() => ([])} LoadData={FakeData} />);
  let input = await screen.findByPlaceholderText("Add country")
  input.focus()

  for (let i = 0; i < NumberOfCountriesToSelect; i++) {
    const element = dummyCountries[i];
    let CountryToSelect = await screen.findByText(element.name)
    fireEvent.click(CountryToSelect)
  }
  input.blur()

  //Expect selected tags to be present
  for (let i = 0; i < NumberOfCountriesToSelect; i++) {
    await screen.findByText(dummyCountries[i].name)
  }

  // Next non selected country should not be there
  expect(screen.queryByText(dummyCountries[NumberOfCountriesToSelect].name)).toBeNull()

  input.focus()

  //Now Selected and 6 non-selected countries should be there
  //Expect selected tags to be present
  for (let i = 0; i < (NumberOfCountriesToSelect + 6 < dummyCountries.length ? NumberOfCountriesToSelect + 6 : dummyCountries.length); i++) {
    await screen.findByText(dummyCountries[i].name)
  }
});