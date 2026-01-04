import os
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from src.api.main import api_router 
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

app = FastAPI(title="My Chess")
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

frontend_path = os.path.join(os.path.dirname(__file__), "../client/dist")
print("Serving frontend from:", frontend_path)

app.mount("/", StaticFiles(directory=frontend_path, html=True), name="frontend")

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("server.main:app", host="0.0.0.0", port=port)
