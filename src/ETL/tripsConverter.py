import csv
import json


def convert_csv_to_json(csv_filename, json_filename):
    data = []

    def convert_to_int(value):
        return int(value) if value.isdigit() else value

    with open(csv_filename, mode='r', encoding='utf-8') as csv_file:
        csv_reader = csv.DictReader(csv_file)

        for row in csv_reader:
            data.append({
                "route_id": row["route_id"],
                "service_id": row["service_id"],
                "trip_id": row["trip_id"],
                "trip_headsign": row["trip_headsign"],
                "direction_id": convert_to_int(row["direction_id"]) if row["direction_id"] else None,
                "block_id": convert_to_int(row["block_id"]) if row["block_id"] else None,
                "shape_id": convert_to_int(row["shape_id"]) if row["shape_id"] else None,
                "wheelchair_accessible": convert_to_int(row["wheelchair_accessible"]) if row[
                    "wheelchair_accessible"] else None
            })

    with open(json_filename, mode='w', encoding='utf-8') as json_file:
        json.dump(data, json_file, indent=4, ensure_ascii=False)


# Usage
convert_csv_to_json('Ressources/trips.txt', 'trips.json')