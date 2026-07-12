from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from config import settings
from routes import repo_routes, chat_routes, file_routes

# Trigger uvicorn hot-reload
app = FastAPI(title="CodeChat API")
app.include_router(repo_routes.router)
app.include_router(chat_routes.router)
app.include_router(file_routes.router)

# Add CORS middleware allowing origin http://localhost:5173 with credentials
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow all origins so it works whether Vite is on 5173 or 5174
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def health_check():
    return {"message": "CodeChat API is running"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=settings.PORT, reload=True)
