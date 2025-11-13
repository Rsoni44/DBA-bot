"""Instruction management API routes."""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from backend.database.connection import get_db
from backend.database import crud, models
from backend.schemas import schemas

router = APIRouter(prefix="/instructions", tags=["instructions"])


# ==================== General Instructions ====================

@router.post("/general", response_model=schemas.GeneralInstruction)
def create_general_instruction(
    instruction: schemas.GeneralInstructionCreate,
    db: Session = Depends(get_db)
):
    """Create a new general instruction."""
    return crud.create_general_instruction(db, instruction)


@router.get("/general", response_model=List[schemas.GeneralInstruction])
def list_general_instructions(
    instruction_type: Optional[models.InstructionType] = None,
    db: Session = Depends(get_db)
):
    """List all general instructions, optionally filtered by type."""
    return crud.get_general_instructions(db, instruction_type)


@router.get("/general/{instruction_id}", response_model=schemas.GeneralInstruction)
def get_general_instruction(instruction_id: int, db: Session = Depends(get_db)):
    """Get a specific general instruction."""
    instruction = crud.get_general_instruction(db, instruction_id)
    if not instruction:
        raise HTTPException(status_code=404, detail="General instruction not found")
    return instruction


@router.put("/general/{instruction_id}", response_model=schemas.GeneralInstruction)
def update_general_instruction(
    instruction_id: int,
    instruction: schemas.GeneralInstructionUpdate,
    db: Session = Depends(get_db)
):
    """Update a general instruction."""
    updated = crud.update_general_instruction(db, instruction_id, instruction)
    if not updated:
        raise HTTPException(status_code=404, detail="General instruction not found")
    return updated


@router.delete("/general/{instruction_id}")
def delete_general_instruction(instruction_id: int, db: Session = Depends(get_db)):
    """Delete a general instruction."""
    success = crud.delete_general_instruction(db, instruction_id)
    if not success:
        raise HTTPException(status_code=404, detail="General instruction not found")
    return {"message": "General instruction deleted successfully"}


# ==================== Week-Specific Instructions ====================

@router.post("/week", response_model=schemas.WeekInstruction)
def create_week_instruction(
    instruction: schemas.WeekInstructionCreate,
    db: Session = Depends(get_db)
):
    """Create a new week-specific instruction."""
    # Check if week exists
    week = crud.get_week(db, instruction.week_id)
    if not week:
        raise HTTPException(status_code=404, detail="Week not found")

    return crud.create_week_instruction(db, instruction)


@router.get("/week/{week_id}", response_model=List[schemas.WeekInstruction])
def list_week_instructions(week_id: int, db: Session = Depends(get_db)):
    """List all instructions for a specific week."""
    return crud.get_week_instructions(db, week_id)


@router.get("/week/instruction/{instruction_id}", response_model=schemas.WeekInstruction)
def get_week_instruction(instruction_id: int, db: Session = Depends(get_db)):
    """Get a specific week instruction."""
    instruction = crud.get_week_instruction(db, instruction_id)
    if not instruction:
        raise HTTPException(status_code=404, detail="Week instruction not found")
    return instruction


@router.put("/week/instruction/{instruction_id}", response_model=schemas.WeekInstruction)
def update_week_instruction(
    instruction_id: int,
    instruction: schemas.WeekInstructionUpdate,
    db: Session = Depends(get_db)
):
    """Update a week instruction."""
    updated = crud.update_week_instruction(db, instruction_id, instruction)
    if not updated:
        raise HTTPException(status_code=404, detail="Week instruction not found")
    return updated


@router.delete("/week/instruction/{instruction_id}")
def delete_week_instruction(instruction_id: int, db: Session = Depends(get_db)):
    """Delete a week instruction."""
    success = crud.delete_week_instruction(db, instruction_id)
    if not success:
        raise HTTPException(status_code=404, detail="Week instruction not found")
    return {"message": "Week instruction deleted successfully"}
