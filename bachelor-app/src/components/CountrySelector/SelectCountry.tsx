import { useCallback, useEffect, useRef, useState } from "react";
import ReactTags, { Tag } from 'react-tag-autocomplete'
import { csv } from "d3";


export interface TagExtended extends Tag {
    location_key: string

}

const url = "https://storage.googleapis.com/covid19-open-data/v3/index.csv"
// const url = "csvData/index_min.csv"

export const _LoadCountries = () => {
    return new Promise<TagExtended[]>((resolve) => {
        let Data: TagExtended[] = []
        csv(url).then(d => {
            d.forEach((element) => {
                if (element.location_key === element.country_code) {
                    Data.push({ id: Data.length, name: element.country_name!, location_key: element.country_code! })
                }
            });
            resolve(Data);
        });
    })
}
interface SelectCountryProps {
    LoadCountries?: typeof _LoadCountries
    selectedCountries: (countries: TagExtended[]) => void
    Key: string
}

export const SelectCountry = ({ selectedCountries, LoadCountries = _LoadCountries, Key }: SelectCountryProps) => {

    const [tags, setTags] = useState<TagExtended[]>([])
    const [suggestions, setSuggestions] = useState<Tag[]>([])

    const [allCountries, setAllCountries] = useState<Tag[]>([])

    const [searchtrendCountries, setSearchtrendCountries] = useState<TagExtended[]>([
        { id: 1, name: "Australia", location_key: "AU" },
        { id: 2, name: "United Kingdom", location_key: "GB" },
        { id: 3, name: "Ireland", location_key: "IE" },
        { id: 4, name: "Singapore", location_key: "SG" },
        { id: 5, name: "United States of America", location_key: "US" },
        { id: 6, name: "New Zealand", location_key: "NZ" }
    ])

    const [data, setData] = useState<TagExtended[]>([])
    const reactTags = useRef<Tag>()

    useEffect(() => {
        LoadCountries().then((d: TagExtended[]) => {
            setData(d)
            setAllCountries(d)

            // default is epi, (not searchtrends):
            setSuggestions(d)
        })
        return () => {
            setData([]);
            setAllCountries([])
            setSuggestions([])
        };
    }, [])



    useEffect(() => {
        if (Key !== "SearchTrends") {
            if (tags.length !== 0) {
                setSuggestions(allCountries.filter(s => tags.find(t => t.name !== s.name)))

            } else {
                setSuggestions(allCountries)
            }
        } else {
            if (tags.length !== 0) {
                setSuggestions(searchtrendCountries.filter(s => tags.find(t => t.name !== s.name)))

            } else {
                setSuggestions(searchtrendCountries)
            }
        }

    }, [Key])


    // when tags change, let parent component know
    useEffect(() => {
        // tags does not include location_key, data does:
        selectedCountries(data.filter(d => tags.find(t => t.name === d.name)))

    }, [tags])


    const onDelete = useCallback((tagIndex) => {
        if (tagIndex !== -1) {
            const deletedTag = tags.filter((_, i) => i === tagIndex)
            setTags(tags.filter((_, i) => i !== tagIndex))

            // on remove, need to add back to suggestions
            setSuggestions([...suggestions, deletedTag[0]])
        }
    }, [tags, suggestions])


    const onAddition = useCallback((newTag) => {
        setTags([...tags, newTag])

        // remove from suggestion list:
        setSuggestions(suggestions.filter(Tag => Tag.name !== newTag.name))

    }, [tags, suggestions])

    return (
        <>
            <ReactTags
                data-testid="tag"
                //@ts-ignore
                ref={reactTags}
                tags={tags}
                suggestions={suggestions}
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