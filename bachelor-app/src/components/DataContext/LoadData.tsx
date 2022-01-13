export type DataType = {
    xaxis: string,
    yaxis: string,
}

// TODO: Fix interface, maybe remove all "?"
export interface EpidemiologyCSV {
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

let data: EpidemiologyCSV[] = []

for (let i = 0; i < 10; i++) {
    data.push({ new_confirmed: (Math.ceil(Math.random()*10)).toString(), date: (Math.ceil(Math.random()*10)).toString() })

}

export const LoadData = () => {

    return new Promise<EpidemiologyCSV[]>((resolve) => {
        setTimeout(() => {
            resolve(
                data
            )
        }, (Math.random()*5000 + 5000) )
    })
}


export default LoadData;