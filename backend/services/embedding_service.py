from langchain_community.embeddings.fastembed import FastEmbedEmbeddings

def get_embedding_function():
    """
    Returns a configured FastEmbedEmbeddings instance using BAAI/bge-small-en-v1.5.
    - Lightweight ONNX runtime (no heavy PyTorch dependency, fits within 512MB RAM).
    - Runs 100% locally on CPU: zero API costs, zero rate limits, no token expiration.
    """
    return FastEmbedEmbeddings(model_name="BAAI/bge-small-en-v1.5")

