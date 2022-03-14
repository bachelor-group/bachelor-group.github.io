import csv
import math
import pandas as pd
import os
from fetch_data import fetch_data_columns


#index_url = "https://storage.googleapis.com/covid19-open-data/v3/index.csv"



def epidemiology_locations(location, path):
    columns=["new_confirmed"]

    epidemiology = pd.read_csv("https://storage.googleapis.com/covid19-open-data/v3/location/"+location+".csv")
    fetch_data_columns(path, epidemiology, columns)
    
    
def generate_data():
    cols = ["new_confirmed"]
    with open("public/csvData/index_min_WIP.csv", 'r') as csvfile:
        datareader = csv.reader(csvfile)
        
        # skip header
        next(datareader)

        for row in datareader:
            print(row[0].split("_"))
            region_codes = row[0].split("_")

            if len(region_codes)== 1:
                dt = pd.read_csv("https://storage.googleapis.com/covid19-open-data/v3/location/"+region_codes[0]+".csv")
                path = "public/csvData/aggregated/"+region_codes[0]
                if not os.path.exists(path):
                    os.makedirs(path)
                dt.to_csv(path+"/"+region_codes[0]+".csv", index=False, columns=cols)

            if len(region_codes)== 2:

                dt = pd.read_csv("https://storage.googleapis.com/covid19-open-data/v3/location/"+region_codes[0]+".csv")
                path = "public/csvData/aggregated/"+region_codes[0]
                if not os.path.exists(path):
                    os.makedirs(path)
                dt.to_csv(path+"/"+region_codes[0]+".csv", index=False, columns=cols)

                dt = pd.read_csv("https://storage.googleapis.com/covid19-open-data/v3/location/"+region_codes[0]+"_"+region_codes[1]+".csv")
                path = "public/csvData/aggregated/"+region_codes[0]+"/"+region_codes[1]
                if not os.path.exists(path):
                    os.makedirs(path)
                dt.to_csv(path+"/"+region_codes[1]+".csv", index=False, columns=cols)

            if len(region_codes)== 3:


                dt = pd.read_csv("https://storage.googleapis.com/covid19-open-data/v3/location/"+region_codes[0]+".csv")
                path = "public/csvData/aggregated/"+region_codes[0]
                if not os.path.exists(path):
                    os.makedirs(path)
                dt.to_csv(path+"/"+region_codes[0]+".csv", index=False, columns=cols)

                dt = pd.read_csv("https://storage.googleapis.com/covid19-open-data/v3/location/"+region_codes[0]+"_"+region_codes[1]+".csv")
                path = "public/csvData/aggregated/"+region_codes[0]+"/"+region_codes[1]
                if not os.path.exists(path):
                    os.makedirs(path)
                dt.to_csv(path+"/"+region_codes[1]+".csv", index=False, columns=cols)

                dt = pd.read_csv("https://storage.googleapis.com/covid19-open-data/v3/location/"+region_codes[0]+"_"+region_codes[1]+"_"+region_codes[2]+".csv")
                path = "public/csvData/aggregated/"+region_codes[0]+"/"+region_codes[1]+"/"+region_codes[2]
                if not os.path.exists(path):
                    os.makedirs(path)
                dt.to_csv(path+"/"+region_codes[2]+".csv", index=False, columns=cols)
                
            # for region in region_codes:
            #     dt.to_csv(path, index=False, columns=cols)
            #     path += region+"/"
            # print(path)
            # if not os.path.exists(path):
            #     os.makedirs(path)

if __name__=="__main__":
    generate_data()
    