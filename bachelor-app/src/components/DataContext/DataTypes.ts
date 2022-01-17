export enum EpidemiologyEnum {
    cumulative_confirmed = "cumulative_confirmed",
    cumulative_deceased = "cumulative_deceased",
    cumulative_recovered = "cumulative_recovered",
    cumulative_tested = "cumulative_tested",
    date = "date",
    location_key = "location_key",
    new_confirmed = "new_confirmed",
    new_deceased = "new_deceased",
    new_recovered = "new_recovered",
    new_tested = "new_tested"
}

// TODO: Fix interface, maybe remove all "?"

export type EpidemiologyData = { [key in EpidemiologyEnum]?: string }


// export interface EpidemiologyData {
//     EpidemiologyRows.cumulative_confirmed: string,
//     EpidemiologyRows.cumulative_deceased: string,
//     EpidemiologyRows.cumulative_recovered: string,
//     EpidemiologyRows.cumulative_tested: string,
//     EpidemiologyRows.date: string,
//     EpidemiologyRows.location_key: string,
//     EpidemiologyRows.new_confirmed: string,
//     EpidemiologyRows.new_deceased: string,
//     EpidemiologyRows.new_recovered: string,
//     EpidemiologyRows.new_tested: string,
// }