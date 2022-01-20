import pandas as pd


def fetch_data_columns(filename: str, dt: str, *args: str):
    columns = []
    for arg in args:
        columns.append(arg)
    dt.to_csv("public/csvData/"+filename, index=False, columns=columns)


if __name__=="__main__":
    epidemiology = pd.read_csv("https://storage.googleapis.com/covid19-open-data/v3/epidemiology.csv")
    demographics = pd.read_csv("https://storage.googleapis.com/covid19-open-data/v3/demographics.csv")
    search_trends = pd.read_csv("https://storage.googleapis.com/covid19-open-data/v3/google-search-trends.csv")
    vaccinations = pd.cread_csv("https://storage.googleapis.com/covid19-open-data/v3/vaccinations.csv")

    fetch_data_columns("epidemiology_min.csv", epidemiology, "date", "location_key", "new_confirmed")
    fetch_data_columns("demographics_min.csv", demographics, "location_key", "population")
    fetch_data_columns("deaths_min.csv", epidemiology, "date", "location_ekey", "new_deceased", "cumulative_deceased")
    
    
