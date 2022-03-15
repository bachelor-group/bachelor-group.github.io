import pandas as pd
import csv
import math
import os


epidemiology = pd.read_csv("https://storage.googleapis.com/covid19-open-data/v3/epidemiology.csv")
index_url = "https://storage.googleapis.com/covid19-open-data/v3/index.csv"


# fetch only specific columns from a csv file:
def fetch_data_columns(filename: str, dt: str, cols):
    path = "public/csvData/"+filename
    # Create the file if it does not exist
    if not os.path.isfile(path):
        open(path, 'w+').close()
    dt.to_csv(path, index=False, columns=cols)


# Generates a file with date: total_confirmed
def date_total_confirmed():
        HistogramData = dict()
        with open("public/csvData/cases.csv", 'r') as csvfile:
            datareader = csv.reader(csvfile)
            # skip header
            next(datareader)
            try:
                for row in datareader:
                    if row[0] in HistogramData:
                        if not math.isnan(float(row[2])):
                            HistogramData[row[0]] = HistogramData[row[0]] + float(row[2])
                    else:
                        if not math.isnan(float(row[2])):
                            HistogramData[row[0]] = float(row[2])
            except ValueError as e:
                print("error: ", e)
        with open("public/csvData/total_confirmed.csv", 'w') as csvfile:
            csvfile.write("%s,%s\n" % ("date", "total_confirmed"))
            for key in HistogramData.keys():
                csvfile.write("%s,%s\n" % (key, HistogramData[key]))


# STÅ I /bachelor-app
if __name__=="__main__":
    # demographics = pd.read_csv("https://storage.googleapis.com/covid19-open-data/v3/demographics.csv")
    # search_trends = pd.read_csv("https://storage.googleapis.com/covid19-open-data/v3/google-search-trends.csv")
    # vaccinations = pd.cread_csv("https://storage.googleapis.com/covid19-open-data/v3/vaccinations.csv")

    fetch_data_columns("index_min.csv", pd.read_csv(index_url), ["location_key", "country_code", "subregion1_code", "subregion2_code"])

    # update cases.csv before date total_confirmed to get newest version
    fetch_data_columns("cases.csv", epidemiology, ["date", "location_key", "new_confirmed"])
    date_total_confirmed()
    
    
