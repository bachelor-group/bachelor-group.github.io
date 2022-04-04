
export enum VaccinationEnum {
    date = "date",
    location_key = "location_key",
    new_persons_vaccinated = "new_persons_vaccinated",
    cumulative_persons_vaccinated = "cumulative_persons_vaccinated",
    new_persons_fully_vaccinated = "new_persons_fully_vaccinated",
    cumulative_persons_fully_vaccinated = "cumulative_persons_fully_vaccinated",
    new_vaccine_doses_administered = "new_vaccine_doses_administered",
    cumulative_vaccine_doses_administered = "cumulative_vaccine_doses_administered",
    new_persons_vaccinated_pfizer = "new_persons_vaccinated_pfizer",
    cumulative_persons_vaccinated_pfizer = "cumulative_persons_vaccinated_pfizer",
    new_persons_fully_vaccinated_pfizer = "new_persons_fully_vaccinated_pfizer",
    cumulative_persons_fully_vaccinated_pfizer = "cumulative_persons_fully_vaccinated_pfizer",
    new_vaccine_doses_administered_pfizer = "new_vaccine_doses_administered_pfizer",
    cumulative_vaccine_doses_administered_pfizer = "cumulative_vaccine_doses_administered_pfizer",
    new_persons_vaccinated_moderna = "new_persons_vaccinated_moderna",
    cumulative_persons_vaccinated_moderna = "cumulative_persons_vaccinated_moderna",
    new_persons_fully_vaccinated_moderna = "new_persons_fully_vaccinated_moderna",
    cumulative_persons_fully_vaccinated_moderna = "cumulative_persons_fully_vaccinated_moderna",
    new_vaccine_doses_administered_moderna = "new_vaccine_doses_administered_moderna",
    cumulative_vaccine_doses_administered_moderna = "cumulative_vaccine_doses_administered_moderna",
    new_persons_vaccinated_janssen = "new_persons_vaccinated_janssen",
    cumulative_persons_vaccinated_janssen = "cumulative_persons_vaccinated_janssen",
    new_persons_fully_vaccinated_janssen = "new_persons_fully_vaccinated_janssen",
    cumulative_persons_fully_vaccinated_janssen = "cumulative_persons_fully_vaccinated_janssen",
    new_vaccine_doses_administered_janssen = "new_vaccine_doses_administered_janssen",
    cumulative_vaccine_doses_administered_janssen = "cumulative_vaccine_doses_administered_janssen",
    new_persons_vaccinated_sinovac = "new_persons_vaccinated_sinovac",
    total_persons_vaccinated_sinovac = "total_persons_vaccinated_sinovac",
    new_persons_fully_vaccinated_sinovac = "new_persons_fully_vaccinated_sinovac",
    total_persons_fully_vaccinated_sinovac = "total_persons_fully_vaccinated_sinovac",
    new_vaccine_doses_administered_sinovac = "new_vaccine_doses_administered_sinovac",
    total_vaccine_doses_administered_sinovac = "total_vaccine_doses_administered_sinovac",
}



export type VaccinationData = { [key in VaccinationEnum]?: string }

export function hasKey<O>(obj: O, key: PropertyKey): key is keyof O {
    return key in obj
}
