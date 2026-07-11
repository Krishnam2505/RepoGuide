import os
import shutil
import git
from git.exc import GitCommandError
from config import settings

def get_repo_name(repo_url: str) -> str:
    """
    Returns just the folder name derived from the repo URL, without cloning.
    Example: 'https://github.com/user/repo.git' -> 'user_repo'
    """
    # Strip trailing slashes and the .git suffix
    clean_url = repo_url.strip().rstrip('/')
    if clean_url.endswith('.git'):
        clean_url = clean_url[:-4]
        
    # Split the url and grab the last two parts (user and repo)
    parts = clean_url.split('/')
    if len(parts) >= 2:
        return f"{parts[-2]}_{parts[-1]}"
    
    # Fallback if the URL structure is unexpected
    return parts[-1]

def clone_repo(repo_url: str) -> str:
    """
    Clones a public GitHub repo into settings.CLONE_DIR.
    Returns the local path where it was cloned.
    """
    folder_name = get_repo_name(repo_url)
    target_path = os.path.join(settings.CLONE_DIR, folder_name)
    
    # We do this for idempotency — if the folder already exists (e.g., from a previous run),
    # we delete it entirely so we always start with a fresh, clean clone without throwing an error.
    if os.path.exists(target_path):
        shutil.rmtree(target_path)
        
    try:
        # depth=1 performs a "shallow clone". We only need the current files to read the code.
        # We do not need the entire git history (thousands of commits), which would take far 
        # longer to download and use way more disk space.
        git.Repo.clone_from(repo_url, target_path, depth=1)
    except GitCommandError as e:
        raise ValueError("Could not clone repo. Check the URL is a valid public GitHub repository.")
        
    return target_path
