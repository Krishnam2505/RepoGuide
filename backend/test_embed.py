import os
from dotenv import load_dotenv
load_dotenv()
from langchain_google_genai import GoogleGenerativeAIEmbeddings
try:
    embedding = GoogleGenerativeAIEmbeddings(model="models/text-embedding-004", google_api_key=os.getenv("GEMINI_API_KEY"))
    res = embedding.embed_query("hello")
    print("SUCCESS", len(res))
except Exception as e:
    import traceback
    traceback.print_exc()
