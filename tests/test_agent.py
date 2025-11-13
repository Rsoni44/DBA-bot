"""Tests for DBA agent."""

import pytest
from unittest.mock import Mock, patch
from src.agent.base_agent import DBAAgent


class TestDBAAgent:
    """Test cases for DBA agent."""

    @patch('src.agent.base_agent.Anthropic')
    def test_agent_initialization(self, mock_anthropic):
        """Test agent initializes correctly."""
        agent = DBAAgent(api_key="test_key")
        assert agent.client is not None
        assert agent.model is not None

    @patch('src.agent.base_agent.Anthropic')
    def test_generate_response(self, mock_anthropic):
        """Test response generation."""
        # Mock the API response
        mock_response = Mock()
        mock_response.content = [Mock(text="Test response")]
        mock_anthropic.return_value.messages.create.return_value = mock_response

        agent = DBAAgent(api_key="test_key")
        response = agent.generate_response("Test prompt")

        assert response == "Test response"
        mock_anthropic.return_value.messages.create.assert_called_once()


if __name__ == "__main__":
    pytest.main([__file__])
