import React from 'react'

const epidemiology: string = "https://storage.googleapis.com/covid19-open-data/v3/latest/epidemiology.csv"
const searchtrends: string = ""
const vaccination: string= ""
const mobility: string =""

export const Loaddata = ({ category }: { category: string}) => {

    switch (category) {
        case "cases":
            
            break;
    
        default:
            break;
    }
    return (
        <div>

        </div>
    );
}


export default Loaddata;