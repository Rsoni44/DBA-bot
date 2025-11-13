"""Main FastAPI application."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.database.connection import init_db
from backend.api import courses, weeks, instructions, documents, chat

# Initialize database
init_db()

# Create FastAPI app
app = FastAPI(
    title="DBA-Bot API",
    description="AI-powered assistant for DBA coursework",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],  # React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(courses.router)
app.include_router(weeks.router)
app.include_router(instructions.router)
app.include_router(documents.router)
app.include_router(chat.router)


@app.get("/")
def root():
    """Root endpoint."""
    return {
        "message": "Welcome to DBA-Bot API",
        "version": "1.0.0",
        "docs": "/docs"
    }


@app.get("/health")
def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
