import os
from langchain_community.vectorstores import Chroma
from services.embedding_service import get_embedding_function
from config import settings

def build_vectorstore(repo_name: str, chunks: list[dict]):
    """
    Creates (or overwrites) a Chroma collection named after repo_name.
    Persist directory: os.path.join(settings.CHROMA_PERSIST_DIR, repo_name)
    """
    persist_directory = os.path.join(settings.CHROMA_PERSIST_DIR, repo_name)
    embedding = get_embedding_function()
    
    texts = [c["text"] for c in chunks]
    metadatas = [c["metadata"] for c in chunks]
    ids = [c["id"] for c in chunks]
    
    # We persist the database to the local disk. 
    # Why? If the FastAPI server restarts, repos that were already ingested 
    # don't need to be re-cloned, re-chunked, and re-embedded. This saves 
    # massive amounts of API costs and time. It acts as a caching layer.
    vectorstore = Chroma.from_texts(
        texts=texts,
        metadatas=metadatas,
        ids=ids,
        embedding=embedding,
        persist_directory=persist_directory
    )
    
    return vectorstore

def load_vectorstore(repo_name: str):
    """
    Loads an EXISTING Chroma collection for a repo that was already ingested
    (so we don't have to re-embed on every single chat message — only on first ingest).
    """
    persist_directory = os.path.join(settings.CHROMA_PERSIST_DIR, repo_name)
    embedding = get_embedding_function()
    
    vectorstore = Chroma(
        persist_directory=persist_directory, 
        embedding_function=embedding
    )
    
    return vectorstore
