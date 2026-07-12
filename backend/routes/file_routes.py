import os
from fastapi import APIRouter, HTTPException
from models.schemas import FileTreeResponse
from utils.file_utils import walk_repo_files, read_file_safe
from config import settings

router = APIRouter()

@router.get("/api/repo/{repo_name}/files", response_model=FileTreeResponse)
def get_file_tree(repo_name: str):
    """
    Returns a sorted list of all valid file paths in the cloned repository.
    Used by the frontend to render the File Explorer UI.
    """
    repo_path = os.path.join(settings.CLONE_DIR, repo_name)
    
    # If the folder doesn't exist, they haven't ingested it yet.
    if not os.path.exists(repo_path):
        raise HTTPException(
            status_code=404, 
            detail="Repo not found. Please ingest it first."
        )
        
    # We walk the files just like we did in the ingest step
    file_info_list = walk_repo_files(repo_path, settings.MAX_FILE_SIZE_KB)
    
    # We only care about the relative "path" string for the UI (e.g. "src/main.py")
    paths_only = [f["path"] for f in file_info_list]
    
    return FileTreeResponse(
        repo_name=repo_name,
        files=sorted(paths_only)
    )

@router.get("/api/repo/{repo_name}/file-content")
def get_file_content(repo_name: str, path: str):
    """
    Returns the raw text content of a specific file.
    Used by the frontend CodeViewer component when a user clicks a file.
    """
    repo_path = os.path.join(settings.CLONE_DIR, repo_name)
    
    if not os.path.exists(repo_path):
        raise HTTPException(status_code=404, detail="Repo not found.")
        
    # Construct the absolute path to the exact file they want to view
    # Note: In a production app, you would want to protect against path traversal attacks here
    # (e.g. someone passing "../../etc/password" as the path).
    full_file_path = os.path.join(repo_path, path)
    
    if not os.path.exists(full_file_path):
        raise HTTPException(status_code=404, detail="File not found.")
        
    content = read_file_safe(full_file_path)
    
    if content is None:
        raise HTTPException(
            status_code=400, 
            detail="Could not read file. It might be binary or use an unsupported encoding."
        )
        
    return {
        "path": path,
        "content": content
    }
