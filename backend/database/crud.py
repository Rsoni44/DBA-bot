"""CRUD operations for database models."""

from sqlalchemy.orm import Session
from typing import List, Optional
from backend.database import models
from backend.schemas import schemas


# ==================== Course CRUD ====================

def create_course(db: Session, course: schemas.CourseCreate) -> models.Course:
    """Create a new course."""
    db_course = models.Course(**course.model_dump())
    db.add(db_course)
    db.commit()
    db.refresh(db_course)
    return db_course


def get_course(db: Session, course_id: int) -> Optional[models.Course]:
    """Get a course by ID."""
    return db.query(models.Course).filter(models.Course.id == course_id).first()


def get_courses(db: Session, skip: int = 0, limit: int = 100) -> List[models.Course]:
    """Get all courses."""
    return db.query(models.Course).offset(skip).limit(limit).all()


def get_active_courses(db: Session) -> List[models.Course]:
    """Get all active courses."""
    return db.query(models.Course).filter(models.Course.is_active == True).all()


def update_course(db: Session, course_id: int, course: schemas.CourseUpdate) -> Optional[models.Course]:
    """Update a course."""
    db_course = get_course(db, course_id)
    if db_course:
        update_data = course.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_course, key, value)
        db.commit()
        db.refresh(db_course)
    return db_course


def delete_course(db: Session, course_id: int) -> bool:
    """Delete a course."""
    db_course = get_course(db, course_id)
    if db_course:
        db.delete(db_course)
        db.commit()
        return True
    return False


# ==================== Week CRUD ====================

def create_week(db: Session, week: schemas.WeekCreate) -> models.Week:
    """Create a new week."""
    db_week = models.Week(**week.model_dump())
    db.add(db_week)
    db.commit()
    db.refresh(db_week)
    return db_week


def get_week(db: Session, week_id: int) -> Optional[models.Week]:
    """Get a week by ID."""
    return db.query(models.Week).filter(models.Week.id == week_id).first()


def get_weeks_by_course(db: Session, course_id: int) -> List[models.Week]:
    """Get all weeks for a course."""
    return db.query(models.Week).filter(models.Week.course_id == course_id).order_by(models.Week.week_number).all()


def get_week_by_number(db: Session, course_id: int, week_number: int) -> Optional[models.Week]:
    """Get a specific week by course and week number."""
    return db.query(models.Week).filter(
        models.Week.course_id == course_id,
        models.Week.week_number == week_number
    ).first()


def update_week(db: Session, week_id: int, week: schemas.WeekUpdate) -> Optional[models.Week]:
    """Update a week."""
    db_week = get_week(db, week_id)
    if db_week:
        update_data = week.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_week, key, value)
        db.commit()
        db.refresh(db_week)
    return db_week


def delete_week(db: Session, week_id: int) -> bool:
    """Delete a week."""
    db_week = get_week(db, week_id)
    if db_week:
        db.delete(db_week)
        db.commit()
        return True
    return False


# ==================== General Instruction CRUD ====================

def create_general_instruction(db: Session, instruction: schemas.GeneralInstructionCreate) -> models.GeneralInstruction:
    """Create a new general instruction."""
    db_instruction = models.GeneralInstruction(**instruction.model_dump())
    db.add(db_instruction)
    db.commit()
    db.refresh(db_instruction)
    return db_instruction


def get_general_instruction(db: Session, instruction_id: int) -> Optional[models.GeneralInstruction]:
    """Get a general instruction by ID."""
    return db.query(models.GeneralInstruction).filter(models.GeneralInstruction.id == instruction_id).first()


def get_general_instructions(db: Session, instruction_type: Optional[models.InstructionType] = None) -> List[models.GeneralInstruction]:
    """Get all general instructions, optionally filtered by type."""
    query = db.query(models.GeneralInstruction).filter(models.GeneralInstruction.is_active == True)
    if instruction_type:
        query = query.filter(models.GeneralInstruction.instruction_type == instruction_type)
    return query.all()


def update_general_instruction(db: Session, instruction_id: int, instruction: schemas.GeneralInstructionUpdate) -> Optional[models.GeneralInstruction]:
    """Update a general instruction."""
    db_instruction = get_general_instruction(db, instruction_id)
    if db_instruction:
        update_data = instruction.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_instruction, key, value)
        db.commit()
        db.refresh(db_instruction)
    return db_instruction


