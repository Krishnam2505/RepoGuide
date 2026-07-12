from fastapi import APIRouter, HTTPException
from models.schemas import IngestRequest, IngestResponse
from services.git_service import get_repo_name, clone_repo
from utils.file_utils import walk_repo_files
from services.chunking_service import chunk_repo_files
from services.vectorstore_service import build_vectorstore
from config import settings

router = APIRouter()

@router.post("/api/repo/ingest", response_model=IngestResponse)
def ingest_repo(request: IngestRequest):
    """
    Takes a GitHub URL, clones it, walks the files, chunks the text, 
    and saves the embeddings to the Chroma vector database.
    """
    print(f"--- Starting Ingest for: {request.repo_url} ---")
    
    # 1. Figure out the safe folder name
    repo_name = get_repo_name(request.repo_url)
    
    # 2. Clone the repository
    print(f"Step 1: Cloning repository to {repo_name}...")
    try:
        repo_path = clone_repo(request.repo_url)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
        
    # 3. Walk the files to filter out junk
    print("Step 2: Walking repository files...")
    files = walk_repo_files(repo_path, settings.MAX_FILE_SIZE_KB)
    
    if len(files) == 0:
        raise HTTPException(status_code=400, detail="No supported source files found in this repo")
        
    # 4. Chunk the valid files
    print(f"Step 3: Chunking {len(files)} files...")
    chunks = chunk_repo_files(files)
    
    # 5. Embed and store the chunks
    print(f"Step 4: Embedding and storing {len(chunks)} chunks in ChromaDB (this may take a moment)...")
    build_vectorstore(repo_name, chunks)
    
    print("--- Ingest Complete! ---")
    
    # 6. Return the success response using our Pydantic schema
    return IngestResponse(
        repo_name=repo_name,
        file_count=len(files),
        chunk_count=len(chunks),
        message=f"Successfully ingested {len(files)} files into {len(chunks)} chunks"
    )
