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
    
    load_json_to_mongo()   
    # import json

    # with open("../../notebooks/output_embeddings.json", "r", encoding="utf-8") as f:
    #     data = json.load(f)

    # # If data is a dict, convert to list of values
    # if isinstance(data, dict):
    #     data = list(data.values())

    # with open("output_embeddings_list.json", "w", encoding="utf-8") as f:
    #     json.dump(data, f, indent=2, ensure_ascii=False)

    # print("Converted to list of JSON objects in output_embeddings_list.json") 