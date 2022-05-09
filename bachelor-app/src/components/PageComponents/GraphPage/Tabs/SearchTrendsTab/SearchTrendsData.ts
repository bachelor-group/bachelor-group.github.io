import { TagExtended } from "../../../../CountrySelector/SelectCountry";


export const SearchTrendsData = () => {
    return new Promise<TagExtended[]>((resolve) => {
        let Data: TagExtended[] = [
            { id: 1, name: "Australia", location_key: "AU" },
            { id: 2, name: "United Kingdom", location_key: "GB" },
            { id: 3, name: "Ireland", location_key: "IE" },
            { id: 4, name: "Singapore", location_key: "SG" },
            { id: 5, name: "United States", location_key: "US" }
        ]
        resolve(Data);
    })
}
export default SearchTrendsData