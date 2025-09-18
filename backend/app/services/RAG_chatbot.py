import os
import requests
from pymongo import MongoClient
from dotenv import load_dotenv
load_dotenv()

# === CONFIG ===
HF_API_KEY = os.getenv("HF_API_KEY")   # HuggingFace API Key
MONGO_URI = os.getenv("MONGO_URL")     # MongoDB Atlas URI
DB_NAME = "hidden_gems"
COLLECTION_NAME = "knowledge_base"
INDEX_NAME = "chat"  # name of your vector search index in Atlas

# === CONNECT TO MONGO ===
client = MongoClient(MONGO_URI)
db = client[DB_NAME]
collection = db[COLLECTION_NAME]


# === EMBEDDING FUNCTION ===
def get_embedding(query: str) -> list:
    """
    Get embeddings for the query from HuggingFace Inference API.
    Model: all-MiniLM-L6-v2 (384-dim)
    """
    print("[get_embedding] Generating embedding for query...")
    API_URL = (
        "https://router.huggingface.co/hf-inference/models/sentence-transformers/all-MiniLM-L6-v2/pipeline/feature-extraction"
    )
    headers = {
        "Authorization": f"Bearer {HF_API_KEY}",
    }
    response = requests.post(API_URL, headers=headers, json={"inputs": query})

    if response.status_code != 200:
        raise Exception(f"HF API error: {response.status_code} - {response.text}")

    embedding = response.json()
    #HuggingFace sometimes wraps in [[...]] → flatten if needed
    if isinstance(embedding[0], list):
        embedding = embedding[0]
    return embedding


# === VECTOR SEARCH FUNCTION ===
def search_similar_documents(query: str, top_k: int = 3):
    """
    Search MongoDB Atlas vector index for top_k similar documents
    given a query string and fetch their full content.
    """
    # Step 1: Get embedding for query
    query_embedding = get_embedding(query)

    # Step 2: Run vector search using $vectorSearch
    pipeline = [
        {
            "$vectorSearch": {
                "index": INDEX_NAME,
                "queryVector": query_embedding,
                "path": "embedding",
                "numCandidates": 50,
                "limit": top_k
            }
        },
        {
            "$project": {
                "_id": 1,
                "score": {"$meta": "vectorSearchScore"}
            }
        }
    ]

    # Get search results with scores
    search_results = list(collection.aggregate(pipeline))
    
    # Step 3: Fetch full documents for each result
    enhanced_results = []
    for result in search_results:
        doc = collection.find_one({"_id": result["_id"]})
        if doc:
            enhanced_results.append({
                "_id": result["_id"],
                "score": result["score"],
                "text": doc.get("text", ""),  # Get the text field
                "chunk": doc.get("chunk", "")  # Get the chunk field as backup
            })
            
    return enhanced_results


# === DOCUMENT RETRIEVAL BY ID ===
def get_document_by_id(doc_id: str):
    """
    Retrieve a document from MongoDB by its _id
    """
    from bson import ObjectId
    try:
        doc = collection.find_one({"_id": ObjectId(doc_id)})
        return doc
    except Exception as e:
        print(f"Error retrieving document: {e}")
        return None

# === USAGE ===
if __name__ == "__main__":
    # Example 1: Vector search
    print("\n=== Vector Search Example ===")
    query = "I want funding"
    results = search_similar_documents(query, top_k=3)
    
    for idx, doc in enumerate(results, start=1):
        print(f"\nResult {idx}:")
        print(f"ID: {doc['_id']}")
        print(f"Score: {doc['score']:.4f}")
        # Try to get text field first, if not available use chunk
        content = doc.get('text') or doc.get('chunk')
        print(f"Content: {content}")
    
