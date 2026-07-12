from fastapi import APIRouter, HTTPException
from models.schemas import ChatRequest, ChatResponse
from services.rag_service import answer_question

router = APIRouter()

@router.post("/api/chat", response_model=ChatResponse)
def chat_with_repo(request: ChatRequest):
    """
    Receives a question about a specific repository, retrieves the relevant code
    chunks from the vector database, and uses the AI to generate an answer.
    """
    try:
        # We pass the repo_name and the question to our RAG service orchestrator.
        # It handles loading the database, searching, building the prompt, and calling Gemini.
        result = answer_question(repo_name=request.repo_name, question=request.question)
        
        # We return the data matching our Pydantic ChatResponse schema
        return ChatResponse(
            answer=result["answer"],
            sources=result["sources"]
        )
    except ValueError as e:
        import traceback
        traceback.print_exc()
        # ValueError is specifically raised by Chroma if the directory doesn't exist
        # which means the user is trying to chat with a repo they haven't ingested yet.
        raise HTTPException(
            status_code=404, 
            detail="Repo not found. Please ingest it first via /api/repo/ingest"
        )
    except Exception as e:
        import traceback
        traceback.print_exc()
        # Catch any other unexpected errors (like Gemini API timeouts)
        raise HTTPException(
            status_code=500,
            detail=f"An error occurred while generating the answer: {str(e)}"
        )
