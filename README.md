# DBA-Bot

An AI agent with doctoral-level expertise in business administration, powered by Claude (Anthropic).

## Overview

DBA-Bot is designed to provide expert-level business analysis, strategic insights, and decision support across various business domains.

## Project Structure

```
DBA-bot/
├── src/
│   ├── agent/          # Core agent logic and orchestration
│   ├── knowledge/      # Business knowledge base and retrieval
│   ├── tools/          # Business analysis tools and calculators
│   ├── prompts/        # System prompts and templates
│   └── utils/          # Helper functions and utilities
├── data/
│   ├── case_studies/   # Business case studies
│   ├── frameworks/     # Business frameworks and methodologies
│   └── datasets/       # Business datasets and benchmarks
├── tests/              # Unit and integration tests
├── docs/               # Documentation
└── config/             # Configuration files
```

## Prerequisites

- Python 3.9 or higher
- Anthropic API key

## Setup Instructions

### 1. Clone the repository

```bash
git clone <repository-url>
cd DBA-bot
```

### 2. Create a virtual environment

```bash
python -m venv venv

# On Linux/Mac
source venv/bin/activate

# On Windows
venv\Scripts\activate
```

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

### 4. Configure environment variables

```bash
cp .env.example .env
```

Edit `.env` and add your Anthropic API key:

```
ANTHROPIC_API_KEY=your_actual_api_key_here
```

### 5. Verify setup

```bash
python -c "from config.config import Config; Config.validate(); print('Configuration valid!')"
```

## Usage

(Usage instructions will be added as features are implemented)

## Development

### Running tests

```bash
pytest
```

### Code structure

- Keep business logic in `src/agent/`
- Store reusable tools in `src/tools/`
- Maintain clean separation between data and code

## Tech Stack

- **LLM Provider**: Anthropic Claude (Sonnet 4.5)
- **Language**: Python 3.9+
- **Framework**: FastAPI (for API endpoints)
- **Data Processing**: Pandas, NumPy

## Roadmap

- [ ] Core agent framework
- [ ] Business analysis tools
- [ ] Knowledge base integration
- [ ] API endpoints
- [ ] Web interface

## License

(To be determined)

## Contributing

(Contribution guidelines to be added)
