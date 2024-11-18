import csv
import json


def convert_csv_to_json(csv_filename, json_filename):
    data = []

    with open(csv_filename, mode='r', encoding='utf-8') as csv_file:
        csv_reader = csv.DictReader(csv_file)
        for row in csv_reader:
            if row["parent_station"] == '':
                data.append({
                    "stop_id": row["stop_id"],
                    "stop_name": row["stop_name"],
                    "stop_lat": float(row["stop_lat"]) if row["stop_lat"] else None,
                    "stop_lon": float(row["stop_lon"]) if row["stop_lon"] else None,
                })
#compare shape lat et lon pour trouver stop, si parent du stop il y a mettre son id sinon mettre l'id, supprimer les doublons

    with open(json_filename, mode='w', encoding='utf-8') as json_file:
        json.dump(data, json_file, indent=4, ensure_ascii=False)


convert_csv_to_json('Ressources/stops.txt', 'stops.json')