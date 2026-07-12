from langchain_huggingface import HuggingFaceEmbeddings
from config import settings

def get_embedding_function():
    """
    Returns a configured HuggingFaceEmbeddings instance using a fast local model (all-MiniLM-L6-v2).
    This completely bypasses all Gemini rate limits and is 100% free and unlimited.
    """
    return HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
