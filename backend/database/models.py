"""Database models for DBA-bot."""

from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Boolean, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from backend.database.connection import Base
import enum


class InstructionType(str, enum.Enum):
    """Types of instructions."""
    DISCUSSION_POST = "discussion_post"
    REFLECTIVE_JOURNAL = "reflective_journal"
    PEER_RESPONSE = "peer_response"
    ASSIGNMENT = "assignment"


class Course(Base):
    """Course model - represents an 8-week course."""

    __tablename__ = "courses"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    code = Column(String(50), nullable=True)
    semester = Column(String(50), nullable=False)  # e.g., "Semester 2"
    year = Column(Integer, nullable=False)
    start_date = Column(DateTime, nullable=True)
    end_date = Column(DateTime, nullable=True)
    description = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    # Relationships
    weeks = relationship("Week", back_populates="course", cascade="all, delete-orphan")
    documents = relationship("Document", back_populates="course", cascade="all, delete-orphan")


class Week(Base):
    """Week model - represents a week within a course."""

    __tablename__ = "weeks"

    id = Column(Integer, primary_key=True, index=True)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)
    week_number = Column(Integer, nullable=False)  # 1-8
    title = Column(String(255), nullable=True)
    learning_outcomes = Column(Text, nullable=True)
    discussion_question = Column(Text, nullable=True)
    discussion_requirements = Column(Text, nullable=True)
    reflective_question = Column(Text, nullable=True)
    reflective_requirements = Column(Text, nullable=True)
    assignment_description = Column(Text, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    # Relationships
    course = relationship("Course", back_populates="weeks")
    instructions = relationship("WeekInstruction", back_populates="week", cascade="all, delete-orphan")
    generated_posts = relationship("GeneratedPost", back_populates="week", cascade="all, delete-orphan")


class GeneralInstruction(Base):
    """General instruction model - reusable templates for all weeks."""

    __tablename__ = "general_instructions"

    id = Column(Integer, primary_key=True, index=True)
    instruction_type = Column(Enum(InstructionType), nullable=False)
    title = Column(String(255), nullable=False)
    content = Column(Text, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())


class WeekInstruction(Base):
    """Week-specific instruction model."""

    __tablename__ = "week_instructions"

    id = Column(Integer, primary_key=True, index=True)
    week_id = Column(Integer, ForeignKey("weeks.id"), nullable=False)
    instruction_type = Column(Enum(InstructionType), nullable=False)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    # Relationships
    week = relationship("Week", back_populates="instructions")


class Document(Base):
    """Document model - uploaded PDF metadata."""

    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=True)  # Null if general resource
    title = Column(String(255), nullable=False)
    filename = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    document_type = Column(String(50), nullable=True)  # e.g., "textbook", "article", "case_study"
    page_count = Column(Integer, nullable=True)
    is_indexed = Column(Boolean, default=False)  # Whether it's been processed for ChromaDB
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    # Relationships
    course = relationship("Course", back_populates="documents")


class GeneratedPost(Base):
    """Generated post model - stores AI-generated content for history."""

    __tablename__ = "generated_posts"

    id = Column(Integer, primary_key=True, index=True)
    week_id = Column(Integer, ForeignKey("weeks.id"), nullable=False)
    post_type = Column(Enum(InstructionType), nullable=False)
    prompt = Column(Text, nullable=False)  # User's original prompt/context
    generated_content = Column(Text, nullable=False)
    final_content = Column(Text, nullable=True)  # After refinements
    is_submitted = Column(Boolean, default=False)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    # Relationships
    week = relationship("Week", back_populates="generated_posts")
