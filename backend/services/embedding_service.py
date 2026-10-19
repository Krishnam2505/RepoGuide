from langchain_google_genai import GoogleGenerativeAIEmbeddings
from config import settings

def get_embedding_function():
    """
    Uses Google's official Gemini embedding model (gemini-embedding-001).
    - 0 MB server RAM overhead (prevents Render 512MB Memory Limit Exceeded).
    - Fast, free, and batched in a single API call (stays well below 15 RPM).
    """
    return GoogleGenerativeAIEmbeddings(
        model="models/gemini-embedding-001",
        google_api_key=settings.GEMINI_API_KEY
    )


