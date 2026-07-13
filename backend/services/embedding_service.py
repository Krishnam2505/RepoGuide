import os
from langchain_huggingface import HuggingFaceEndpointEmbeddings
from config import settings

def get_embedding_function():
    return HuggingFaceEndpointEmbeddings(
        model="sentence-transformers/all-MiniLM-L6-v2",
        task="feature-extraction",
        huggingfacehub_api_token=os.getenv("HF_TOKEN")
    )
