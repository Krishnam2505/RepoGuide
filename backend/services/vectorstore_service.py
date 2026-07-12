import os
from langchain_community.vectorstores import FAISS
from services.embedding_service import get_embedding_function
from config import settings

def build_vectorstore(repo_name: str, chunks: list[dict]):
    """
    Creates (or overwrites) a FAISS index named after repo_name.
    Persist directory: os.path.join(settings.CHROMA_PERSIST_DIR, repo_name)
    """
    persist_directory = os.path.join(settings.CHROMA_PERSIST_DIR, repo_name)
    embedding = get_embedding_function()
    
    texts = [c["text"] for c in chunks]
    metadatas = [c["metadata"] for c in chunks]
    # FAISS does not natively take string IDs in from_texts as easily as Chroma in older versions, 
    # but we can pass them in the metadatas or rely on FAISS internal mapping.
    
    vectorstore = FAISS.from_texts(
        texts=texts,
        embedding=embedding,
        metadatas=metadatas
    )
    
    # Save the FAISS index to disk
    vectorstore.save_local(persist_directory)
    
    return vectorstore

def load_vectorstore(repo_name: str):
    """
    Loads an EXISTING FAISS index for a repo that was already ingested.
    """
    persist_directory = os.path.join(settings.CHROMA_PERSIST_DIR, repo_name)
    embedding = get_embedding_function()
    
    # allow_dangerous_deserialization is required for FAISS in newer Langchain versions
    vectorstore = FAISS.load_local(
        folder_path=persist_directory, 
        embeddings=embedding,
        allow_dangerous_deserialization=True
    )
    
    return vectorstore
