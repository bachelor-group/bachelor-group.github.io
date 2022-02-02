import { useCallback, useEffect, useRef, useState } from "react";
import ReactTags, { Tag } from 'react-tag-autocomplete'
import { csv } from "d3";


export interface TagExtended extends Tag {
    location_key: string

}

const url = "https://storage.googleapis.com/covid19-open-data/v3/index.csv"

const _LoadData = () => {
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
    LoadData?: typeof _LoadData
    selectedCountries: (countries: TagExtended[]) => void
}

export const SelectCountry = ({ selectedCountries, LoadData = _LoadData }: SelectCountryProps) => {

    const [tags, setTags] = useState<TagExtended[]>([])
    const [suggestions, setSuggestions] = useState<Tag[]>([])
    const [data, setData] = useState<TagExtended[]>([])
    const reactTags = useRef<Tag>()

    useEffect(() => {
        LoadData().then((d: TagExtended[]) => {
            setData(d)
            setSuggestions(d)
        })
        return () => {
            setData([]); 
            setSuggestions([])
        };
    }, [])



    // when tags change, let parent component know
    useEffect(() => {
        // tags does not include location_key, data does:
        selectedCountries(data.filter(d => tags.find(t => t.id === d.id)))
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