import { DataType } from "./MasterDataType"
import { csv } from "d3"

const url = "https://storage.googleapis.com/covid19-open-data/v3/location/"


export const LoadDataAsMap = (locationKeys: string[], data: Map<string, DataType[]>) => {
    let newMap: Map<string, DataType[]> = new Map();
    let requestedLocations: string[] = [];

    // Remove unwanted locations
    for (let i = 0; i < locationKeys.length; i++) {
        const element = locationKeys[i];
        if (data.has(element)) {
            newMap.set(element, data.get(element)!);
        }
        else {
            requestedLocations.push(element)
        }
    }

    const numRequestedLocations = requestedLocations.length;
    let loadedLocations = 0;
    // Request new nations
    return new Promise<Map<string, DataType[]>>((resolve) => {

        if (numRequestedLocations === 0) {
            resolve(newMap)
        }

        requestedLocations.forEach((locationKey, i) => {
            csv(url + locationKey + ".csv").then(d => {
                newMap.set(locationKey, d);
                loadedLocations++
                if (loadedLocations === numRequestedLocations) resolve(newMap)
            }).catch((error) => {
                loadedLocations++
                if (locationKeys.length === loadedLocations) {
                    resolve(newMap);
                }
            });
        });
    });
}

export function filterDataBasedOnProps(Data: Map<string, DataType[]>, PrevData: Map<string, DataType[]>, Props: (keyof DataType)[]): Map<string, DataType[]> {
    let FilterData: Map<string, DataType[]> = new Map();

    Data.forEach((data, key) => {
        let dataArray: DataType[] = [];

        if (PrevData.has(key)) {
            dataArray = PrevData.get(key)!;
        } else {
            for (let i = 0; i < data.length; i++) {
                const element = data[i];
                let nullValueFound = false;
                for (let i = 0; i < Props.length; i++) {
                    if (element[Props[i]] === "" || !element[Props[i]]) {
                        nullValueFound = true;
                        break;
                    }
                }
                if (!nullValueFound) dataArray.push(element);
            }
        }
        FilterData.set(key, dataArray);
    })
    return FilterData
}

export default LoadDataAsMap;
