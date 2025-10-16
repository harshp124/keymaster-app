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

### Search Employees by Skills

**Endpoint:** `GET /v1/employees/search/by-skills`

Search for employees who have **ALL** the specified skills using Redis `SINTER` command for efficient set intersection.

**Query Parameters:**
- `skills` (required): Comma-separated list of skills to search for (employee must have ALL of them)
- Available skills: `aws`, `docker`, `gcp`, `sql`, `ai`, `golang`

**How it works:**
- Uses Redis `SINTER` command to find the intersection of skill SETs
- Returns only employees who have ALL requested skills
- O(N*M) complexity where N is number of skills and M is average employees per skill

**Example:**
```bash
# Search for employees who have aws AND docker AND gcp skills
curl "http://localhost:8082/v1/employees/search/by-skills?skills=aws,docker,gcp"

# Search for employees with single skill
curl "http://localhost:8082/v1/employees/search/by-skills?skills=golang"

# Search for employees with multiple skills
curl "http://localhost:8082/v1/employees/search/by-skills?skills=aws,sql,ai"
```

**Success Response (200):**
```json
{
  "status": 200,
  "requested_skills": ["aws", "docker", "gcp"],
  "data": [
    {
      "employee_id": "367",
      "employee_data": {
        "id": 367,
        "username": "jdoe",
        "first_name": "John",
        "last_name": "Doe",
        "email": "jdoe@example.com",
        "display_name": "John Doe",
        "user_type": "internal"
      },
      "matching_skills": ["aws", "docker", "gcp"]
    },
    {
      "employee_id": "373",
      "employee_data": {
        "id": 373,
        "username": "dorobins",
        "first_name": "Douglas",
        "last_name": "Robinson",
        "email": "dorobins@example.com",
        "display_name": "Douglas Robinson",
        "user_type": "internal"
      },
      "matching_skills": ["aws", "docker", "gcp"]
    }
  ],
  "count": 2
}
```

**No Match Response (200):**
```json
{
  "status": 200,
  "requested_skills": ["aws", "docker", "gcp"],
  "data": [],
  "count": 0
}
```

**Error Response (missing skills parameter):**
```json
{
  "status": 400,
  "error": "BAD_REQUEST",
  "message": "Please provide 'skills' query parameter (comma-separated)"
}
```

**Redis Data Structure Used:**
```
Key: skill:aws:employees
Type: SET
Members: ["367", "374", "389", "401"]

Key: skill:docker:employees
Type: SET
Members: ["358", "367", "373", "374", "389"]

Key: skill:gcp:employees
Type: SET
Members: ["367", "373", "401"]

# SINTER result for aws, docker, gcp:
# Intersection: ["367", "373"]
```

### Health Check Endpoints

#### 1. Basic Health Check
**Endpoint:** `GET /health`

Quick health check for other services to verify if the app is running.

**Example:**
```bash
curl http://localhost:8082/health
```

**Healthy Response (200):**
```json
{
  "status": "healthy",
  "service": "keymaster-app",
  "redis": "connected"
}
```

**Unhealthy Response (503):**
```json
{
  "status": "unhealthy",
  "service": "keymaster-app",
  "redis": "disconnected",
  "error": "Connection refused"
}
```

---

#### 2. Detailed Health Check
**Endpoint:** `GET /health/detailed`

Comprehensive health check with detailed metrics and system information. Useful for monitoring and debugging.

**Example:**
```bash
curl http://localhost:8082/health/detailed
```

**Response (200):**
```json
{
  "status": "healthy",
  "service": "keymaster-app",
  "timestamp": "2024-01-15T10:30:45.123456+00:00",
  "version": "1.0.0",
  "components": {
    "redis": {
      "status": "connected",
      "response_time_ms": 2.45
    },
    "data": {
      "status": "available",
      "employees_count": 10,
      "skills_count": 6
    }
  }
}
```

---

## Project Structure

