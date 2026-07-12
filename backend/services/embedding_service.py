from langchain_google_genai import GoogleGenerativeAIEmbeddings
from config import settings

def get_embedding_function():
    """
    Returns a configured GoogleGenerativeAIEmbeddings instance using model
    "models/embedding-001" and settings.GEMINI_API_KEY.
    
    This is passed into Chroma so Chroma can embed both stored chunks AND
    incoming user queries with the exact same model. This is critical — mixing embedding
    models between storage and query time makes similarity search meaningless.
    """
    return GoogleGenerativeAIEmbeddings(
        model="models/text-embedding-004",
        google_api_key=settings.GEMINI_API_KEY
    )
