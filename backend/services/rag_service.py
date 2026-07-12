from langchain_google_genai import ChatGoogleGenerativeAI
from config import settings
from services.vectorstore_service import load_vectorstore

def answer_question(repo_name: str, question: str, chat_history: list[dict] = None) -> dict:
    """
    Retrieves the most relevant code chunks for the given question and uses
    Gemini to generate an answer based strictly on that code context.
    """
    # 1. Load the existing vector database for this specific repository
    vectorstore = load_vectorstore(repo_name)
    
    # 2. Retrieve the top chunks using MMR (Max Marginal Relevance).
    # MMR (k=8, fetch_k=20) fetches 20 chunks that are semantically similar,
    # and then optimizes to select 8 chunks that are both relevant AND diverse,
    # preventing the context from being flooded with redundant code from the same file.
    relevant_chunks = vectorstore.max_marginal_relevance_search(question, k=8, fetch_k=20)
    
    # 3. Build the context string
    # We prefix each chunk with its file path so the AI knows exactly what file it is looking at.
    context_pieces = []
    sources = set()
    
    for chunk in relevant_chunks:
        file_path = chunk.metadata.get("file_path", "Unknown File")
        sources.add(file_path)
        
        chunk_text = chunk.page_content # LangChain's Chroma wrapper stores text in page_content
        context_pieces.append(f"// File: {file_path}\n{chunk_text}")
        
    context_string = "\n\n".join(context_pieces)
    
    # 4. Build the strict prompt
    prompt = f"""You are a senior software engineer explaining a codebase to a teammate.
Use ONLY the following code context to answer. If the answer isn't in the
context, say so honestly instead of guessing.

CODE CONTEXT:
{context_string}

QUESTION: {question}

Answer clearly, and mention which file(s) your answer is based on.
"""

    # 5. Call the LLM to generate the answer
    llm = ChatGoogleGenerativeAI(
        model="gemini-flash-latest", # Using latest alias to automatically route to the supported free-tier flash model
        google_api_key=settings.GEMINI_API_KEY
    )
    
    response = llm.invoke(prompt)
    
    # 6. Return the answer AND the hard-coded sources list.
    # Why return sources separately? LLMs sometimes hallucinate (make up) file names, 
    # or they just forget to mention them in their prose even when explicitly told to. 
    # By returning the ground-truth sources from the retrieval step (the 'sources' list), 
    # the frontend UI can always show accurate citations regardless of what the LLM says in its paragraph.
    # Handle the fact that gemini-flash-latest may return a list of parts instead of a string
    answer_text = response.content
    if isinstance(answer_text, list) and len(answer_text) > 0 and isinstance(answer_text[0], dict):
        answer_text = answer_text[0].get("text", str(answer_text))
    elif not isinstance(answer_text, str):
        answer_text = str(answer_text)
        
    return {
        "answer": answer_text,
        "sources": list(sources)
    }
