// TODO: Fix interface, maybe remove all "?"
export interface EpidemiologyData {
    cumulative_confirmed?: string,
    cumulative_deceased?: string,
    cumulative_recovered?: string,
    cumulative_tested?: string,
    date?: string,
    location_key?: string,
    new_confirmed?: string,
    new_deceased?: string,
    new_recovered?: string,
    new_tested?: string,
}

export type PlotDataType = {
    xaxis: string,
    yaxis: string,
}