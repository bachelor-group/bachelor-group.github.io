import { csv } from "d3"
import { SearchTrendData } from "../../../../DataContext/SearchTrendType"

const SearchTrendUrl = "https://storage.googleapis.com/covid19-open-data/v3/location/AU.csv"

export const LoadSearchTrends = () => {
    return new Promise<SearchTrendData[]>((resolve) => {
        csv(SearchTrendUrl).then(d => {
            resolve(d);
        });
    })
}

export default LoadSearchTrends;