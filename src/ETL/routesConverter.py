import csv
import json


def convert_routes_csv_to_json(csv_filename, json_filename):
    data = []

    with open(csv_filename, mode='r', encoding='utf-8') as csv_file:
        csv_reader = csv.DictReader(csv_file)

        for row in csv_reader:
            data.append({
                "route_id": row["route_id"],
                "route_short_name": row["route_short_name"],
                "route_long_name": row["route_long_name"],
                "route_desc": row["route_desc"],
                "route_type": int(row["route_type"]) if row["route_type"] else None,
                "route_color": row["route_color"],
                "route_text_color": row["route_text_color"],
                "route_sort_order": int(row["route_sort_order"]) if row["route_sort_order"] else None
            })

    with open(json_filename, mode='w', encoding='utf-8') as json_file:
        json.dump(data, json_file, indent=4, ensure_ascii=False)


convert_routes_csv_to_json('Ressources/routes.txt', 'routes.json')