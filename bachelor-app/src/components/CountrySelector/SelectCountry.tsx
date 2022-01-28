import { useCallback, useEffect, useRef, useState } from "react";
import ReactTags, { Tag } from 'react-tag-autocomplete'
import { iso31661 } from 'iso-3166'
import { EpidemiologyData } from "../DataContext/DataTypes";
import { csv } from "d3";


export interface TagExtended extends Tag {
    location_key: string

}

const url = "https://storage.googleapis.com/covid19-open-data/v3/index.csv"

const LoadData = () => {
    return new Promise<TagExtended[]>((resolve) => {
        let Data: TagExtended[] = []
        csv(url).then(d => {
            d.forEach((element, index) => {
                if (element.location_key === element.country_code) {
                    Data.push({ id: Data.length, name: element.country_name!, location_key: element.country_code! })
                }
            });
            resolve(Data);
        });
    })
}


export const SelectCountry = ({ selectedCountries }: { selectedCountries: (countries: TagExtended[]) => void }) => {

    const [tags, setTags] = useState<TagExtended[]>([])
    const [allCountries, setAllCountries] = useState<Tag[]>([])
    const [data, setData] = useState<TagExtended[]>([])
    const reactTags = useRef<Tag>()


    useEffect(() => {
        LoadData().then((d: TagExtended[]) => {
            setData(d)
        })
    }, [])

    // remove in future if we should also display regions of country
    // just set suggestion list to data
    useEffect(() => {
        // setAllCountries(data.filter((v, i, a) => a.findIndex(t => (t.name === v.name)) === i))
        setAllCountries(data)

    }, [data])


    useEffect(() => {
        // emit to parent a new country is added:
        selectedCountries(data.filter(d => tags.find(t => t.id === d.id)))
    }, [tags])


    const onDelete = useCallback((tagIndex) => {
        if (tagIndex !== -1) {
            const deletedTag = tags.filter((_, i) => i === tagIndex)
            // bug here? with indexing? be aware!
            setTags(tags.filter((_, i) => i !== tagIndex))

            // on remove, need to add back to allCountries
            setAllCountries([...allCountries, deletedTag[0]])

        }
    }, [tags, allCountries])


    // newTag er bare en Tag, så får ikke med landskoden... om vi ikk efår det er det nok ikke vits å laste inn data, og så filtrere bort regions?
    // id'ene stemmer overens, så mulig vi må bare sjekke med datalisten
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