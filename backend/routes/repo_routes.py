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
        
    # Guardrail: Prioritize code files and cap at 25 files to stay safely within Render 512MB RAM
    MAX_FILES = 25
    if len(files) > MAX_FILES:
        code_exts = ('.py', '.js', '.jsx', '.ts', '.tsx', '.go', '.java', '.cpp', '.c')
        files = sorted(files, key=lambda f: (0 if f["path"].endswith(code_exts) else 1))
        files = files[:MAX_FILES]
        
    # 4. Chunk the valid files
    print(f"Step 3: Chunking {len(files)} files...")
    chunks = chunk_repo_files(files)
    
    # Guardrail: Cap chunks at 25 max so that even multiple ingests stay strictly within Gemini free quota (100/min)
    MAX_CHUNKS = 25
    if len(chunks) > MAX_CHUNKS:
        chunks = chunks[:MAX_CHUNKS]
        
    # Free temporary memory
    import gc
    gc.collect()
        
    # 5. Embed and store the chunks
    print(f"Step 4: Embedding and storing {len(chunks)} chunks in FAISS (this may take a moment)...")
    try:
        build_vectorstore(repo_name, chunks)
    except Exception as e:
        error_msg = str(e)
        if "RESOURCE_EXHAUSTED" in error_msg or "429" in error_msg:
            raise HTTPException(
                status_code=429, 
                detail="Gemini API rate limit reached (free tier allows 100 chunks/minute). Please wait 45 seconds and try again."
            )
        print(f"Error during vectorstore build: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to generate embeddings: {error_msg}")
        
    gc.collect()
    print("--- Ingest Complete! ---")
    
    # 6. Return the success response using our Pydantic schema
    return IngestResponse(
        repo_name=repo_name,
        file_count=len(files),
        chunk_count=len(chunks),
        message=f"Successfully ingested {len(files)} files into {len(chunks)} chunks"
    )
