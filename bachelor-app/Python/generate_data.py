import csv
import math
import pandas as pd
import os
from fetch_data import filter_data_columns
import concurrent.futures
import memory_profiler


def epidemiology_locations(location, path):
    columns=["new_confirmed"]

    epidemiology = pd.read_csv("https://storage.googleapis.com/covid19-open-data/v3/location/"+location+".csv")
    filter_data_columns(path, epidemiology, columns)
    

def write_to_file(region_code, filename="cases"):
    path="public/csvData/aggregated"
    dt = pd.read_csv("https://storage.googleapis.com/covid19-open-data/v3/location/"+region_code+".csv")
    region_code = region_code.split("_")
    for region in region_code:
        path += "/"+region
    if not os.path.exists(path):
        os.makedirs(path)
    dt.to_csv(path+"/"+filename+".csv", index=False, columns=COLS)
    
    
# @profile
def generate_data_concurrent(file, threads):
    urls = []
    with open(file, 'r') as csvfile:
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
             with concurrent.futures.ThreadPoolExecutor(max_workers=threads) as executor:
                executor.map(write_to_file, urls)
        except:
            print()


# @profile
def generate_data(file):
    with open(file, 'r') as csvfile:
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
            try:
                write_to_file(url)
            except:
                print()



if __name__=="__main__":
    COLS = ["date", "new_confirmed"]

    generate_data_concurrent("public/csvData/index_min.csv", 16)

    ######### benchmarking #########

    # generate_data_concurrent("public/csvData/index_benchmark_first_200.csv", 16)

    # generate_data("public/csvData/index_benchmark_first_200.csv")
    
