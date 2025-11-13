"""Enhanced DBA agent service with RAG capabilities."""

from anthropic import Anthropic
from config.config import Config
from backend.services.vector_store import VectorStore
from backend.database import crud, models
from backend.database.models import InstructionType
from sqlalchemy.orm import Session
from typing import List, Dict, Optional


class DBAAgentService:
    """Enhanced DBA agent with access to course materials and instructions."""

    def __init__(self, vector_store: VectorStore):
        """
        Initialize the DBA agent service.

        Args:
            vector_store: VectorStore instance for document retrieval
        """
        Config.validate()
        self.client = Anthropic(api_key=Config.ANTHROPIC_API_KEY)
        self.model = Config.ANTHROPIC_MODEL
        self.max_tokens = Config.MAX_TOKENS
        self.temperature = Config.TEMPERATURE
        self.vector_store = vector_store

    def _retrieve_relevant_content(
        self,
        query: str,
        course_id: Optional[int] = None,
        n_results: int = 5
    ) -> List[Dict[str, any]]:
        """
        Retrieve relevant content from course materials.

        Args:
            query: Search query
            course_id: Optional course ID to filter results
            n_results: Number of results to retrieve

        Returns:
            List of relevant document chunks
        """
        return self.vector_store.search(
            query=query,
            n_results=n_results,
            course_id=course_id
        )

    def _build_context(
        self,
        db: Session,
        week_id: int,
        post_type: InstructionType,
        additional_context: Optional[str] = None
    ) -> Dict[str, any]:
        """
        Build context for generation from database.

        Args:
            db: Database session
            week_id: Week ID
            post_type: Type of post to generate
            additional_context: Additional user-provided context

        Returns:
            Dictionary with all relevant context
        """
        # Get week data
        week = crud.get_week(db, week_id)
        if not week:
            raise ValueError(f"Week with ID {week_id} not found")

        # Get course data
        course = crud.get_course(db, week.course_id)

        # Get general instructions for this post type
        general_instructions = crud.get_general_instructions(db, post_type)

        # Get week-specific instructions
        week_instructions = crud.get_week_instructions(db, week_id)
        week_specific = [inst for inst in week_instructions if inst.instruction_type == post_type]

        return {
            "course": course,
            "week": week,
            "general_instructions": general_instructions,
            "week_instructions": week_specific,
            "additional_context": additional_context
        }

    def _build_system_prompt(self, context: Dict[str, any], post_type: InstructionType) -> str:
        """
        Build system prompt based on context.

        Args:
            context: Context dictionary
            post_type: Type of post

        Returns:
            System prompt string
        """
        week = context["week"]
        course = context["course"]

        base_prompt = f"""You are a doctoral-level business administration expert helping a DBA student.

Course: {course.name if course else 'N/A'}
Week {week.week_number}: {week.title if week.title else 'N/A'}

Learning Outcomes for this week:
{week.learning_outcomes if week.learning_outcomes else 'Not specified'}
"""

        # Add general instructions
        if context["general_instructions"]:
            base_prompt += "\n\nGeneral Guidelines:\n"
            for instruction in context["general_instructions"]:
                base_prompt += f"\n{instruction.title}:\n{instruction.content}\n"

        # Add week-specific instructions
        if context["week_instructions"]:
            base_prompt += "\n\nWeek-Specific Instructions:\n"
            for instruction in context["week_instructions"]:
                base_prompt += f"{instruction.content}\n"

        # Add post-type specific guidance
        if post_type == InstructionType.DISCUSSION_POST:
            base_prompt += f"""
Your task: Generate a thoughtful discussion post that addresses the following question:

{week.discussion_question if week.discussion_question else 'Not specified'}

Requirements:
{week.discussion_requirements if week.discussion_requirements else 'Not specified'}

Ensure your response:
- Directly integrates the learning outcomes
- Demonstrates doctoral-level critical thinking
- Includes relevant citations from course materials when available
- Is well-structured and professionally written
"""
        elif post_type == InstructionType.REFLECTIVE_JOURNAL:
            base_prompt += f"""
Your task: Generate a reflective journal entry that addresses:

{week.reflective_question if week.reflective_question else 'Not specified'}

Requirements:
{week.reflective_requirements if week.reflective_requirements else 'Not specified'}

Ensure your response:
- Connects personal experiences with learning outcomes
- Shows deep reflection and insight
- Demonstrates application of concepts
- Is authentic and thoughtful
"""
        elif post_type == InstructionType.PEER_RESPONSE:
            base_prompt += """
Your task: Generate a thoughtful response to a classmate's post.

Ensure your response:
- Engages meaningfully with their ideas
- Adds value to the discussion
- References course concepts and learning outcomes
- Is respectful and constructive
- Demonstrates doctoral-level discourse
"""

        return base_prompt

    def generate_post(
        self,
        db: Session,
        week_id: int,
        post_type: InstructionType,
        additional_context: Optional[str] = None,
        use_rag: bool = True
    ) -> Dict[str, any]:
        """
        Generate a discussion post or reflective journal.

        Args:
            db: Database session
            week_id: Week ID
            post_type: Type of post to generate
            additional_context: Additional context (e.g., classmate's post for peer response)
            use_rag: Whether to use RAG for retrieving course materials

        Returns:
            Dictionary with generated content and sources
        """
        # Build context from database
        context = self._build_context(db, week_id, post_type, additional_context)

        # Build system prompt
        system_prompt = self._build_system_prompt(context, post_type)

        # Build user message
        user_message = ""
        if additional_context:
            user_message += f"Additional context:\n{additional_context}\n\n"

        # Retrieve relevant content from course materials if RAG is enabled
        sources = []
        if use_rag:
            week = context["week"]
            search_query = f"{week.learning_outcomes or ''} {week.discussion_question or ''} {week.reflective_question or ''}"

            relevant_chunks = self._retrieve_relevant_content(
                query=search_query,
                course_id=week.course_id,
                n_results=5
            )

            if relevant_chunks:
                user_message += "Relevant course material:\n\n"
                for i, chunk in enumerate(relevant_chunks, 1):
                    user_message += f"[Source {i}] {chunk['metadata'].get('filename', 'Unknown')} "
                    user_message += f"(Page {chunk['metadata'].get('page_number', 'N/A')})\n"
                    user_message += f"{chunk['text']}\n\n"
                    sources.append(chunk['metadata'])

        user_message += "Please generate the response based on the above information."

        # Generate response using Claude
        messages = [{"role": "user", "content": user_message}]

        response = self.client.messages.create(
            model=self.model,
            max_tokens=self.max_tokens,
            temperature=self.temperature,
            system=system_prompt,
            messages=messages
        )

        generated_content = response.content[0].text

        return {
            "content": generated_content,
            "sources": sources,
            "context_used": {
                "learning_outcomes": context["week"].learning_outcomes,
                "general_instructions_count": len(context["general_instructions"]),
                "week_instructions_count": len(context["week_instructions"])
            }
        }

    def refine_post(
        self,
        original_content: str,
        refinement_request: str,
        context: Optional[str] = None
    ) -> str:
        """
        Refine an existing post based on user feedback.

        Args:
            original_content: Original generated content
            refinement_request: User's refinement request
            context: Optional additional context

        Returns:
            Refined content
        """
        system_prompt = """You are a doctoral-level business administration expert helping refine academic writing.
Your task is to improve the given content based on the user's specific request while maintaining academic rigor and professionalism."""

        user_message = f"""Original content:
{original_content}

Refinement request:
{refinement_request}
"""

        if context:
            user_message += f"\nAdditional context:\n{context}"

        user_message += "\n\nPlease provide the refined version."

        messages = [{"role": "user", "content": user_message}]

        response = self.client.messages.create(
            model=self.model,
            max_tokens=self.max_tokens,
            temperature=self.temperature,
            system=system_prompt,
            messages=messages
        )

        return response.content[0].text
