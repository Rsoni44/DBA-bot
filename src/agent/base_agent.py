"""Base agent class for DBA-bot."""

from anthropic import Anthropic
from config.config import Config


class DBAAgent:
    """Base class for business expert agent."""

    def __init__(self, api_key: str = None):
        """
        Initialize the DBA agent.

        Args:
            api_key: Anthropic API key. If not provided, uses Config.ANTHROPIC_API_KEY
        """
        Config.validate()
        self.client = Anthropic(api_key=api_key or Config.ANTHROPIC_API_KEY)
        self.model = Config.ANTHROPIC_MODEL
        self.max_tokens = Config.MAX_TOKENS
        self.temperature = Config.TEMPERATURE

    def generate_response(self, prompt: str, system_prompt: str = None) -> str:
        """
        Generate a response from the agent.

        Args:
            prompt: User's input prompt
            system_prompt: Optional system prompt to set agent behavior

        Returns:
            Agent's response as a string
        """
        messages = [{"role": "user", "content": prompt}]

        kwargs = {
            "model": self.model,
            "max_tokens": self.max_tokens,
            "temperature": self.temperature,
            "messages": messages,
        }

        if system_prompt:
            kwargs["system"] = system_prompt

        response = self.client.messages.create(**kwargs)
        return response.content[0].text

    def chat(self, message: str) -> str:
        """
        Simple chat interface.

        Args:
            message: User's message

        Returns:
            Agent's response
        """
        system_prompt = """You are a doctoral-level business administration expert with deep knowledge across:
        - Strategic management and business strategy
        - Financial analysis and corporate finance
        - Marketing and market analysis
        - Operations management
        - Organizational behavior and leadership
        - Business ethics and governance
        - Quantitative methods and business analytics

        Provide thorough, evidence-based analysis and recommendations.
        Support your answers with frameworks, examples, and best practices."""

        return self.generate_response(message, system_prompt)
