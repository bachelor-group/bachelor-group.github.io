import { useCallback, useEffect, useRef, useState } from "react";
import ChosenCountries from "./ChosenCountries";
import ReactTags, { Tag } from 'react-tag-autocomplete'

interface SelectCountryProps {
    AllCountries: Tag[]

}

export const SelectCountry = ({ AllCountries }: SelectCountryProps) => {

    const [tags, setTags] = useState<Tag[]>([])
    const reactTags = useRef<Tag>()


    const onDelete = useCallback((tagIndex) => {
        setTags(tags.filter((_, i) => i !== tagIndex))
    }, [tags])


    const onAddition = useCallback((newTag) => {
        setTags([...tags, newTag])
    }, [tags])


    return (
        <>
            <ReactTags
            //@ts-ignore
                ref={reactTags}
                tags={tags}
                suggestions={AllCountries}
                onDelete={onDelete}
                onAddition={onAddition}
                minQueryLength={1}
                placeholderText={"Add country"}
                removeButtonText={"Remove country"}
            />

            {/* <div>
                <input
                    type="text"
                    value={value}
                    onChange={e => setValue(e.target.value)}
                />
                {display ?
                    <div>
                        {allCountries
                            .filter(country => {
                                if (!value) return true
                                if (country.toLowerCase().includes(value.toLowerCase())) {
                                    return true
                                } else {
                                    return false
                                }
                            })
                            .map((country, index) => (
                                <p key={index} onClick={() => addCountry(country)} >{country}</p>
                            ))
                        }
                    </div>
                    : <></>
                }
            </div> */}
            {/* <ChosenCountries Countries={selectedCountries} removedCountry={removeCountry} /> */}

        </>
    );
}


export default SelectCountry;