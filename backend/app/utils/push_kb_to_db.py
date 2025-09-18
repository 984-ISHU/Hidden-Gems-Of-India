import json
from pymongo import MongoClient
import os
from dotenv import load_dotenv
load_dotenv()
global MONGO_URI, DB_NAME, COLLECTION_NAME, JSON_FILE_PATH
MONGO_URI = os.getenv("MONGO_URL")
COLLECTION_NAME = "knowledge_base"
DB_NAME = "hidden_gems"

def load_json_to_mongo():
    # Connect to MongoDB
    client = MongoClient(MONGO_URI)
    db = client[DB_NAME]
    collection = db[COLLECTION_NAME]

    # Load JSON file
    with open(JSON_FILE_PATH, "r", encoding="utf-8") as f:
        data = json.load(f)

    # Ensure list of documents
    if isinstance(data, dict):
        data = [data]

    # Insert into MongoDB
    result = collection.insert_many(data)
    print(f"Inserted {len(result.inserted_ids)} documents into '{DB_NAME}.{COLLECTION_NAME}'")
    
if __name__ == "__main__":
    JSON_FILE_PATH = "../../notebooks/output_embeddings_list.json"  
    load_dotenv()
    
    for i in range(1, 7):
        JSON_FILE_PATH = os.path.join("../../notebooks", f"output_embeddings_list_{i}.json")
        if not os.path.exists(JSON_FILE_PATH):
            print(f"File not found: {JSON_FILE_PATH}")
            continue
        print(f"Inserting from {JSON_FILE_PATH} ...")
        load_json_to_mongo()
    # import json
    # import os

    # # Directory where your files are located
    # NOTEBOOKS_DIR = "../../notebooks"

    # # Process files named output_embeddings (1).json to output_embeddings (6).json
    # for i in range(1, 7):
    #     input_filename = f"output_embeddings ({i}).json"
    #     output_filename = f"output_embeddings_list_{i}.json"
    #     input_path = os.path.join(NOTEBOOKS_DIR, input_filename)
    #     output_path = os.path.join(NOTEBOOKS_DIR, output_filename)

    #     if not os.path.exists(input_path):
    #         print(f"File not found: {input_path}")
    #         continue

    #     with open(input_path, "r", encoding="utf-8") as f:
    #         data = json.load(f)

    #     # If data is a dict, convert to list of values
    #     if isinstance(data, dict):
    #         data = list(data.values())

    #     with open(output_path, "w", encoding="utf-8") as f:
    #         json.dump(data, f, indent=2, ensure_ascii=False)

    #     print(f"Converted {input_filename} to {output_filename}")