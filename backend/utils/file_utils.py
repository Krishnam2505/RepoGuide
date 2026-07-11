import os

SUPPORTED_EXTENSIONS = ['.py', '.js', '.jsx', '.ts', '.tsx', '.java', '.go', '.rb', '.cpp', '.c', '.h', '.md', '.json']
IGNORED_DIRS = ['.git', 'node_modules', 'venv', '__pycache__', 'dist', 'build', '.next', 'vendor']

def walk_repo_files(repo_path: str, max_file_size_kb: int) -> list[dict]:
    """
    Walks repo_path recursively.
    Returns a list of dicts: [{ "path": relative_path, "full_path": absolute_path, "size_kb": float }]
    Skips: any directory in IGNORED_DIRS, files without a SUPPORTED_EXTENSIONS suffix,
    and files larger than max_file_size_kb (these are almost always generated/binary/lockfiles, not worth embedding).
    """
    valid_files = []
    
    for root, dirs, files in os.walk(repo_path):
        # Modify dirs in-place to prevent os.walk from even descending into ignored directories.
        # This is much more efficient than filtering them out later, because it saves us
        # from reading thousands of files in folders like node_modules or .git.
        dirs[:] = [d for d in dirs if d not in IGNORED_DIRS]
        
        for file in files:
            # Check if the file has a supported extension
            _, ext = os.path.splitext(file)
            if ext.lower() not in SUPPORTED_EXTENSIONS:
                continue
                
            full_path = os.path.join(root, file)
            
            try:
                # Get file size in KB
                size_bytes = os.path.getsize(full_path)
                size_kb = size_bytes / 1024.0
                
                # Skip huge files (usually minified bundles, lockfiles, or mislabeled binaries)
                if size_kb > max_file_size_kb:
                    continue
                    
                # Get the path relative to the repo root (for nice display in the UI later)
                relative_path = os.path.relpath(full_path, repo_path)
                
                valid_files.append({
                    "path": relative_path,
                    "full_path": full_path,
                    "size_kb": size_kb
                })
            except OSError:
                # In case the file is a broken symlink or permissions are missing, just skip it safely
                continue
                
    return valid_files

def read_file_safe(full_path: str) -> str | None:
    """
    Reads a file as UTF-8 text. Returns None (instead of crashing) if the file
    can't be decoded as text (e.g. it's actually a binary file with a misleading extension).
    """
    try:
        with open(full_path, 'r', encoding='utf-8') as f:
            return f.read()
    except (UnicodeDecodeError, OSError):
        return None
