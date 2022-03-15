import csv
from distutils.log import error
import math
import pandas as pd
import os
from fetch_data import fetch_data_columns




def epidemiology_locations(location, path):
    columns=["new_confirmed"]

    epidemiology = pd.read_csv("https://storage.googleapis.com/covid19-open-data/v3/location/"+location+".csv")
    fetch_data_columns(path, epidemiology, columns)
    

def write_to_file(region_code, filename):
    path="public/csvData/aggregated"
    dt = pd.read_csv("https://storage.googleapis.com/covid19-open-data/v3/location/"+region_code+".csv")
    region_code = region_code.split("_")
    for region in region_code:
        path += "/"+region
    if not os.path.exists(path):
        os.makedirs(path)
    dt.to_csv(path+"/"+filename+".csv", index=False, columns=COLS)
    
    
def generate_data():
    with open("public/csvData/index_min_WIP.csv", 'r') as csvfile:
        datareader = csv.reader(csvfile)
        
        # skip header
        next(datareader)

        for row in datareader:
            print(row[0].split("_"))

            region_codes = row[0].split("_")

            try:
                write_to_file(region_codes[0], "cases")
                write_to_file(region_codes[0]+"_"+region_codes[1], "cases")
                write_to_file(region_codes[0]+"_"+region_codes[1]+"_"+region_codes[2], "cases")
            except:
                print()



if __name__=="__main__":
    COLS = ["date", "new_confirmed"]
    generate_data()
    