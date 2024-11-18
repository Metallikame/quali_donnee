import csv
import json
from math import isclose

def load_csv_to_dict(file_path):
    """Charge un fichier CSV en une liste de dictionnaires."""
    with open(file_path, mode='r', encoding='utf-8') as csv_file:
        return list(csv.DictReader(csv_file))

def find_matching_stop(shape_lon, shape_lat, stops, tolerance=0.0001):
    """
    Trouve un arrêt (stop) correspondant à un point de forme (shape).
    Comparaison basée sur une tolérance entre les coordonnées.
    """
    for stop in stops:
        stop_lon = float(stop["stop_lon"])
        stop_lat = float(stop["stop_lat"])
        if isclose(shape_lon, stop_lon, abs_tol=tolerance) and isclose(shape_lat, stop_lat, abs_tol=tolerance):
            return {
                "stop_id": stop["parent_station"] if stop["parent_station"] else stop["stop_id"],
            }
    return None

def etl_process(shapes_file, stops_file, output_file):
    shapes = load_csv_to_dict(shapes_file)
    stops = load_csv_to_dict(stops_file)

    combined_data = []

    for shape in shapes:
        shape_pt_lon = float(shape["shape_pt_lon"])
        shape_pt_lat = float(shape["shape_pt_lat"])
        shape_data = {
            "shape_id": shape["shape_id"],
            "shape_pt_sequence": int(shape["shape_pt_sequence"]),
        }

        matching_stop = find_matching_stop(shape_pt_lon, shape_pt_lat, stops)
        if matching_stop:
            shape_data["stop_id"] = matching_stop["stop_id"]
        else:
            shape_data["stop_id"] = None

        combined_data.append(shape_data)

    with open(output_file, mode='w', encoding='utf-8') as json_file:
        json.dump(combined_data, json_file, indent=4, ensure_ascii=False)

etl_process('Ressources/shapes.txt', 'Ressources/stops.txt', 'shapes.json')
