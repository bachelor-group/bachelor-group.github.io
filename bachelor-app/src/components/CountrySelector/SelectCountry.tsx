import { useEffect, useState } from "react";
import ChosenCountries from "./ChosenCountries";

interface SelectCountryProps {
    AllCountries: string[]

}

export const SelectCountry = ({ AllCountries  }: SelectCountryProps) => {

    const [value, setValue] = useState('')
    const [display, setDisplay] = useState<boolean>(false);
    const [selectedCountries, setSelectedCountries] = useState<string[]>([])
    const [allCountries, setAllCountries] = useState<string[]>(AllCountries)


    const addCountry = (country: string) => {
        setValue("")
        setSelectedCountries([...selectedCountries, country])
        // and remove it from the list
        removeCountry(country)
    };
    
    const removeCountry = (removedCountry: string) => {
        // remove country from state
        setAllCountries(allCountries.filter(country => country !== removedCountry));
    };

    // hide country list if not searching
    useEffect(() => {
        if (value === "") {
            setDisplay(false)
        } else {
            setDisplay(true)
        }

    }, [value])


    return (
        <>
            <div>
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
                            .map((country, index)  => (
                                    <p key={index} onClick={()=>addCountry(country)} >{country}</p>
                            ))
                        }
                    </div>
                    : <></>
                }
            </div>
            <ChosenCountries Countries={selectedCountries} />

        </>
    );
}


export default SelectCountry;