import os
from dotenv import load_dotenv

# Load variables from .env file into os.environ
load_dotenv()

class Settings:
    def __init__(self):
        # Read the environment variables, supplying sensible defaults where appropriate.
        self.PORT = int(os.getenv("PORT", 8000))
        
        # GEMINI_API_KEY is strictly required. If it's missing, we fail fast.
        self.GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
        if not self.GEMINI_API_KEY:
            raise ValueError("GEMINI_API_KEY is not set in .env")
            
        self.CHROMA_PERSIST_DIR = os.getenv("CHROMA_PERSIST_DIR", "./chroma_store")
        self.CLONE_DIR = os.getenv("CLONE_DIR", "./cloned_repos")
        self.MAX_FILE_SIZE_KB = int(os.getenv("MAX_FILE_SIZE_KB", 500))

# Instantiate it once so other files can just `from config import settings`
settings = Settings()
