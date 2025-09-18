import os
import requests
import google.generativeai as genai
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

# === CONFIG ===
HF_API_KEY = os.getenv("HF_API_KEY")
MONGO_URI = os.getenv("MONGO_URL")
DB_NAME = "hidden_gems"
COLLECTION_NAME = "knowledge_base"
INDEX_NAME = "chat"

# Gemini setup
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=GEMINI_API_KEY)

client = MongoClient(MONGO_URI)
db = client[DB_NAME]
collection = db[COLLECTION_NAME]


# === EMBEDDING FUNCTION ===
def get_embedding(query: str) -> list:
    """
    Generate 384-dim embedding using HuggingFace API
    """
    print("[get_embedding] Generating embedding for query...")
    API_URL = (
        "https://router.huggingface.co/hf-inference/models/"
        "sentence-transformers/all-MiniLM-L6-v2/pipeline/feature-extraction"
    )
    headers = {"Authorization": f"Bearer {HF_API_KEY}"}
    response = requests.post(API_URL, headers=headers, json={"inputs": query})

    if response.status_code != 200:
        raise Exception(f"HF API error: {response.status_code} - {response.text}")

    embedding = response.json()
    if isinstance(embedding[0], list):  # Flatten if [[...]]
        embedding = embedding[0]
    return embedding


# === VECTOR SEARCH ===
def search_similar_documents(query: str, top_k: int = 3):
    """
    Search MongoDB Atlas vector index for top_k similar documents
    """
    query_embedding = get_embedding(query)

    pipeline = [
        {
            "$vectorSearch": {
                "index": INDEX_NAME,
                "queryVector": query_embedding,
                "path": "embedding",
                "numCandidates": 50,
                "limit": top_k,
            }
        },
        {"$project": {"_id": 1, "score": {"$meta": "vectorSearchScore"}}},
    ]

    results = list(collection.aggregate(pipeline))

    enhanced = []
    for result in results:
        doc = collection.find_one({"_id": result["_id"]})
        if doc:
            enhanced.append(
                {
                    "_id": result["_id"],
                    "score": result["score"],
                    "text": doc.get("text") or doc.get("chunk") or "",
                }
            )
    return enhanced


# === GEMINI CALL ===
def call_gemini_rag(query: str, context_texts: list) -> str:
    """
    Use Gemini 2.0 Flash to answer the query using context.
    """
    model = genai.GenerativeModel("gemini-2.0-flash")

    # Combine retrieved docs into a context string
    context = "\n\n".join(context_texts)

    prompt = f"""
You are a helpful assistant. Use the provided context to answer the question.
If the context is not enough, say you don't know.

Context:
{context}

Question: {query}
Answer:
"""

    response = model.generate_content(prompt)
    return response.text


# === RAG PIPELINE ===
def rag_answer(query: str, top_k: int = 3):
    retrieved = search_similar_documents(query, top_k=top_k)
    context_texts = [r["text"] for r in retrieved]
    answer = call_gemini_rag(query, context_texts)
    return {"query": query, "retrieved": retrieved, "answer": answer}


# === USAGE ===
# if __name__ == "__main__":
#     user_query = "I want funding for my artisan business"
#     result = rag_answer(user_query)

#     print("\n--- Retrieved Context ---")
#     for i, r in enumerate(result["retrieved"], start=1):
#         print(f"\nChunk {i} (score {r['score']:.4f}):")
#         print(r["text"])

#     print("\n--- Gemini Answer ---")
#     print(result["answer"])
