import { EpidemiologyData, EpidemiologyEnum } from "./DataTypes"

let data: EpidemiologyData[] = []

for (let i = 0; i < 100; i++) {
    data.push({ [EpidemiologyEnum.new_confirmed] : (Math.ceil(Math.random()*5+ i)).toString(), [EpidemiologyEnum.date]: (Math.ceil(Math.random()*5+ i)).toString(), [EpidemiologyEnum.cumulative_confirmed] : (Math.ceil(Math.random()*12-i+100)).toString() })

}

export const LoadData = () => {

    return new Promise<EpidemiologyData[]>((resolve) => {
        setTimeout(() => {
            resolve(
                data
            )
        }, (Math.random()*2000 + 2000) )
    })
}

export default LoadData;