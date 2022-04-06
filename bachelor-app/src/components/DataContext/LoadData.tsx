import { DataType } from "./MasterDataType"
import { csv } from "d3"
import { TagExtended } from "../CountrySelector/SelectCountry"

const NorwayEpidemiologyUrl = "https://storage.googleapis.com/covid19-open-data/v3/location/NO.csv"
const url = "https://storage.googleapis.com/covid19-open-data/v3/location/"


export const LoadData = (requestedCountries: TagExtended[], loadedCountries: TagExtended[], data?: DataType[]) => {
    return new Promise<DataType[]>((resolve) => {
        let loaded_csv: number = loadedCountries.length;
        if (requestedCountries.length + 1 === loadedCountries.length && requestedCountries.length !== 0) {
            csv(url + requestedCountries.at(-1)!.location_key + ".csv").then(d => {
                d.forEach(element => {
                    data.push(element)
                });
                loaded_csv++
                if (requestedCountries.length === loaded_csv) {
                    resolve(data);
                    return;
                }
            });
        }
        loaded_csv = 0;
        let data: DataType[] = []
        if (requestedCountries.length === 0) {
            csv(NorwayEpidemiologyUrl).then(d => {
                d.forEach(element => {
                    data.push(element)
                });
                resolve(data);
            });
        } else {
            requestedCountries.forEach((country) => {
                csv(url + country.location_key + ".csv").then(d => {
                    d.forEach(element => {
                        data.push(element)
                    });
                    loaded_csv++
                    if (requestedCountries.length === loaded_csv) {
                        resolve(data);
                    }
                });
            });
        }
    })
}


export default LoadData;