```
.
├── app.py                  # Flask application and API endpoints
├── config.py               # Configuration management
├── redis_client.py         # Redis client singleton
├── populate_skills.py      # Script to populate employee skills SET
├── requirements.txt        # Python dependencies
├── .env                    # Environment variables (NOT committed)
├── .env.example            # Example environment variables
├── .gitignore              # Git ignore rules
└── README.md               # This file
```

## Populating Employee Skills (Reverse Indexing)

The `populate_skills.py` script uses **reverse indexing** to create an efficient skill → employees mapping in Redis. This enables fast queries using Redis SET intersection operations.

### How it works:
1. **Deletes all existing skill SETs** from Redis
2. Connects to Redis using credentials from `.env`
3. Finds all employees with keys matching `user:id:*`
4. For each employee, randomly assigns 2-4 skills from: `[aws, docker, gcp, sql, ai, golang]`
5. Creates Redis SETs with key format: `skill:{skill_name}:employees`
6. Adds employee IDs to the corresponding skill SETs
7. Verifies the population and displays results

### Key Features:
- **Reverse Indexing**: Maps skills → employees (not employees → skills)
- **Efficient Querying**: Uses Redis `SINTER` command to find employees with ALL skills
- **Fixed Skills Pool**: `[aws, docker, gcp, sql, ai, golang]`
- **Random Assignment**: Each employee gets 2-4 random skills

### Run the script:
```bash
python populate_skills.py
```

### Output Example:
```
============================================================
EMPLOYEE SKILLS POPULATION SCRIPT (Reverse Indexing)
============================================================
✓ Successfully connected to Redis

Step 1: Deleting existing skill sets...
✓ Deleted 6 existing skill sets

Step 2: Populating skills...
Found 10 employees
------------------------------------------------------------
✓ Employee 367 (John Doe): Assigned 3 skills
  Skills: aws, docker, sql
✓ Employee 373 (Douglas Robinson): Assigned 4 skills
  Skills: ai, docker, gcp, golang
------------------------------------------------------------

Adding employees to skill SETs...
------------------------------------------------------------
✓ Skill 'aws': Added 4 employees
✓ Skill 'docker': Added 7 employees
✓ Skill 'gcp': Added 3 employees
✓ Skill 'sql': Added 5 employees
✓ Skill 'ai': Added 2 employees
✓ Skill 'golang': Added 6 employees
------------------------------------------------------------

Step 3: Verifying population...
============================================================
VERIFICATION - Skill to Employees Mapping
============================================================

Found 6 skills

Skill 'ai':
  Employees: 367, 373, 401
  Count: 3

Skill 'aws':
  Employees: 358, 367, 374, 389
  Count: 4
```

### Redis Data Structure:
```
Key: skill:aws:employees
Type: SET
Members: ["367", "374", "389", "401"]

Key: skill:docker:employees
Type: SET
Members: ["358", "367", "373", "374", "389", "401", "412"]
```

### Scheduling (Optional):
To run this script at regular intervals, add to crontab:
```bash
# Run every hour
0 * * * * cd /path/to/keymaster-app && python populate_skills.py
```

## Docker Setup

### Build Docker Image

```bash
# Build the Docker image
docker build -t keymaster-app:latest .

# Build with specific tag
docker build -t keymaster-app:1.0.0 .
```

### Run Docker Container

**Option 1: Using Docker Compose (Recommended for local development)**

```bash
# Start the app with Redis
docker-compose up -d

# View logs
docker-compose logs -f keymaster-app

# Stop the app
docker-compose down
```

**Option 2: Using Docker Run (with external Redis)**

```bash
# Run the container with your Redis Cloud credentials
docker run -d \
  --name keymaster-app \
  -p 8082:8082 \
  -e REDIS_HOST=your_redis_host \
  -e REDIS_PORT=your_redis_port \
  -e REDIS_USERNAME=your_username \
  -e REDIS_PASSWORD=your_password \
  keymaster-app:latest
```

**Option 3: Using Docker Run (with local Redis)**

