# Security Scanner Backend

This is the backend service for the Security Scanner application, which scans GitHub repositories for security vulnerabilities using tools like Bandit and Semgrep.

## Features

- Scan GitHub repositories for security vulnerabilities
- Support for Python (Bandit) and multiple languages (Semgrep)
- AI-powered fix suggestions using Google's Gemini API
- Asynchronous scanning with background tasks
- RESTful API with FastAPI
- SQLite/PostgreSQL database support

## Prerequisites

- Python 3.8+
- Git
- Bandit
- Semgrep
- PostgreSQL (optional, SQLite is default)

## Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd backend
```

2. Create a virtual environment:

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:

```bash
pip install -r requirements.txt
```

4. Create a `.env` file:

```bash
SECRET_KEY=your-secret-key
DATABASE_URL=sqlite:///./security_scanner.db  # or postgresql://user:password@localhost/dbname
GITHUB_TOKEN=your-github-token  # Optional, for private repos
GEMINI_API_KEY=your-gemini-api-key  # For AI-powered fixes
```

5. Initialize the database:

```bash
alembic upgrade head
```

## Running the Server

Development:

```bash
uvicorn app.main:app --reload
```

Production:

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

## API Endpoints

- `POST /api/v1/scan/` - Start a new scan
- `GET /api/v1/results/{scan_id}/` - Get scan results
- `POST /api/v1/ai-fix/` - Get AI-suggested fixes
- `GET /api/v1/health/` - Health check

## Example Usage

1. Start a new scan:

```bash
curl -X POST "http://localhost:8000/api/v1/scan/" \
     -H "Content-Type: application/json" \
     -d '{"repo_url": "https://github.com/username/repo"}'
```

2. Get scan results:

```bash
curl "http://localhost:8000/api/v1/results/{scan_id}/"
```

3. Get AI-suggested fixes:

```bash
curl -X POST "http://localhost:8000/api/v1/ai-fix/" \
     -H "Content-Type: application/json" \
     -d '{"vulnerabilities": [...]}'
```

## Development

- Run tests: `pytest`
- Format code: `black .`
- Check types: `mypy .`
- Lint code: `flake8`

## License

MIT
