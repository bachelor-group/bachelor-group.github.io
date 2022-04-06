from asyncio.windows_events import NULL
import json
from urllib import request
import requests

INDEX_TO_COUNTRY_CODE = 4
response = requests.get('https://storage.googleapis.com/covid19-open-data/v3/index.json')

indexData = response.json()
print(indexData["data"][0])


def check_key_can_exist(country_code):
    for data in indexData['data']:
        if len(data[0].split('_')) > 1 and data[INDEX_TO_COUNTRY_CODE] == country_code:
            print("key_can_exist")
            return True
            
    return False

def search_for_alternative_codes():
    print(url)
    print(response.status_code)
    print(feature)

# Load topoJSON
with open('./public/admin_1_topojson.json', 'r', encoding='UTF-8') as f:
    data = json.load(f)


# Iterate over features
for feature in data['objects']['features']['geometries']:
    properties = feature['properties']
    # print(feature)
    
    location_key = None

    # Check if key is already correct
    url = properties['iso_3166_2']
    url = url.replace("-", "_")

    # Check if data can exist
    split_url = url.split("_")
    # admin_level = int(properties['gadm_level'])
    # print(indexData['columns'])


    if "~" not in url :
        key_can_exist = False
        key_can_exist = check_key_can_exist(split_url[0])
        
        if key_can_exist:
            response = requests.head(f"https://storage.googleapis.com/covid19-open-data/v3/location/{url}.json")

            if response.status_code == 200:
                print(f"Sucsess: {url}")
                location_key = url
            else:
                search_for_alternative_codes(properties)
                break
                
    properties['LOCATION_KEY'] = location_key

#Write result to a new file
with open('./python/new.json', 'w') as f:
    json.dump(data, f)



### NOT IN USE ###

# #A Python dictionary containing properties to be added to each GeoJSON Feature
# properties_dict={
#     "property1": "foo",
#     "property2": 10,
#     "property3": 100
#     }
# #Convert the dictionary to a list
# properties_list=zip(properties_dict.keys(),properties_dict.values())