import { fireEvent, logRoles, render, screen } from "@testing-library/react";
import { csv } from "d3";
import { useState } from "react";
import { unmountComponentAtNode } from "react-dom";
import { Tag } from "react-tag-autocomplete";
import { promises } from "stream";
import SelectCountry, { TagExtended } from "../CountrySelector/SelectCountry";
import { EpidemiologyData, EpidemiologyEnum } from "../DataContext/DataTypes";
import Epidemiology from "./Epidemiology";


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

let data: EpidemiologyData[] = []
for (let i = 0; i < 100; i++) {
    data.push({ [EpidemiologyEnum.new_confirmed]: (i).toString(), [EpidemiologyEnum.date]: (i).toString(), [EpidemiologyEnum.location_key]: "Germany" })
}

let FakeEpidemiologyData = () => {
    return new Promise<EpidemiologyData[]>((resolve) => {
        setTimeout(() => (resolve(data)), 1500)
    })
}

test('renders both selectcountry and epidemiology components', () => {
    render(<SelectCountry selectedCountries={() => []} LoadData={FakeData} />);
    render(<Epidemiology LoadData={FakeEpidemiologyData} />);
});


test('check if legend is updated', async () => {
    render(<SelectCountry selectedCountries={() => []} LoadData={FakeData} />);
    render(<Epidemiology LoadData={FakeEpidemiologyData} />);

    let input = await screen.findByPlaceholderText("Add country")
    input.focus()

    for (let i = 0; i < 4; i++) {
        const element = dummyCountries[i];
        let CountryToSelect = await screen.findByText(element.name)
        fireEvent.click(CountryToSelect)
    }
    input.blur()


    for (let i = 0; i < 6; i++) {
        await screen.findByText(dummyCountries[i].name)

    }
});