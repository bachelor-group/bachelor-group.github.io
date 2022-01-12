

export type DataType  = {
  xaxis: number,
  yaxis: number,
}

let data: DataType[] =  []

for (let i = 0; i < 10; i++) {
    data.push({ xaxis: i, yaxis: i })

}


export const LoadData = (): DataType[] => {
    return (
        data
    );
}


export default LoadData;