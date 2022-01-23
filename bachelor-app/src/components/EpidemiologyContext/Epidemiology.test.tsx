import { render, screen } from '@testing-library/react';
import { EpidemiologyData, EpidemiologyEnum } from '../DataContext/DataTypes';
import Epidemiology from './Epidemiology';

let data: EpidemiologyData[] = []

for (let i = 0; i < 100; i++) {
    data.push({ [EpidemiologyEnum.new_confirmed]: (i).toString(), [EpidemiologyEnum.date]: (i).toString(), [EpidemiologyEnum.location_key]: "Germany" })
}

let FakeLoader = () => {
    return new Promise<EpidemiologyData[]>((resolve) => {
        setTimeout(() => (resolve(data)), 1500)
    })
}


test('renders EpidemiologyPage and checks that correct plots are showing', async () => {
    render(<Epidemiology />);
    screen.getByRole("progressbar");
    let ScatterPlots = await screen.findAllByText("New Cases");
    screen.getByText("New Confirmed Cases In Norway")
    expect(ScatterPlots.length).toBe(3);
});