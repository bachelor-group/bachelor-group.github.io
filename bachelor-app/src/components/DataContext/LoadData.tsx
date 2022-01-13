export type DataType = {
    xaxis: number,
    yaxis: number,
}

let data: DataType[] = []

for (let i = 0; i < 10; i++) {
    data.push({ xaxis: i, yaxis: i })

}

export const LoadData = () => {

    return new Promise<DataType[]>((resolve) => {
        setTimeout(() => {
            resolve(
                data
            )
        }, (Math.random()*5000 + 5000) )
    })
}


export default LoadData;