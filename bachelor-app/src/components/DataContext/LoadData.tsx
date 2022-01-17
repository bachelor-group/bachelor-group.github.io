import { EpidemiologyData, EpidemiologyEnum } from "./DataTypes"

let data: EpidemiologyData[] = []

for (let i = 0; i < 100; i++) {
    data.push({ [EpidemiologyEnum.new_confirmed]: (Math.ceil(Math.random() * 5 + i)).toString(), [EpidemiologyEnum.date]: (i).toString(), [EpidemiologyEnum.location_key]: Math.round(Math.random()) == 1 ? "France" : "Germany" })
}

export const LoadData = () => {

    return new Promise<EpidemiologyData[]>((resolve) => {
        setTimeout(() => {
            resolve(
                data
            )
        }, (Math.random() * 2000 + 2000))
    })
}

export default LoadData;