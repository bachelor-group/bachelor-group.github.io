import pandas as pd

# must be in /bachelor-app/Python/ directory

# vaccination = pd.read_csv("https://storage.googleapis.com/covid19-open-data/v3/vaccinations.csv", header=None, skiprows=0, index_col=False)
vaccination = pd.read_csv("https://storage.googleapis.com/covid19-open-data/v3/vaccinations.csv", skiprows=0, index_col=False)
vaccination_labels = pd.read_csv("https://storage.googleapis.com/covid19-open-data/v3/vaccinations.csv").columns.tolist()

def write_label_to_file(category: str, label: str, data: int):
    filename = label+".csv"
    data[label].to_csv(category+"/"+filename)


for i in range(len(vaccination_labels)):
    write_label_to_file("vaccinations", vaccination_labels[i], vaccination)

# dates = pd.read_csv("vaccinations/date.csv")
# print(dates)