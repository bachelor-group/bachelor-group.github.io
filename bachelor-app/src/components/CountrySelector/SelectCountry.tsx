import { useCallback, useEffect, useRef, useState } from "react";
import ReactTags, { Tag } from 'react-tag-autocomplete'
import { Button } from "react-bootstrap";
import { IMap } from "../GraphPage/GraphPage";


export interface TagExtended extends Tag {
    location_key: string

}

interface SelectCountryProps {
    selectedCountries: (countries: TagExtended[]) => void
    Key: string
    suggs: Map<string, IMap[]>
}

function MapToTag(map: Map<string, IMap[]>) {
    let countryTags: Tag[] = [];
    let regionTags: Tag[] = [];
    let i = 0;
    let j = 0;
    for (let entry of Array.from(map.entries())) {
        let regions = entry[1];
        regions.forEach(region => {
            if (!region.country_name) {
                if (region.subregion1_name) {
                    regionTags.push({ id: j, name: region.subregion1_name, location_key: region.location_key } as Tag)
                } else {
                    regionTags.push({ id: j, name: region.subregion2_name, location_key: region.location_key } as Tag)
                }
                j++
            } else {

                countryTags.push({ id: i, name: region.country_name, location_key: region.location_key } as Tag)

            }
        })
        i++
    }

    return [countryTags, regionTags]

}

export const SelectCountry = ({ selectedCountries, Key, suggs }: SelectCountryProps) => {

    const [display, setDisplay] = useState<boolean>(true)
    const [tags, setTags] = useState<TagExtended[]>([])
    const [suggestions, setSuggestions] = useState<Tag[]>([])

    const [allCountries, setAllCountries] = useState<Tag[]>([])

    const searchtrendCountries: TagExtended[] = [
        { id: 1, name: "Australia", location_key: "AU" },
        { id: 2, name: "United Kingdom", location_key: "GB" },
        { id: 3, name: "Ireland", location_key: "IE" },
        { id: 4, name: "Singapore", location_key: "SG" },
        { id: 5, name: "United States of America", location_key: "US" },
        { id: 6, name: "New Zealand", location_key: "NZ" }
    ];

    const [data, setData] = useState<TagExtended[]>([])
    const reactTags = useRef<Tag>()

    useEffect(() => {
        let [countries, subregions] = MapToTag(suggs)
        setAllCountries(countries)
        setSuggestions(countries)
        setData(countries as TagExtended[])
        return () => {
            setData([]);
            setAllCountries([])
            setSuggestions([])
        };
    }, [suggs])



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
            {display ?
                <div style={{ display: "flex" }}>
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
                    <div style={{ margin: "30px auto 0 auto", marginLeft: "-15px" }}>
                        <Button variant="primary" size="lg" onClick={() => setDisplay(false)}>Hide</Button>
                    </div>
                </div>
                : <>
                    <div style={{ margin: "30px auto 0 auto" }}>
                        <Button variant="primary" size="sm" onClick={() => setDisplay(true)}>Show</Button>
                    </div>

                </>}
        </>
    );
}


export default SelectCountry;
