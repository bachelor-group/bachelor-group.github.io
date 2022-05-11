from asyncio.windows_events import NULL
import json
from pickle import FALSE
from urllib import request
from numpy import true_divide
import requests

INDEX_TO_COUNTRY_CODE = 4
response = requests.get('https://storage.googleapis.com/covid19-open-data/v3/index.json')

indexData = response.json()
print(indexData["data"][0])

def name(adminLvl):
    if adminLvl == 0:
        return "NAME"
    if adminLvl == 1:
        return "name"
    if adminLvl == 2:
        return "NAME"

def locationCode(properties, adminLvl):
    if adminLvl == 0:
        return properties["ISO_A2_EH"].replace("-", "_")
    if adminLvl == 1:
        return properties["iso_3166_2"].replac("-", "_")
    if adminLvl == 2:
        return f"{properties['ISO_A2']}_{properties['REGION']}_{properties['CODE_LOCAL'].replace('-', '_')}"


def check_key_can_exist(country_code):
    for data in indexData['data']:
        if len(data[0].split('_')) > 1 and data[INDEX_TO_COUNTRY_CODE] == country_code:
            # print(f"key_can_exist {country_code}")
            return True
            
    return False

def check_key_exists_in_dataSet(location_key):
    response = requests.head(f"https://storage.googleapis.com/covid19-open-data/v3/location/{location_key}.json")

    if response.status_code == 200:
        return True
    return False

def insert_countrycode(properties, split_url: list[str]):
    split_url.insert(1, properties["gu_a3"])
    return split_url

def search_for_name(name: str):
    for data in indexData['data']:
        if  data[9] == name:
            return data




def search_for_alternative_codes(properties):
    # print(properties)
    prop_name = name(1)
    print(properties[prop_name])

    # Test Region code
    try:
        if properties["region_cod"] != "":
            code = properties["region_cod"].replace("-", "_")
            # print(f'Region Code: {code}')
            if check_key_exists_in_dataSet(code):
                return code
    except AttributeError:
       print(f"Hadde ikke {properties[prop_name]}")
    #    return "STOP"

    return None
    # raise TypeError("Denne fantes ikke :/")
    # print(url)

# Load topoJSON
# with open('./public/admin_1_topojson.json', 'r', encoding='UTF-8') as f:
with open('./Python/admin1_temp.json', 'r', encoding='UTF-8') as f:
    data = json.load(f)


# Iterate over features
for feature in data['objects']['features']['geometries']:
    properties = feature['properties']
    location_key = None
    # Check if key is already correct
    url = properties['iso_3166_2']
    url = url.replace("-", "_")

    # Check if data can exist
    split_url = url.split("_")

    #REMOVE GB
    if "~" not in url and split_url[0] =="GB":
        try: 
            location_key = properties['LOCATION_KEY']
        except KeyError:
            location_key = None

        if location_key == None:
            key_can_exist = False
            key_can_exist = check_key_can_exist(split_url[0])
            
            if key_can_exist:
                response = requests.head(f"https://storage.googleapis.com/covid19-open-data/v3/location/{url}.json")
                if response.status_code == 200:
                    location_key = url

                if location_key == None:
                    location_key = search_for_alternative_codes(properties)

                if split_url[0] == "GB":
                    split_url = insert_countrycode(properties, split_url)
                    # print("_".join(split_url))
                    if check_key_exists_in_dataSet("_".join(split_url)):
                        location_key = "_".join(split_url)
                        # print(location_key)

                    else: 
                        indexEntry = search_for_name(properties["name"])
                        if indexEntry != None:
                            location_key = indexEntry[0]

                    # if properties["name"] == "Sunderland":
                    #     print(properties)
                    #     break

            # else:
            #     location_key = search_for_alternative_codes(properties)
            #     if location_key == "STOP":
            #         break
            
                
    properties['LOCATION_KEY'] = location_key



#Write result to a new file
# with open('./python/admin1_temp.json', 'w') as f:
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