```bash
# Start Redis container
docker run -d --name redis -p 6379:6379 redis:7-alpine

# Start the app container
docker run -d \
  --name keymaster-app \
  -p 8082:8082 \
  --link redis:redis \
  -e REDIS_HOST=redis \
  -e REDIS_PORT=6379 \
  -e REDIS_USERNAME=default \
  -e REDIS_PASSWORD="" \
  keymaster-app:latest
```

### Docker Commands

```bash
# View running containers
docker ps

# View container logs
docker logs keymaster-app

# Follow logs in real-time
docker logs -f keymaster-app

# Execute command in container
docker exec -it keymaster-app bash

# Stop container
docker stop keymaster-app

# Remove container
docker rm keymaster-app

# Remove image
docker rmi keymaster-app:latest
```

### Docker Compose Commands

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f

# Rebuild image
docker-compose build --no-cache

# Run one-off command
docker-compose exec keymaster-app python populate_skills.py

# View service status
docker-compose ps
```

### Environment Variables for Docker

Create a `.env` file in the project root:

```bash
# Redis Configuration
REDIS_HOST=your_redis_host
REDIS_PORT=your_redis_port
REDIS_USERNAME=your_username
REDIS_PASSWORD=your_password

# Flask Configuration
FLASK_ENV=production
FLASK_DEBUG=False
```

### Health Check

Once the container is running, verify it's healthy:

```bash
# Basic health check
curl http://localhost:8082/health

# Detailed health check
curl http://localhost:8082/health/detailed

# Check container health
docker inspect --format='{{.State.Health.Status}}' keymaster-app
```

### Docker Image Details

- **Base Image**: `python:3.12-slim`
- **Working Directory**: `/app`
- **Port**: `8082`
- **Health Check**: Every 30 seconds
- **Restart Policy**: `unless-stopped`

### Dockerfile Optimization

The Dockerfile uses several best practices:

1. **Multi-stage builds** (if needed in future)
2. **Layer caching** - Requirements copied before code
3. **Minimal base image** - `python:3.12-slim` instead of full Python
4. **Health checks** - Built-in container health monitoring
5. **Environment variables** - Proper Python configuration
6. **Non-root user** (optional - can be added for security)

### Push to Docker Registry

```bash
# Tag image for Docker Hub
docker tag keymaster-app:latest yourusername/keymaster-app:latest

# Login to Docker Hub
docker login

# Push image
docker push yourusername/keymaster-app:latest

# Pull image
docker pull yourusername/keymaster-app:latest
```

### Kubernetes Deployment

Example Kubernetes manifest:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: keymaster-app
spec:
  replicas: 3
  selector:
    matchLabels:
      app: keymaster-app
  template:
    metadata:
      labels:
        app: keymaster-app
    spec:
      containers:
      - name: keymaster-app
        image: keymaster-app:latest
        ports:
        - containerPort: 8082
        env:
        - name: REDIS_HOST
          valueFrom:
            secretKeyRef:
              name: redis-credentials
              key: host
        - name: REDIS_PORT
          valueFrom:
            secretKeyRef:
              name: redis-credentials
              key: port
        - name: REDIS_USERNAME
          valueFrom:
            secretKeyRef:
              name: redis-credentials
              key: username
        - name: REDIS_PASSWORD
          valueFrom:
            secretKeyRef:
              name: redis-credentials
              key: password
        livenessProbe:
          httpGet:
            path: /health/live
            port: 8082
          initialDelaySeconds: 10
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health/ready
            port: 8082
          initialDelaySeconds: 5
          periodSeconds: 5
        resources:
          requests:
            memory: "128Mi"
            cpu: "100m"
          limits:
            memory: "256Mi"
            cpu: "500m"
```

## Notes

- The `.env` file contains sensitive credentials and is excluded from Git
- Use `.env.example` as a template for setting up new environments
- The Redis client uses a singleton pattern for efficient connection management
- All responses are in JSON format
- Docker images are optimized for production use with health checks and proper signal handling

