import csv
import math
import pandas as pd
import os
from fetch_data import fetch_data_columns
import concurrent.futures


def epidemiology_locations(location, path):
    columns=["new_confirmed"]

    epidemiology = pd.read_csv("https://storage.googleapis.com/covid19-open-data/v3/location/"+location+".csv")
    fetch_data_columns(path, epidemiology, columns)
    

def write_to_file(region_code, filename="cases"):
    print("=================== "+region_code+" ====================")
    path="public/csvData/aggregated"
    # print("fetching")

    dt = pd.read_csv("https://storage.googleapis.com/covid19-open-data/v3/location/"+region_code+".csv")
    # print("done fetching")

    region_code = region_code.split("_")
    for region in region_code:
        path += "/"+region
    if not os.path.exists(path):
        os.makedirs(path)
    dt.to_csv(path+"/"+filename+".csv", index=False, columns=COLS)
    print()
    
    
    # TODO: benchmark current version (first 100 locations) - vs single thread
    
def generate_data():
    urls = []
    with open("public/csvData/index_min.csv", 'r') as csvfile:
        datareader = csv.reader(csvfile)
        
        # skip header
        next(datareader)

        for row in datareader:
            region_codes = row[0].split("_")
            
            url=""
            for i,region in enumerate(region_codes):
                url += region
                if i != len(region_codes)-1:
                    url += "_"
            urls.append(url)

        try:
             with concurrent.futures.ThreadPoolExecutor(max_workers=16) as executor:
                executor.map(write_to_file, urls)
        except:
            print()




if __name__=="__main__":
    COLS = ["date", "new_confirmed"]
    generate_data()
    