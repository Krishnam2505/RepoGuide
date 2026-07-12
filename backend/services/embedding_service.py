from langchain_google_genai import GoogleGenerativeAIEmbeddings
from config import settings

def get_embedding_function():
    """
    Returns a configured GoogleGenerativeAIEmbeddings instance using the Gemini API.
    This offloads the ML processing to Google, requiring virtually 0 MB of RAM on our server!
    """
    return GoogleGenerativeAIEmbeddings(
        model="models/embedding-001",
        google_api_key=settings.GEMINI_API_KEY
    )
