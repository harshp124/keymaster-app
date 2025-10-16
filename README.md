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

The API will start on `http://localhost:8082`

## API Endpoints

### Get All Employees

**Endpoint:** `GET /v1/employees`

**Example:**
```bash
curl http://localhost:8082/v1/employees
```

**Success Response (200):**
```json
{
  "status": 200,
  "data": [
    {
      "name": "John Doe",
      "email": "john@example.com",
      ...
    },
    {
      "name": "Jane Smith",
      "email": "jane@example.com",
      ...
    }
  ],
  "count": 2
}
```

**No Employees Response (200):**
```json
{
  "status": 200,
  "data": [],
  "message": "No employees found"
}
```

### Get Employee Data by ID

**Endpoint:** `GET /v1/employees/{id}`

**Example:**
```bash
curl http://localhost:8082/v1/employees/367
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
  "status": 404,
  "error": "NOT_FOUND",
  "message": "Employee with ID 367 not found"
}
```

### Health Check

**Endpoint:** `GET /health`

**Example:**
```bash
curl http://localhost:8082/health
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

