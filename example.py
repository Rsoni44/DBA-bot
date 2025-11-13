"""Example usage of DBA-bot agent."""

from src.agent.base_agent import DBAAgent


def main():
    """Run a simple example."""
    # Initialize the agent
    agent = DBAAgent()

    # Example query
    query = "What are the key components of a SWOT analysis and when should it be used?"

    print("Query:", query)
    print("\nAgent Response:")
    print("-" * 80)

    # Get response
    response = agent.chat(query)
    print(response)


if __name__ == "__main__":
    main()
