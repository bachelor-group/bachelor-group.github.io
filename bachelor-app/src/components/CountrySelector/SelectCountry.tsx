import { useCallback, useEffect, useRef, useState } from "react";
import ReactTags, { Tag } from 'react-tag-autocomplete'

interface SelectCountryProps {
    AllCountries: Tag[]

}

export const SelectCountry = ({ AllCountries }: SelectCountryProps) => {

    const [tags, setTags] = useState<Tag[]>([])
    const [allCountries, setAllCountries]= useState<Tag[]>(AllCountries)
    const reactTags = useRef<Tag>()


    const onDelete = useCallback((tagIndex) => {
        const deletedTag = tags.filter((_, i) => i === tagIndex)

        setTags(tags.filter((_, i) => i !== tagIndex))

        // on remove, need to add back to allCountries
        if (deletedTag.length === 1) {
            setAllCountries([...allCountries, deletedTag[0]])
        }
    }, [tags])


    const onAddition = useCallback((newTag) => {
        setTags([...tags, newTag])

        // remove from suggestion list:
        setAllCountries(allCountries.filter(Tag => Tag.name !== newTag.name))
    }, [tags])
    
    useEffect(()=>{
        
    }, [allCountries])


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