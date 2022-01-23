import { render, screen } from '@testing-library/react';
import { EpidemiologyData, EpidemiologyEnum } from '../DataContext/DataTypes';
import Lollipop from './Lollipop';
import { Plot, PlotType } from './PlotType';

let data: EpidemiologyData[] = []

for (let i = 0; i < 100; i++) {
    data.push({ [EpidemiologyEnum.new_confirmed]: (i).toString(), [EpidemiologyEnum.date]: (i).toString(), [EpidemiologyEnum.location_key]: "Germany" })
}

let FAKEPLOT: Plot = { PlotType: PlotType.Lollipop, Data: [], Axis: [], Height: 100, Width: 100, Title: "A Title" }

let FakeLoader = () => {
    return new Promise<EpidemiologyData[]>((resolve) => {
        setTimeout(() => (resolve(data)), 1500)
    })
}


it('renders EpidemiologyPage and checks that correct plots are showing', async () => {
    render(<Lollipop Width={FAKEPLOT.Width} Height={FAKEPLOT.Height} Plot={FAKEPLOT} />);
    await screen.findAllByText(FAKEPLOT.Title);
});