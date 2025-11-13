"""Week management API routes."""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from backend.database.connection import get_db
from backend.database import crud
from backend.schemas import schemas

router = APIRouter(prefix="/weeks", tags=["weeks"])


@router.post("/", response_model=schemas.Week)
def create_week(week: schemas.WeekCreate, db: Session = Depends(get_db)):
    """Create a new week."""
    # Check if course exists
    course = crud.get_course(db, week.course_id)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    # Check if week number already exists for this course
    existing = crud.get_week_by_number(db, week.course_id, week.week_number)
    if existing:
        raise HTTPException(
            status_code=400,
            detail=f"Week {week.week_number} already exists for this course"
        )

    return crud.create_week(db, week)


@router.get("/course/{course_id}", response_model=List[schemas.Week])
def list_weeks_by_course(course_id: int, db: Session = Depends(get_db)):
    """List all weeks for a course."""
    return crud.get_weeks_by_course(db, course_id)


@router.get("/{week_id}", response_model=schemas.Week)
def get_week(week_id: int, db: Session = Depends(get_db)):
    """Get a specific week."""
    week = crud.get_week(db, week_id)
    if not week:
        raise HTTPException(status_code=404, detail="Week not found")
    return week


@router.put("/{week_id}", response_model=schemas.Week)
def update_week(week_id: int, week: schemas.WeekUpdate, db: Session = Depends(get_db)):
    """Update a week."""
    updated_week = crud.update_week(db, week_id, week)
    if not updated_week:
        raise HTTPException(status_code=404, detail="Week not found")
    return updated_week


@router.delete("/{week_id}")
def delete_week(week_id: int, db: Session = Depends(get_db)):
    """Delete a week."""
    success = crud.delete_week(db, week_id)
    if not success:
        raise HTTPException(status_code=404, detail="Week not found")
    return {"message": "Week deleted successfully"}
