"""Document management and upload API routes."""

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional
import os
import shutil
from backend.database.connection import get_db
from backend.database import crud
from backend.schemas import schemas
from backend.services.pdf_processor import PDFProcessor
from backend.services.vector_store import VectorStore

router = APIRouter(prefix="/documents", tags=["documents"])

# Create uploads directory if it doesn't exist
UPLOAD_DIR = "./uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Initialize vector store
vector_store = VectorStore()


@router.post("/upload", response_model=schemas.Document)
async def upload_document(
    file: UploadFile = File(...),
    title: str = Form(...),
    course_id: Optional[int] = Form(None),
    document_type: Optional[str] = Form(None),
    db: Session = Depends(get_db)
):
    """
    Upload a PDF document and process it for the vector store.
    """
    # Validate file type
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")

    # Generate unique filename
    file_path = os.path.join(UPLOAD_DIR, file.filename)

    # Save file
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error saving file: {str(e)}")

    # Get page count
    try:
        page_count = PDFProcessor.get_page_count(file_path)
    except Exception as e:
        # Clean up file
        os.remove(file_path)
        raise HTTPException(status_code=500, detail=f"Error processing PDF: {str(e)}")

    # Create document record
    document_data = schemas.DocumentBase(
        course_id=course_id,
        title=title,
        filename=file.filename,
        file_path=file_path,
        document_type=document_type,
        page_count=page_count,
        is_indexed=False
    )

    document = crud.create_document(db, document_data)

    # Process and index the document in background
    # For now, we'll do it synchronously, but this could be moved to a background task
    try:
        # Extract and chunk the PDF
        chunks = PDFProcessor.extract_and_chunk(file_path)

        # Add to vector store
        vector_store.add_document(
            document_id=str(document.id),
            chunks=chunks,
            course_id=course_id
        )

        # Update document as indexed
        crud.update_document(
            db,
            document.id,
            schemas.DocumentUpdate(is_indexed=True)
        )
        document.is_indexed = True

    except Exception as e:
        # Log error but don't fail the upload
        print(f"Error indexing document: {str(e)}")

    return document


@router.get("/", response_model=List[schemas.Document])
def list_documents(
    course_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """List all documents, optionally filtered by course."""
    return crud.get_documents(db, course_id)


@router.get("/{document_id}", response_model=schemas.Document)
def get_document(document_id: int, db: Session = Depends(get_db)):
    """Get a specific document."""
    document = crud.get_document(db, document_id)
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    return document


@router.put("/{document_id}", response_model=schemas.Document)
def update_document(
    document_id: int,
    document: schemas.DocumentUpdate,
    db: Session = Depends(get_db)
):
    """Update document metadata."""
    updated = crud.update_document(db, document_id, document)
    if not updated:
        raise HTTPException(status_code=404, detail="Document not found")
    return updated


@router.delete("/{document_id}")
def delete_document(document_id: int, db: Session = Depends(get_db)):
    """Delete a document and its file."""
    document = crud.get_document(db, document_id)
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")

    # Delete from vector store
    vector_store.delete_document(str(document_id))

    # Delete file
    if os.path.exists(document.file_path):
        os.remove(document.file_path)

    # Delete from database
    crud.delete_document(db, document_id)

    return {"message": "Document deleted successfully"}


@router.post("/{document_id}/reindex")
def reindex_document(document_id: int, db: Session = Depends(get_db)):
    """Reindex a document in the vector store."""
    document = crud.get_document(db, document_id)
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")

    if not os.path.exists(document.file_path):
        raise HTTPException(status_code=404, detail="Document file not found")

    try:
        # Delete old embeddings
        vector_store.delete_document(str(document_id))

        # Extract and chunk the PDF
        chunks = PDFProcessor.extract_and_chunk(document.file_path)

        # Add to vector store
        vector_store.add_document(
            document_id=str(document.id),
            chunks=chunks,
            course_id=document.course_id
        )

        # Update document as indexed
        crud.update_document(
            db,
            document.id,
            schemas.DocumentUpdate(is_indexed=True)
        )

        return {"message": "Document reindexed successfully"}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error reindexing document: {str(e)}")
