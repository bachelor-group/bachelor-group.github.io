import pandas as pd
import os


# url = "https://storage.googleapis.com/covid19-open-data/v3/google-search-trends.csv"
url = "~/Downloads/google-search-trends.csv"

search_trends = pd.read_csv(url, iterator=True, chunksize=10000)
dict = {}


# location = "wwwwwwwwweeeeeeeeeeeeeeeeeeeeeeeeeeha"
show_header= True
for chunk in search_trends:
    pass
    # for row in chunk.itertuples(index=False):
    #     row.to_csv("test.csv", sep=",", header=True)
        # print(chunk["location_key"])
    # for row in chunk.location_key:
    #     print(row)
    # chuk = chunk.groupby(["location_key"])
    # for col in chunk:
    #     print(col)
        # new_location = str(chunk.location_key)
        # if new_location != location:
        #     region_codes = new_location.split("_")
        #     path = ""
        #     for region in region_codes:
        #         path += region+"/"
        #     print(path)
        #     if not os.path.exists(path):
        #         os.makedirs(path)
        # chunk.location_key.to_csv(path+".csv", sep=',', index=False, header=show_header)
        # location = "AU"
        # chunk[chunk.location_key == location].to_csv("test2.csv", sep=',', index=False, header=False)
        # location = new_location



    # chunk[chunk.location_key].to_csv(f, sep=",", header=False)
    # chunk.location_key.to_csv(file, header=False, index=False)
    # show_header=False
    

# for (location_key), group in search_trends.groupby(['location_key']):
#     location_key = f'{location_key}/'
#     outname = "data.csv"
#     outdir = location_key.split("_")
#     if len(outdir) == 1:
#         if not os.path.exists(outdir[0]):
#             os.mkdir(outdir[0])
#         fullname = os.path.join(location_key, outname)
#         group.to_csv(fullname, index=False)
#     elif len(outdir) >= 2:
#         path = ""
#         for i in range(len(outdir)-1):
#             path += outdir[i]+"/"
#         path += location_key
#         fullname = os.path.join(path, outname)    
#         if not os.path.exists(path):
#             os.makedirs(path)
#         group.to_csv(fullname, index=False)
