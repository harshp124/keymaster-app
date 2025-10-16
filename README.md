# Employee API - Redis Integration

A simple Flask API that fetches employee data from Redis.

## Setup

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and update with your Redis credentials:

```bash
cp .env.example .env
```

Edit `.env` with your Redis connection details:

```
REDIS_HOST=your_redis_host
REDIS_PORT=your_redis_port
REDIS_USERNAME=your_username
REDIS_PASSWORD=your_password
FLASK_ENV=development
FLASK_DEBUG=True
```

**Note:** The `.env` file is in `.gitignore` and will NOT be committed to GitHub.

### 3. Run the Application

```bash
python app.py
```

The API will start on `http://localhost:5000`

## API Endpoints

### Get Employee Data

**Endpoint:** `GET /v1/employees/{id}`

**Example:**
```bash
curl http://localhost:5000/v1/employees/367
```

**Success Response (200):**
```json
{
  "status": 200,
  "data": {
    "name": "John Doe",
    "email": "john@example.com",
    ...
  }
}
```

**Not Found Response (404):**
```json
{
  "error": "Employee with ID 367 not found",
  "status": 404
}
```

### Health Check

**Endpoint:** `GET /health`

**Example:**
```bash
curl http://localhost:5000/health
```

**Response:**
```json
{
  "status": "healthy",
  "redis": "connected"
}
```

## Project Structure

```
.
├── app.py              # Flask application and API endpoints
├── config.py           # Configuration management
├── redis_client.py     # Redis client singleton
├── requirements.txt    # Python dependencies
├── .env                # Environment variables (NOT committed)
├── .env.example        # Example environment variables
├── .gitignore          # Git ignore rules
└── README.md           # This file
```

## Notes

- The `.env` file contains sensitive credentials and is excluded from Git
- Use `.env.example` as a template for setting up new environments
- The Redis client uses a singleton pattern for efficient connection management
- All responses are in JSON format

