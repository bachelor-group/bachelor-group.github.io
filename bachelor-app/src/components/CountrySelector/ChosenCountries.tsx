import { useEffect } from "react";
import { FaTimes } from 'react-icons/fa';

interface ChosenCountriesProps {
    Countries: string[]

}

export const ChosenCountries = ({ Countries }: ChosenCountriesProps) => {

    useEffect(()=>{

    }, [Countries])

    const removeCountry = ((country: string) => {
        // emit to SelectCountry to remove it.
        console.log("remove: ", country)
        
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