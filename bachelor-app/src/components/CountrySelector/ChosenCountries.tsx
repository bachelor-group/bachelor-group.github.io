import { useEffect } from "react";
import { FaTimes } from 'react-icons/fa';

interface ChosenCountriesProps {
    Countries: string[]
    removedCountry: (country: string) => void

}

export const ChosenCountries = ({ Countries, removedCountry }: ChosenCountriesProps) => {

    useEffect(()=>{

    }, [Countries])

    const removeCountry = ((country: string) => {
        // emit to SelectCountry to remove it.
        removedCountry(country)
    });

    return (
        <div>
        {Countries.map((country,index) => (
            <p key={index} onClick={()=>removeCountry(country)} className="selected-countries">{country}   <FaTimes color={"red"}/></p>
              
        ))}
            

        </div>
    );
}


export default ChosenCountries;