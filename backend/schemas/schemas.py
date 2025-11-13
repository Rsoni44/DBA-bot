"""Pydantic schemas for request/response validation."""

from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from backend.database.models import InstructionType


# ==================== Course Schemas ====================

class CourseBase(BaseModel):
    """Base course schema."""
    name: str
    code: Optional[str] = None
    semester: str
    year: int
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    description: Optional[str] = None
    is_active: bool = True


class CourseCreate(CourseBase):
    """Schema for creating a course."""
    pass


class CourseUpdate(BaseModel):
    """Schema for updating a course."""
    name: Optional[str] = None
    code: Optional[str] = None
    semester: Optional[str] = None
    year: Optional[int] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None


class Course(CourseBase):
    """Schema for course response."""
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ==================== Week Schemas ====================

class WeekBase(BaseModel):
    """Base week schema."""
    course_id: int
    week_number: int = Field(..., ge=1, le=8)
    title: Optional[str] = None
    learning_outcomes: Optional[str] = None
    discussion_question: Optional[str] = None
    discussion_requirements: Optional[str] = None
    reflective_question: Optional[str] = None
    reflective_requirements: Optional[str] = None
    assignment_description: Optional[str] = None


class WeekCreate(WeekBase):
    """Schema for creating a week."""
    pass


class WeekUpdate(BaseModel):
    """Schema for updating a week."""
    week_number: Optional[int] = Field(None, ge=1, le=8)
    title: Optional[str] = None
    learning_outcomes: Optional[str] = None
    discussion_question: Optional[str] = None
    discussion_requirements: Optional[str] = None
    reflective_question: Optional[str] = None
    reflective_requirements: Optional[str] = None
    assignment_description: Optional[str] = None


class Week(WeekBase):
    """Schema for week response."""
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ==================== General Instruction Schemas ====================

class GeneralInstructionBase(BaseModel):
    """Base general instruction schema."""
    instruction_type: InstructionType
    title: str
    content: str
    is_active: bool = True


class GeneralInstructionCreate(GeneralInstructionBase):
    """Schema for creating a general instruction."""
    pass


class GeneralInstructionUpdate(BaseModel):
    """Schema for updating a general instruction."""
    instruction_type: Optional[InstructionType] = None
    title: Optional[str] = None
    content: Optional[str] = None
    is_active: Optional[bool] = None


class GeneralInstruction(GeneralInstructionBase):
    """Schema for general instruction response."""
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ==================== Week Instruction Schemas ====================

class WeekInstructionBase(BaseModel):
    """Base week instruction schema."""
    week_id: int
    instruction_type: InstructionType
    content: str


class WeekInstructionCreate(WeekInstructionBase):
    """Schema for creating a week instruction."""
    pass


class WeekInstructionUpdate(BaseModel):
    """Schema for updating a week instruction."""
    instruction_type: Optional[InstructionType] = None
    content: Optional[str] = None


class WeekInstruction(WeekInstructionBase):
    """Schema for week instruction response."""
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ==================== Document Schemas ====================

class DocumentBase(BaseModel):
    """Base document schema."""
    course_id: Optional[int] = None
    title: str
    filename: str
    file_path: str
    document_type: Optional[str] = None
    page_count: Optional[int] = None
    is_indexed: bool = False


class DocumentCreate(BaseModel):
    """Schema for creating a document (used with file upload)."""
    course_id: Optional[int] = None
    title: str
    document_type: Optional[str] = None


class DocumentUpdate(BaseModel):
    """Schema for updating a document."""
    title: Optional[str] = None
    document_type: Optional[str] = None
    is_indexed: Optional[bool] = None


class Document(DocumentBase):
    """Schema for document response."""
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ==================== Generated Post Schemas ====================

class GeneratedPostBase(BaseModel):
    """Base generated post schema."""
    week_id: int
    post_type: InstructionType
    prompt: str
    generated_content: str
    final_content: Optional[str] = None
    is_submitted: bool = False


class GeneratedPostCreate(GeneratedPostBase):
    """Schema for creating a generated post."""
    pass


class GeneratedPostUpdate(BaseModel):
    """Schema for updating a generated post."""
    final_content: Optional[str] = None
    is_submitted: Optional[bool] = None


class GeneratedPost(GeneratedPostBase):
    """Schema for generated post response."""
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ==================== Chat/Generation Schemas ====================

class ChatRequest(BaseModel):
    """Schema for chat/generation request."""
    week_id: int
    post_type: InstructionType  # discussion_post, reflective_journal, peer_response
    context: Optional[str] = None  # Additional context (e.g., classmate's post for peer response)
    refinement_request: Optional[str] = None  # If refining existing content


class ChatResponse(BaseModel):
    """Schema for chat/generation response."""
    content: str
    sources_used: Optional[List[str]] = None  # Citations from course materials
    post_id: Optional[int] = None  # ID of saved generated post
