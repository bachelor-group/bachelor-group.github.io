import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "react-bootstrap";
import ReactTags, { Tag } from "react-tag-autocomplete";


export interface TagExtended extends Tag {
    location_key: string

}

interface SelectCountryProps {
    selectedRegions: (countries: TagExtended[], ADMINLVL: 0|1|2) => void
    Key: string
    suggs: {location_key: string, name:string}[]
    ADMINLVL?: 0|1|2
}

function MapToTag(list:{location_key: string, name:string}[] ) {
    let regionTags: Tag[] = [];
    list.forEach((element, index)=>{
        regionTags.push({ id: index, name: element.name, location_key: element.location_key } as Tag)
        
    })
    
    return regionTags

}

export const SelectCountry = ({ selectedRegions, Key, suggs, ADMINLVL=0 }: SelectCountryProps) => {

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
        let regions = MapToTag(suggs)
        setAllCountries(regions)
        setSuggestions(regions)
        setData(regions as TagExtended[])
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
        selectedRegions(data.filter(d => tags.find(t => t.name === d.name)), ADMINLVL)


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
                        autoresize={true}
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
