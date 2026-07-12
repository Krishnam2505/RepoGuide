from langchain_text_splitters import RecursiveCharacterTextSplitter
from utils.file_utils import read_file_safe

def chunk_repo_files(files: list[dict]) -> list[dict]:
    """
    Takes the file list from walk_repo_files.
    For each file: reads its content, splits it into chunks, and returns a list of chunk dictionaries.
    """
    # Why chunk_overlap=150 matters:
    # If a file is long, it will be cut into multiple chunks. Without overlap, a function definition 
    # split exactly at the chunk boundary could have its signature in chunk 1 and its body in chunk 2. 
    # The AI wouldn't understand either chunk alone. Overlap ensures the end of chunk 1 and the 
    # start of chunk 2 share some of the same code, preserving context.
    #
    # Why separators are ordered this way:
    # The splitter tries each separator in order. By trying to split on function ("\ndef ", "\nfunction ")
    # or class ("\nclass ") boundaries FIRST, chunks naturally align with actual code structure,
    # rather than just randomly slicing through the middle of a line of code.
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=150,
        separators=["\nclass ", "\ndef ", "\nfunction ", "\n\n", "\n", " "]
    )
    
    all_chunks = []
    
    for file_info in files:
        relative_path = file_info["path"]
        full_path = file_info["full_path"]
        
        # Safely read the text content of the file
        content = read_file_safe(full_path)
        
        # If the file couldn't be read (e.g. it was a binary file), skip it
        if content is None:
            continue
            
        # Split the text content into a list of strings
        split_texts = text_splitter.split_text(content)
        
        # Convert those strings into our standardized chunk dictionary format
        for i, text_chunk in enumerate(split_texts):
            chunk_dict = {
                "id": f"{relative_path}::chunk_{i}",
                "text": text_chunk,
                "metadata": {
                    "file_path": relative_path,
                    "chunk_index": i
                }
            }
            all_chunks.append(chunk_dict)
            
    return all_chunks
