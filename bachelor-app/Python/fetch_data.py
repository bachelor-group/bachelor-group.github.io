import pandas as pd
import csv
import math
import os
from google.cloud import storage
import numpy as np


# fetch only specific columns from a csv file:
def filter_data_columns(filename, dt, cols):
    """filter out selected columns"""
    path = "public/csvData/" + filename
    # Create the file if it does not exist
    if not os.path.isfile(path):
        open(path, "w+").close()
    dt.to_csv(path, index=False, columns=cols)


def upload_blob(bucket_name, source_file_name, destination_blob_name):
    """Uploads a file to the bucket."""
    storage_client = storage.Client()
    bucket = storage_client.bucket(bucket_name)
    blob = bucket.blob(destination_blob_name)
    blob.upload_from_filename(source_file_name)

    print("File {} uploaded to {}.".format(source_file_name, destination_blob_name))


def download_blob(bucket_name, source_blob_name, destination_file_name):
    """Downloads a blob from the bucket."""
    storage_client = storage.Client()
    bucket = storage_client.bucket(bucket_name)
    blob = bucket.blob(source_blob_name)
    blob.download_to_filename(destination_file_name)

    print(
        "Downloaded storage object {} from bucket {} to local file {}.".format(
            source_blob_name, bucket_name, destination_file_name
        )
    )


# Generates a file with date: total_confirmed
def date_total_confirmed(datatype):
    download_blob(
        "covid-data-minimized", datatype + ".csv", "public/csvData/" + datatype + ".csv"
    )

    HistogramData = dict()
    with open("public/csvData/" + datatype + ".csv", "r") as csvfile:
        datareader = csv.reader(csvfile)
        # skip header
        next(datareader)
        for row in datareader:
            date = row[0]
            new_confirmed = row[2]
            population = row[3]
            try:
                if date in HistogramData:
                    if not math.isnan(float(new_confirmed)):
                        data = HistogramData[date]["list"]
                        data.append(float(new_confirmed) / float(population) * 100000)

                        # print(HistogramData[date])
                        HistogramData[date] = {
                            "total_confirmed": HistogramData[date]["total_confirmed"]
                            + float(new_confirmed),
                            "list": data,
                        }
                else:
                    if not math.isnan(float(new_confirmed)):
                        data = []
                        data.append(float(new_confirmed) / float(population) * 100000)
                        HistogramData[date] = {
                            "total_confirmed": float(new_confirmed),
                            "list": data,
                        }
            except ValueError as e:
                print("error: ", e)

        # print(HistogramData[key])

    with open("public/csvData/" + datatype + "_total.csv", "w") as csvfile:
        csvfile.write(
            "%s,%s,%s,%s\n"
            % ("date", "total_confirmed", "median_per_100k", "std_per_100k")
        )
        for key in HistogramData.keys():
            csvfile.write(
                "%s,%s,%s,%s\n"
                % (
                    key,
                    HistogramData[key]["total_confirmed"],
                    np.median(HistogramData[key]["list"]),
                    np.std(HistogramData[key]["list"]),
                )
            )

    # Upload the file to the cloud:
    upload_blob(
        "covid-data-minimized",
        "public/csvData/" + datatype + "_total.csv",
        datatype + "_total.csv",
    )

    # files are no longer needed, delete them:
    os.remove("public/csvData/" + datatype + "_total.csv")
    os.remove("public/csvData/" + datatype + ".csv")


# STÅ I /bachelor-app
if __name__ == "__main__":
    date_total_confirmed("new_confirmed")
    date_total_confirmed("new_deceased")
