# DBA-Bot

An AI-powered assistant for DBA (Doctor of Business Administration) students, designed to help with weekly coursework, discussion posts, and assignments using doctoral-level expertise powered by Claude (Anthropic).

## Overview

DBA-Bot helps busy DBA students manage their coursework by:
- **Generating discussion posts** that integrate learning outcomes and course materials
- **Creating reflective journal entries** with thoughtful analysis
- **Drafting peer responses** that add value to class discussions
- **Accessing course materials** through semantic search (RAG - Retrieval-Augmented Generation)
- **Managing courses and weekly content** in a streamlined interface

## Features

### Core Capabilities
- 📚 **Course Management**: Organize courses, weeks, and assignments
- 📄 **Document Processing**: Upload PDF textbooks and course materials with automatic indexing
- ✍️ **Content Generation**: AI-powered discussion posts, reflective journals, and peer responses
- 🔍 **RAG Integration**: Semantic search through course materials for relevant citations
- 🎯 **Learning Outcomes Integration**: Automatically ties responses to weekly learning objectives
- ✨ **Content Refinement**: Iteratively improve generated content with natural language requests
- 📝 **General Instructions**: Reusable templates for consistent writing style

### Tech Stack

**Backend:**
- FastAPI (Python)
- SQLAlchemy ORM with SQLite
- ChromaDB for vector embeddings
- Anthropic Claude Sonnet 4.5
- PDF processing (PyPDF2, pdfplumber)

**Frontend:**
- React 18 + TypeScript
- Vite for fast development
- Tailwind CSS for styling
- React Router for navigation
- Axios for API communication

## Project Structure

```
DBA-bot/
├── backend/
│   ├── api/                 # API routes
│   │   ├── courses.py
│   │   ├── weeks.py
│   │   ├── instructions.py
│   │   ├── documents.py
│   │   └── chat.py
│   ├── database/            # Database layer
│   │   ├── models.py       # SQLAlchemy models
│   │   ├── crud.py         # CRUD operations
│   │   └── connection.py   # DB connection
│   ├── schemas/            # Pydantic schemas
│   ├── services/           # Business logic
│   │   ├── dba_agent_service.py
│   │   ├── pdf_processor.py
│   │   └── vector_store.py
│   └── main.py             # FastAPI app
├── frontend/
│   └── src/
│       ├── api/            # API client
│       ├── components/     # React components
│       ├── pages/          # Page components
│       ├── types/          # TypeScript types
│       └── App.tsx
├── config/                 # Configuration
├── data/                   # Course materials storage
└── uploads/                # Uploaded documents
```

## Prerequisites

- Python 3.9 or higher
- Node.js 18 or higher
- Anthropic API key ([Get one here](https://console.anthropic.com/))

## Setup Instructions

### 1. Clone the repository

```bash
git clone <repository-url>
cd DBA-bot
```

### 2. Backend Setup

```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Linux/Mac:
source venv/bin/activate
# On Windows:
venv\Scripts\activate

# Install Python dependencies
pip install -r requirements.txt

# Configure environment variables
cp .env.example .env
```

Edit `.env` and add your Anthropic API key:

```
ANTHROPIC_API_KEY=your_actual_api_key_here
```

### 3. Frontend Setup

```bash
cd frontend

# Install Node dependencies
npm install

# Configure frontend environment (optional)
cp .env.example .env
```

## Running the Application

You need to run both the backend and frontend servers.

### Terminal 1: Backend Server

```bash
# From project root, with venv activated
python -m uvicorn backend.main:app --reload

# Backend will run on http://localhost:8000
# API docs available at http://localhost:8000/docs
```

### Terminal 2: Frontend Dev Server

```bash
# From project root
cd frontend
npm run dev

# Frontend will run on http://localhost:5173
```

Open your browser to `http://localhost:5173`

## Usage Guide

### Initial Setup (One-time)

1. **Create a Course**
   - Navigate to "Courses" page
   - Click "+ New" to create your DBA course
   - Fill in course name, semester, year, etc.

2. **Upload Course Materials**
   - Go to "Documents" page
   - Upload PDF textbooks and course materials
   - Documents are automatically processed and indexed for semantic search

3. **Set General Instructions**
   - Visit "Instructions" page
   - Add general guidelines for discussion posts, reflective journals, etc.
   - These apply to all weeks and ensure consistent style

4. **Create Weeks**
   - In "Courses" page, select your course
   - Add weeks 1-8
   - For each week, paste:
     - Learning outcomes
     - Discussion question and requirements
     - Reflective journal question and requirements

### Weekly Workflow

1. **Navigate to Week Workspace**
   - Click "Week Workspace" in navigation
   - Select the current week

2. **Generate Discussion Post**
   - Ensure learning outcomes and questions are filled in
   - Select "Discussion Post" type
   - (Optional) Add additional context
   - Click "Generate Content"
   - AI will create a post integrating learning outcomes and citing course materials

3. **Refine if Needed**
   - Type refinement requests like:
     - "Make it more analytical"
     - "Add more examples from Chapter 3"
     - "Shorten to 500 words"
   - Click "Refine"

4. **Copy and Submit**
   - Click "Copy to Clipboard"
   - Paste into your course platform

5. **Generate Peer Responses**
   - Change type to "Peer Response"
   - Paste classmate's post in "Additional Context"
   - Generate and refine as needed

6. **Reflective Journal**
   - Select "Reflective Journal" type
   - Generate content
   - Refine and copy

## API Documentation

Once the backend is running, visit `http://localhost:8000/docs` for interactive API documentation (Swagger UI).

### Key Endpoints

- **Courses**: `/courses/` - CRUD operations for courses
- **Weeks**: `/weeks/` - Manage weekly content
- **Documents**: `/documents/upload` - Upload and index PDFs
- **Instructions**: `/instructions/general` - Manage general guidelines
- **Chat**: `/chat/generate` - Generate content
- **Chat**: `/chat/refine` - Refine existing content

## Development

### Running Tests

```bash
pytest
```

### Code Quality

Backend follows:
- PEP 8 style guidelines
- Type hints for better IDE support
- Modular architecture with separation of concerns

Frontend follows:
- TypeScript for type safety
- Component-based architecture
- Clean, maintainable code structure

## Troubleshooting

### Backend Issues

**Database errors:**
```bash
# Delete and recreate database
rm dba_bot.db
python -m uvicorn backend.main:app --reload
```

**Import errors:**
```bash
# Ensure you're in the project root and venv is activated
pwd  # Should show /path/to/DBA-bot
which python  # Should show venv/bin/python
```

### Frontend Issues

**Module not found:**
```bash
cd frontend
npm install
```

**API connection errors:**
- Ensure backend is running on port 8000
- Check `.env` file has correct API URL

## Roadmap

- [x] Core backend with FastAPI
- [x] Database models and CRUD operations
- [x] PDF processing and vector embeddings
- [x] RAG-powered content generation
- [x] React frontend with TypeScript
- [x] Course and week management
- [x] Document upload and indexing
- [x] Week workspace for content generation
- [ ] User authentication
- [ ] Multiple user support
- [ ] Export to Word/PDF
- [ ] Analytics and usage tracking
- [ ] Mobile responsive improvements

## Contributing

This is a personal project for DBA students. If you'd like to contribute or adapt for your own use, feel free to fork the repository.

## License

(To be determined)

## Support

For issues or questions, please open an issue on GitHub.

---

**Built with Claude Code** - An AI pair programming tool by Anthropic
