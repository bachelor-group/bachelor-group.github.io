import { useCallback, useEffect, useRef, useState } from "react";
import ReactTags, { Tag } from 'react-tag-autocomplete'
import { iso31661 } from 'iso-3166'
import { EpidemiologyData } from "../DataContext/DataTypes";
import { csv } from "d3";
import { resolve } from "node:path/win32";

interface SelectCountryProps {
    AllCountries: Tag[]
    Data: EpidemiologyData[]

}
const url = "https://storage.googleapis.com/covid19-open-data/v3/index.csv"


const LoadData = () => {
    return new Promise<EpidemiologyData[]>((resolve) => {
        let IndexData: any[] = []
        csv(url).then(d => {
            d.forEach(element => {
                IndexData.push(element.country_name)
            });
            resolve(IndexData);
        });
    })
}
// let Countries: string[] = []

// for (let i = 0; i < IndexData.length; i++) {
//     Countries.push(IndexData[i].country_name)

// }


export const SelectCountry = ({ AllCountries, Data }: SelectCountryProps) => {

    const [tags, setTags] = useState<Tag[]>([])
    const [allCountries, setAllCountries] = useState<Tag[]>(AllCountries)
    const reactTags = useRef<Tag>()

    let IndexData = LoadData()

    //@ts-ignore
    let locations = [...new Set(IndexData)]

    console.log(locations)


    // const location_keys: string[] = []
    // let locations = new Set<string>();

    // console.log(iso31661)
    // for (let i = 0; i < Data.length; i++) {
    //     location_keys.push(Data[i].location_key!)
    // }
    // Data.forEach((location) => console.log(location.location_key))
    //@ts-ignore https://stackoverflow.com/questions/33464504/using-spread-syntax-and-new-set-with-typescript - seems to be ok to use here
    // locations = [...new Set(Data.forEach((location))]
    // console.log(locations)



    const onDelete = useCallback((tagIndex) => {
        const deletedTag = tags.filter((_, i) => i === tagIndex)

        setTags(tags.filter((_, i) => i !== tagIndex))

        // on remove, need to add back to allCountries
        if (deletedTag.length === 1) {
            setAllCountries([...allCountries, deletedTag[0]])
        }
    }, [tags, allCountries])


    const onAddition = useCallback((newTag) => {
        setTags([...tags, newTag])

        // remove from suggestion list:
        setAllCountries(allCountries.filter(Tag => Tag.name !== newTag.name))
    }, [tags, allCountries])


    return (
        <>
            <ReactTags
                //@ts-ignore
                ref={reactTags}
                tags={tags}
                suggestions={allCountries}
                onDelete={onDelete}
                onAddition={onAddition}
                minQueryLength={0}
                placeholderText={"Add country"}
                removeButtonText={"Remove country"}
                maxSuggestionsLength={6}
            />
        </>
    );
}


export default SelectCountry;