"""Course management API routes."""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from backend.database.connection import get_db
from backend.database import crud
from backend.schemas import schemas

router = APIRouter(prefix="/courses", tags=["courses"])


@router.post("/", response_model=schemas.Course)
def create_course(course: schemas.CourseCreate, db: Session = Depends(get_db)):
    """Create a new course."""
    return crud.create_course(db, course)


@router.get("/", response_model=List[schemas.Course])
def list_courses(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """List all courses."""
    return crud.get_courses(db, skip=skip, limit=limit)


@router.get("/active", response_model=List[schemas.Course])
def list_active_courses(db: Session = Depends(get_db)):
    """List all active courses."""
    return crud.get_active_courses(db)


@router.get("/{course_id}", response_model=schemas.Course)
def get_course(course_id: int, db: Session = Depends(get_db)):
    """Get a specific course."""
    course = crud.get_course(db, course_id)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    return course


@router.put("/{course_id}", response_model=schemas.Course)
def update_course(course_id: int, course: schemas.CourseUpdate, db: Session = Depends(get_db)):
    """Update a course."""
    updated_course = crud.update_course(db, course_id, course)
    if not updated_course:
        raise HTTPException(status_code=404, detail="Course not found")
    return updated_course


@router.delete("/{course_id}")
def delete_course(course_id: int, db: Session = Depends(get_db)):
    """Delete a course."""
    success = crud.delete_course(db, course_id)
    if not success:
        raise HTTPException(status_code=404, detail="Course not found")
    return {"message": "Course deleted successfully"}
