import { useCallback, useEffect, useRef, useState } from "react";
import { Button, Form } from "react-bootstrap";
import ReactTags, { Tag } from "react-tag-autocomplete";
import { IMap } from "../GraphPage/GraphPage";


export interface TagExtended extends Tag {
    location_key: string
}

interface SelectCountryProps {
    SelectedRegions: (countries: TagExtended[], ADMINLVL: 0 | 1 | 2) => void
    Key: string
    AllLocations: Map<string, IMap>
    ADMINLVL?: 0 | 1 | 2
    SelectedLocations: TagExtended[]
}

function ListToTagArray(list: { location_key: string, name: string }[]): TagExtended[] {
    let regionTags: TagExtended[] = [];
    list.forEach((element, index) => {
        regionTags.push({ id: index, name: element.name, location_key: element.location_key })
    })

    return regionTags
}

const ST_COUNTRY_CODES = ["AU", "GB", "IE", "SG", "US", "NZ"]
const ST_MAP: Map<string, string> = new Map()

for (let i in ST_COUNTRY_CODES) {
    ST_MAP.set(ST_COUNTRY_CODES[i], ST_COUNTRY_CODES[i])
}


export const SelectCountry = ({ SelectedRegions, SelectedLocations, Key, AllLocations, ADMINLVL = 0 }: SelectCountryProps) => {

    const [hideData, setHideData] = useState<boolean>(false)
    const [tags, setTags] = useState<TagExtended[]>([])
    const [suggestions, setSuggestions] = useState<Tag[]>([])
    const [adminLvlFilteredLocations, setAdminLvlFilteredLocations] = useState<Tag[]>([])
    const reactTags = useRef<Tag>()


    // check if selected Key is searchtrend, and the selected country is a search trend country
    function handleTabKey(location_key: string) {
      return (Key === "SearchTrends" && ST_MAP.has(location_key)) || Key !== "SearchTrends"
    }


    useEffect(() => {
        let locations: { location_key: string, name: string }[] = [];

        if (ADMINLVL === 0) {
            for (let entry of Array.from(AllLocations.entries())) {
                let key = entry[0];
                let value = entry[1];
                if (handleTabKey(key)) {
                    if (key.split("_").length === 1) {
                        locations.push({ location_key: key, name: value.name })
                    }
                }
            }
        } else {
            SelectedLocations.forEach((location => {
                if (location.location_key.split("_").length === ADMINLVL) {
                    let entry = AllLocations.get(location.location_key)
                    entry!.children.forEach(child => {
                        let childEntry = AllLocations.get(child);
                        locations.push({ location_key: child, name: childEntry!.name })
                    })
                }
            }))
        }
        setAdminLvlFilteredLocations(ListToTagArray(locations))

    }, [AllLocations, SelectedLocations, Key])


    // set list of suggestions from admin level filtered locations
    useEffect(() => {
        if (tags.length !== 0) {
            setSuggestions(adminLvlFilteredLocations.filter(s => tags.find(t => t.name !== s.name)) as TagExtended[])
        } else {
            setSuggestions(adminLvlFilteredLocations)
        }
    }, [adminLvlFilteredLocations])


    // when tags change, let parent component know
    useEffect(() => {
        let filter: TagExtended[] = []
        if (!hideData) {
            filter = adminLvlFilteredLocations.filter(d => tags.find(t => t.name === d.name)) as TagExtended[]
        }
        let previouslySelectedLocations = SelectedLocations.filter(l => l.location_key.split("_").length - 1 !== ADMINLVL)

        SelectedRegions(filter.concat(previouslySelectedLocations), ADMINLVL)

    }, [tags, hideData])


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

    }, [suggestions])


    return (
        <>
            {tags.length === 0 && suggestions.length === 0 ? <></> :
                <>
                    <div style={{ display: "flex" }}>
                        <ReactTags
                            data-testid="tag"
                            //@ts-ignore
                            ref={reactTags}
                            tags={tags}
                            suggestions={suggestions as Tag[]}
                            onDelete={onDelete}
                            onAddition={onAddition}
                            minQueryLength={0}
                            placeholderText={`${ADMINLVL === 0 ? "Select Country" : "Select Region"}`}
                            removeButtonText={"Remove country"}
                            maxSuggestionsLength={6}
                            autoresize={true}
                        />
                        <div style={{ margin: "30px auto 0 auto", marginLeft: "-15px" }}>
                            <Form>
                                <Form.Check
                                    type="switch"
                                    id="hideData"
                                    label="Hide"
                                    onChange={() => setHideData(!hideData)}
                                />
                            </Form>
                        </div>
                    </div>
                </>

            }

        </>
    );
}


export default SelectCountry;

