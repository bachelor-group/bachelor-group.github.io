import pandas as pd
import os


# url = "https://storage.googleapis.com/covid19-open-data/v3/google-search-trends.csv"
url = "~/Downloads/google-search-trends.csv"

search_trends = pd.read_csv(url, iterator=True, chunksize=1000)
dict = {}


show_header= True
for chunk in search_trends:
    location_key = "AU"
    if not os.path.exists(location_key):
        os.makedirs(location_key)
    chunk[chunk.location_key == location_key].to_csv(location_key+".csv", sep=',', index=False, header=show_header)



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
