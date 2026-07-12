from langchain_google_genai import GoogleGenerativeAIEmbeddings
from config import settings

def get_embedding_function():
    """
    Returns a configured GoogleGenerativeAIEmbeddings instance using the Gemini API.
    This offloads the ML processing to Google's servers, saving hundreds of MBs of RAM
    and allowing the application to run smoothly on free-tier hosting platforms.
    """
    return GoogleGenerativeAIEmbeddings(
        model="models/embedding-001",
        google_api_key=settings.GEMINI_API_KEY
    )