def delete_general_instruction(db: Session, instruction_id: int) -> bool:
    """Delete a general instruction."""
    db_instruction = get_general_instruction(db, instruction_id)
    if db_instruction:
        db.delete(db_instruction)
        db.commit()
        return True
    return False


# ==================== Week Instruction CRUD ====================

def create_week_instruction(db: Session, instruction: schemas.WeekInstructionCreate) -> models.WeekInstruction:
    """Create a new week instruction."""
    db_instruction = models.WeekInstruction(**instruction.model_dump())
    db.add(db_instruction)
    db.commit()
    db.refresh(db_instruction)
    return db_instruction


def get_week_instruction(db: Session, instruction_id: int) -> Optional[models.WeekInstruction]:
    """Get a week instruction by ID."""
    return db.query(models.WeekInstruction).filter(models.WeekInstruction.id == instruction_id).first()


def get_week_instructions(db: Session, week_id: int) -> List[models.WeekInstruction]:
    """Get all instructions for a week."""
    return db.query(models.WeekInstruction).filter(models.WeekInstruction.week_id == week_id).all()


def update_week_instruction(db: Session, instruction_id: int, instruction: schemas.WeekInstructionUpdate) -> Optional[models.WeekInstruction]:
    """Update a week instruction."""
    db_instruction = get_week_instruction(db, instruction_id)
    if db_instruction:
        update_data = instruction.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_instruction, key, value)
        db.commit()
        db.refresh(db_instruction)
    return db_instruction


def delete_week_instruction(db: Session, instruction_id: int) -> bool:
    """Delete a week instruction."""
    db_instruction = get_week_instruction(db, instruction_id)
    if db_instruction:
        db.delete(db_instruction)
        db.commit()
        return True
    return False


# ==================== Document CRUD ====================

def create_document(db: Session, document: schemas.DocumentBase) -> models.Document:
    """Create a new document."""
    db_document = models.Document(**document.model_dump())
    db.add(db_document)
    db.commit()
    db.refresh(db_document)
    return db_document


def get_document(db: Session, document_id: int) -> Optional[models.Document]:
    """Get a document by ID."""
    return db.query(models.Document).filter(models.Document.id == document_id).first()


def get_documents(db: Session, course_id: Optional[int] = None) -> List[models.Document]:
    """Get all documents, optionally filtered by course."""
    query = db.query(models.Document)
    if course_id is not None:
        query = query.filter(models.Document.course_id == course_id)
    return query.all()


def update_document(db: Session, document_id: int, document: schemas.DocumentUpdate) -> Optional[models.Document]:
    """Update a document."""
    db_document = get_document(db, document_id)
    if db_document:
        update_data = document.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_document, key, value)
        db.commit()
        db.refresh(db_document)
    return db_document


def delete_document(db: Session, document_id: int) -> bool:
    """Delete a document."""
    db_document = get_document(db, document_id)
    if db_document:
        db.delete(db_document)
        db.commit()
        return True
    return False


# ==================== Generated Post CRUD ====================

def create_generated_post(db: Session, post: schemas.GeneratedPostCreate) -> models.GeneratedPost:
    """Create a new generated post."""
    db_post = models.GeneratedPost(**post.model_dump())
    db.add(db_post)
    db.commit()
    db.refresh(db_post)
    return db_post


def get_generated_post(db: Session, post_id: int) -> Optional[models.GeneratedPost]:
    """Get a generated post by ID."""
    return db.query(models.GeneratedPost).filter(models.GeneratedPost.id == post_id).first()


def get_generated_posts_by_week(db: Session, week_id: int) -> List[models.GeneratedPost]:
    """Get all generated posts for a week."""
    return db.query(models.GeneratedPost).filter(models.GeneratedPost.week_id == week_id).all()


def update_generated_post(db: Session, post_id: int, post: schemas.GeneratedPostUpdate) -> Optional[models.GeneratedPost]:
    """Update a generated post."""
    db_post = get_generated_post(db, post_id)
    if db_post:
        update_data = post.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_post, key, value)
        db.commit()
        db.refresh(db_post)
    return db_post


def delete_generated_post(db: Session, post_id: int) -> bool:
    """Delete a generated post."""
    db_post = get_generated_post(db, post_id)
    if db_post:
        db.delete(db_post)
        db.commit()
        return True
    return False
