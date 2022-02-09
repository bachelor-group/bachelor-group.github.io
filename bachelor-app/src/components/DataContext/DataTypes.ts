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


export type EpidemiologyData = { [key in EpidemiologyEnum]?: string }

export function hasKey<O>(obj: O, key: PropertyKey): key is keyof O {
    return key in obj
}
