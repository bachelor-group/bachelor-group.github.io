import pandas as pd
import csv
import math
import os


epidemiology = pd.read_csv(
    "https://storage.googleapis.com/covid19-open-data/v3/epidemiology.csv"
)
hospitalizations = pd.read_csv(
    "https://storage.googleapis.com/covid19-open-data/v3/hospitalizations.csv"
)

index_url = "https://storage.googleapis.com/covid19-open-data/v3/index.csv"


# fetch only specific columns from a csv file:
def fetch_data_columns(filename: str, dt: str, cols):
    """filter out selected columns"""
    path = "public/csvData/" + filename
    # Create the file if it does not exist
    if not os.path.isfile(path):
        open(path, "w+").close()
    dt.to_csv(path, index=False, columns=cols)


# Generates a file with date: total_confirmed
def date_total_confirmed(datatype):
    HistogramData = dict()
    with open("public/csvData/" + datatype + ".csv", "r") as csvfile:
        datareader = csv.reader(csvfile)
        # skip header
        next(datareader)
        for row in datareader:
            date = row[0]
            new_confirmed = row[2]
            try:
                if len(row[1]) == 2:
                    if date in HistogramData:
                        if not math.isnan(float(new_confirmed)):
                            HistogramData[date] = HistogramData[date] + float(
                                new_confirmed
                            )
                    else:
                        if not math.isnan(float(new_confirmed)):
                            HistogramData[date] = float(new_confirmed)

            except ValueError as e:
                print("error: ", e)
    with open("public/csvData/" + datatype + "_total.csv", "w") as csvfile:
        csvfile.write("%s,%s\n" % ("date", "total_confirmed"))
        for key in HistogramData.keys():
            csvfile.write("%s,%s\n" % (key, HistogramData[key]))


# STÅ I /bachelor-app
if __name__ == "__main__":
    # demographics = pd.read_csv("https://storage.googleapis.com/covid19-open-data/v3/demographics.csv")
    # search_trends = pd.read_csv("https://storage.googleapis.com/covid19-open-data/v3/google-search-trends.csv")
    # vaccinations = pd.cread_csv("https://storage.googleapis.com/covid19-open-data/v3/vaccinations.csv")

    # fetch_data_columns("index_min.csv", pd.read_csv(index_url), ["location_key", "country_code", "subregion1_code", "subregion2_code"])

    # update cases.csv before date total_confirmed to get newest version
    # fetch_data_columns("cases.csv", epidemiology, ["date", "location_key", "new_confirmed"])
    # fetch_data_columns("new_hospitalized_patients.csv", hospitalizations, ["date", "location_key", "new_hospitalized_patients"])

    date_total_confirmed("new_confirmed")
    date_total_confirmed("new_deceased")
    # date_total_confirmed("new_hospitalized_patients")
