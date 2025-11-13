"""Chat and content generation API routes."""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.database.connection import get_db
from backend.database import crud
from backend.schemas import schemas
from backend.services.dba_agent_service import DBAAgentService
from backend.services.vector_store import VectorStore

router = APIRouter(prefix="/chat", tags=["chat"])

# Initialize services
vector_store = VectorStore()
agent_service = DBAAgentService(vector_store)


@router.post("/generate", response_model=schemas.ChatResponse)
def generate_content(request: schemas.ChatRequest, db: Session = Depends(get_db)):
    """
    Generate discussion post, reflective journal, or peer response.
    """
    # Verify week exists
    week = crud.get_week(db, request.week_id)
    if not week:
        raise HTTPException(status_code=404, detail="Week not found")

    try:
        # Generate content using the agent service
        result = agent_service.generate_post(
            db=db,
            week_id=request.week_id,
            post_type=request.post_type,
            additional_context=request.context,
            use_rag=True
        )

        # Save the generated post
        post_data = schemas.GeneratedPostCreate(
            week_id=request.week_id,
            post_type=request.post_type,
            prompt=request.context or "Generated from week data",
            generated_content=result["content"],
            final_content=None,
            is_submitted=False
        )

        saved_post = crud.create_generated_post(db, post_data)

        # Format sources for response
        sources_list = []
        if result.get("sources"):
            for source in result["sources"]:
                source_str = f"{source.get('filename', 'Unknown')} (Page {source.get('page_number', 'N/A')})"
                if source_str not in sources_list:
                    sources_list.append(source_str)

        return schemas.ChatResponse(
            content=result["content"],
            sources_used=sources_list if sources_list else None,
            post_id=saved_post.id
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating content: {str(e)}")


@router.post("/refine", response_model=schemas.ChatResponse)
def refine_content(
    post_id: int,
    refinement_request: str,
    db: Session = Depends(get_db)
):
    """
    Refine an existing generated post based on user feedback.
    """
    # Get the generated post
    post = crud.get_generated_post(db, post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Generated post not found")

    try:
        # Use the latest content (final_content if available, otherwise generated_content)
        current_content = post.final_content if post.final_content else post.generated_content

        # Refine the content
        refined_content = agent_service.refine_post(
            original_content=current_content,
            refinement_request=refinement_request,
            context=None
        )

        # Update the post with refined content
        crud.update_generated_post(
            db,
            post_id,
            schemas.GeneratedPostUpdate(final_content=refined_content)
        )

        return schemas.ChatResponse(
            content=refined_content,
            sources_used=None,
            post_id=post_id
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error refining content: {str(e)}")


@router.get("/posts/week/{week_id}", response_model=list[schemas.GeneratedPost])
def get_posts_by_week(week_id: int, db: Session = Depends(get_db)):
    """Get all generated posts for a specific week."""
    return crud.get_generated_posts_by_week(db, week_id)


@router.get("/posts/{post_id}", response_model=schemas.GeneratedPost)
def get_post(post_id: int, db: Session = Depends(get_db)):
    """Get a specific generated post."""
    post = crud.get_generated_post(db, post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Generated post not found")
    return post


@router.put("/posts/{post_id}/submit")
def mark_post_submitted(post_id: int, db: Session = Depends(get_db)):
    """Mark a post as submitted."""
    updated = crud.update_generated_post(
        db,
        post_id,
        schemas.GeneratedPostUpdate(is_submitted=True)
    )
    if not updated:
        raise HTTPException(status_code=404, detail="Generated post not found")
    return {"message": "Post marked as submitted"}


@router.delete("/posts/{post_id}")
def delete_post(post_id: int, db: Session = Depends(get_db)):
    """Delete a generated post."""
    success = crud.delete_generated_post(db, post_id)
    if not success:
        raise HTTPException(status_code=404, detail="Generated post not found")
    return {"message": "Post deleted successfully"}
