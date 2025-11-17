# Local Setup Instructions for DBA-Bot

## Prerequisites
- Python 3.9 or higher
- Node.js 18 or higher
- Git

## Step-by-Step Setup

### 1. Clone the Repository (if not already done)
```bash
git clone https://github.com/Rsoni44/DBA-bot.git
cd DBA-bot
```

### 2. Backend Setup

```bash
# Create and activate virtual environment
python -m venv venv

# On Mac/Linux:
source venv/bin/activate

# On Windows:
venv\Scripts\activate

# Install all dependencies
pip install -r requirements.txt

# Create .env file with your actual API key
# Edit .env and replace 'your_api_key_here' with your real Anthropic API key
```

**Important:** Get your Anthropic API key from https://console.anthropic.com/

Your `.env` file should look like:
```
ANTHROPIC_API_KEY=sk-ant-api03-xxxxxxxxxxxxx  # Your actual key here
ANTHROPIC_MODEL=claude-sonnet-4-5-20250929
MAX_TOKENS=4096
TEMPERATURE=0.7
LOG_LEVEL=INFO
DEBUG=False
```

### 3. Frontend Setup

Open a **new terminal window** and navigate to the frontend directory:

```bash
cd DBA-bot/frontend

# Install Node dependencies
npm install
```

### 4. Start the Application

You need **two terminal windows** running simultaneously:

**Terminal 1 - Backend Server:**
```bash
# Make sure you're in DBA-bot/ directory with venv activated
cd DBA-bot
source venv/bin/activate  # or venv\Scripts\activate on Windows
python -m uvicorn backend.main:app --reload

# You should see:
# INFO:     Uvicorn running on http://127.0.0.1:8000
```

**Terminal 2 - Frontend Dev Server:**
```bash
# From DBA-bot/frontend directory
cd DBA-bot/frontend
npm run dev

# You should see:
# VITE vX.X.X  ready in XXX ms
# ➜  Local:   http://localhost:5173/
```

### 5. Access the Application

Open your web browser and go to:
```
http://localhost:5173
```

You should see the DBA-Bot dashboard!

## Troubleshooting

### Backend Issues

**"Module not found" errors:**
```bash
# Make sure virtual environment is activated
which python  # Should show path to venv/bin/python

# Reinstall dependencies
pip install -r requirements.txt
```

**Database errors:**
```bash
# Delete and recreate database
rm dba_bot.db
# Restart backend server - it will recreate the database
```

**API key errors:**
- Verify your `.env` file has the correct API key
- Make sure there are no extra spaces or quotes around the key

### Frontend Issues

**"Cannot connect to backend":**
- Ensure backend server is running on port 8000
- Check console for CORS errors
- Verify `.env` in frontend has `VITE_API_BASE_URL=http://localhost:8000`

**Module not found:**
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

## First-Time Usage

Once the application is running:

1. **Create a Course** - Go to "Courses" page and add your current DBA course
2. **Upload Documents** - Go to "Documents" and upload your PDF textbooks
3. **Set General Instructions** - Visit "Instructions" to add writing guidelines
4. **Create Weeks** - In "Courses", add weeks 1-8 with learning outcomes and questions
5. **Use Week Workspace** - This is your main weekly tool for generating content

## Notes

- The application stores data locally in `dba_bot.db` (SQLite database)
- Uploaded PDFs are stored in the `uploads/` directory
- Vector embeddings are stored in the `chroma_db/` directory
- All data stays on your local machine for privacy
