import { Feature } from "geojson";

export class Translator {
    adminLvl: 0 | 1 | 2;

    constructor(adminLvl: 0 | 1 | 2) {
        this.adminLvl = adminLvl;
    }

    name(feature: Feature, adminLvl: number=this.adminLvl): string {
        switch (adminLvl) {
            case 0:
                return feature.properties!["NAME"]
            case 1:
                return feature.properties!["name"]
            case 2:
                return feature.properties!["NAME"]
            default:
                return "";
        }
    }

    locationCode(feature: Feature, adminLvl=this.adminLvl): string {
        switch (adminLvl) {
            case 0:
                return feature.properties!["ISO_A2_EH"].replaceAll("-", "_")
            case 1:
                return feature.properties!["iso_3166_2"].replaceAll("-", "_")
            case 2:
                return `${feature.properties!["ISO_A2"]}_${feature.properties!["REGION"]}_${feature.properties!["CODE_LOCAL"].replaceAll("-", "_")}`
        }
    }
    
    countryCode(feature: Feature, adminLvl=this.adminLvl): string {
        switch (adminLvl) {
            case 0:
                return feature.properties!["ISO_A2_EH"]
            case 1:
                return feature.properties!["iso_a2"]
            case 2:
                return feature.properties!["ISO_A2"]
        }
    }
}

export default Translator;
