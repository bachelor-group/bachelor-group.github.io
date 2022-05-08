import { useCallback, useEffect, useState } from "react";
import { Form } from "react-bootstrap";
import ReactTags, { Tag } from "react-tag-autocomplete";
import { IMap } from "../GraphPage/GraphPage";


export interface TagExtended extends Tag {
    location_key: string
}

interface SelectCountryProps {
    SelectedRegions: (countries: TagExtended[]) => void
    Key: string
    AllLocations: Map<number, Map<string, IMap>>
}

const ST_COUNTRY_CODES = ["AU", "GB", "IE", "SG", "US", "NZ"]
const ST_MAP: Map<string, string> = new Map()

for (let i in ST_COUNTRY_CODES) {
    ST_MAP.set(ST_COUNTRY_CODES[i], ST_COUNTRY_CODES[i])
}

type AdminlvlEntry = {
    tags: Map<string, Tag>,
    activeSuggestions: Map<string, IMap>,
    hideData: boolean,
    allSuggestions: Map<string, IMap>,
}

export const SelectCountry = ({ SelectedRegions, Key, AllLocations }: SelectCountryProps) => {

    const [adminLvls, setAdminLvls] = useState<Map<number, AdminlvlEntry>>(new Map());

    // check if selected Key is SearchTrends, and if so if the selected country is a search trend country
    function handleTabKey(location_key: string) {
        return (Key === "SearchTrends" && ST_MAP.has(location_key)) || Key !== "SearchTrends"
    }

    // Set data when loaded.
    useEffect(() => {
        let newAdminMap = new Map();
        if (AllLocations.size !== 0) {
            for (let entry of Array.from(AllLocations.entries())) {
                let adminLvl = entry[0];
                let LocationsMap = entry[1];

                let activeSuggestions = new Map()
                if (adminLvl === 0) {
                    activeSuggestions = new Map(LocationsMap);
                }

                let adminLvlEntry: AdminlvlEntry = {
                    tags: new Map(),
                    activeSuggestions: activeSuggestions,
                    hideData: false,
                    allSuggestions: LocationsMap,
                }
                newAdminMap.set(adminLvl, adminLvlEntry);
            }
        }
        setAdminLvls(newAdminMap);
    }, [AllLocations])

    useEffect(() => {
        let newAdminMap = new Map(adminLvls);
        let curAdminEntry = newAdminMap.get(0);

        if (curAdminEntry) {
            if (Key === "SearchTrends") {
                curAdminEntry.activeSuggestions.clear()
                for (let st_key of ST_COUNTRY_CODES) {
                    curAdminEntry.activeSuggestions.set(st_key, curAdminEntry.allSuggestions.get(st_key)!)
                }
            } else {
                curAdminEntry.activeSuggestions = new Map(curAdminEntry.allSuggestions);
            }

            //Remove selected Tags
            for (let selectedEntry of Array.from(curAdminEntry.tags.entries())) {
                curAdminEntry.activeSuggestions.delete(selectedEntry[0]);
            }

        }
        setAdminLvls(newAdminMap);
    }, [Key])


    // when tags change, let parent component know
    useEffect(() => {
        let tags: TagExtended[] = []

        for (let entry of Array.from(adminLvls.entries())) {
            let value = entry[1];
            if (!value.hideData) {
                for (let selected of Array.from(value.tags.values())) {
                    let location = Array.from(value.allSuggestions.values()).find((d) => d.id === selected.id)!
                    let tag: TagExtended = { id: location.id, location_key: location.locationKey, name: location.name };
                    tags.push(tag);
                }
            }
        }

        SelectedRegions(tags)
    }, [adminLvls])


    const onDelete = useCallback((tagIndex: number, adminLvl: number) => {
        let newAdminLvls = new Map(adminLvls);
        if (tagIndex !== -1) {
            let curEntry = newAdminLvls.get(adminLvl)!
            //Find deleted item
            const deletedTagEntry = Array.from(curEntry.tags.entries())[tagIndex]

            curEntry.tags.delete(deletedTagEntry[0])
            let parentEntry = newAdminLvls.get(adminLvl - 1)
            // on remove, need to add back to suggestion
            let newSuggestionsMap = curEntry.activeSuggestions;
            if (handleTabKey(deletedTagEntry[0])) {
                let parentKey = deletedTagEntry[0].split("_").slice(0, -1)
                // If parent tags exists and parent exist in tags
                if (!parentEntry || parentEntry.tags.get(parentKey.join("_"))) {
                    newSuggestionsMap.set(deletedTagEntry[0], curEntry.allSuggestions.get(deletedTagEntry[0])!);
                }
            }

            //Remove all child suggestions
            let childAdmin = newAdminLvls.get(adminLvl + 1)!
            for (let child of curEntry.allSuggestions.get(deletedTagEntry[0])!.children) {
                childAdmin.activeSuggestions.delete(child);
            }

            newAdminLvls.set(adminLvl, curEntry);
            setAdminLvls(newAdminLvls);
        }
    }, [adminLvls])

    const onAddition = useCallback((newTag: Tag, adminLvl: number) => {
        let admin = adminLvls;
        let curAdminEntry = admin.get(adminLvl)!

        //find locationKey
        let location = Array.from(curAdminEntry.activeSuggestions.values()).find(d => d.id === newTag.id)!

        curAdminEntry.tags.set(location.locationKey, newTag)

        // remove from suggestion list:
        curAdminEntry.activeSuggestions.delete(location.locationKey)!
        admin.set(adminLvl, curAdminEntry)

        let childAdmin = admin.get(adminLvl + 1)

        //Update active suggestions:
        if (childAdmin !== undefined) {
            for (let child of location.children) {
                childAdmin.activeSuggestions.set(child, childAdmin.allSuggestions.get(child)!);
            }
            admin.set(adminLvl + 1, childAdmin);
        }
        setAdminLvls(new Map(admin))
    }, [adminLvls])

    return (
        <>
            {adminLvls.size === 0 ? <></> :
                <>
                    {Array.from(adminLvls.entries()).map((entry) => {
                        let adminLvl = entry[0];
                        let value = entry[1];
                        if (value.activeSuggestions.size === 0 && value.tags.size === 0) return <></>
                        return <div style={{ display: "flex", justifyContent: "space-evenly", alignItems: "baseline", flexWrap: "wrap" }} key={adminLvl}>
                            <ReactTags
                                data-testid="tag"
                                tags={Array.from(value.tags.values())}
                                suggestions={Array.from(value.activeSuggestions.values()) as Tag[]}
                                onDelete={(e) => onDelete(e, adminLvl)}
                                onAddition={(e) => onAddition(e, adminLvl)}
                                minQueryLength={0}
                                placeholderText={`${adminLvl === 0 ? "Select Country" : "Select Region"}`}
                                removeButtonText={"Remove country"}
                                maxSuggestionsLength={6}
                                autoresize={true}
                            />
                            <div>
                                <Form>
                                    <Form.Check
                                        type="switch"
                                        id="hideData"
                                        label="Hide"
                                        onChange={() => {
                                            let admin = adminLvls
                                            let curEntry = admin.get(adminLvl)!
                                            curEntry.hideData = !curEntry.hideData
                                            admin.set(adminLvl, curEntry)
                                            setAdminLvls(new Map(admin));
                                        }}
                                    />
                                </Form>
                            </div>
                        </div>
                    })}

                </>

            }

        </>
    );
}


export default SelectCountry;
