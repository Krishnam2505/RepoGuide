from pydantic import BaseModel
from typing import List

# Used by the POST /api/repo/ingest endpoint to receive the GitHub URL
class IngestRequest(BaseModel):
    repo_url: str

# Used by the POST /api/repo/ingest endpoint to return success statistics
class IngestResponse(BaseModel):
    repo_name: str
    file_count: int
    chunk_count: int
    message: str

# Used by the POST /api/chat endpoint to receive the user's question
class ChatRequest(BaseModel):
    repo_name: str
    question: str

# Used by the POST /api/chat endpoint to return the AI's answer and file sources
class ChatResponse(BaseModel):
    answer: str
    sources: List[str]

# Used by the GET /api/repo/{repo_name}/files endpoint to populate the UI file tree
class FileTreeResponse(BaseModel):
    repo_name: str
    files: List[str]
