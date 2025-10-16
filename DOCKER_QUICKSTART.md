# Docker Desktop Quick Start Guide

## Prerequisites

1. **Docker Desktop installed** - Download from https://www.docker.com/products/docker-desktop
2. **Docker Desktop running** - Make sure the Docker Desktop app is open and running
3. **Project files** - You have the keymaster-app project

## Step-by-Step Instructions

### Step 1: Prepare Environment File

Create a `.env` file in the project root with your Redis credentials:

```bash
# Redis Configuration (your existing Redis instance)
REDIS_HOST=redis-19312.c80.us-east-1-2.ec2.redns.redis-cloud.com
REDIS_PORT=19312
REDIS_USERNAME=default
REDIS_PASSWORD=your_actual_password_here

# Flask Configuration
FLASK_ENV=production
FLASK_DEBUG=False
```

**Note:** The `docker-compose.yml` only runs the Flask app. Your existing Redis instance will be used.

### Step 2: Open Terminal in Project Directory

```bash
cd /Users/harsh.patel/Documents/Work/hackathon/keymaster-app
```

### Step 3: Start Docker Compose

```bash
docker-compose up -d
```

**What this does:**
- Builds the Docker image for keymaster-app
- Starts Redis container
- Starts keymaster-app container
- Creates a network between them
- Runs in background (`-d` flag)

### Step 4: Verify Container is Running

```bash
# Check running containers
docker-compose ps

# You should see:
# NAME                COMMAND             STATUS
# keymaster-app       python app.py       Up (healthy)
```

**Note:** Only the Flask app runs in Docker. Your existing Redis instance is used externally.

### Step 5: Test the API

```bash
# Basic health check
curl http://localhost:8082/health

# Detailed health check
curl http://localhost:8082/health/detailed

# Get all employees
curl http://localhost:8082/v1/employees

# Search by skills
curl "http://localhost:8082/v1/employees/search/by-skills?skills=aws,docker"
```

### Step 6: View Logs

```bash
# View all logs
docker-compose logs

# Follow logs in real-time
docker-compose logs -f

# View only app logs
docker-compose logs -f keymaster-app

# View only Redis logs
docker-compose logs -f redis
```

---

## Common Commands

### Start Services
```bash
docker-compose up -d
```

### Stop Services
```bash
docker-compose down
```

### Restart Services
```bash
docker-compose restart
```

### Rebuild Image (if you made code changes)
```bash
docker-compose build --no-cache
docker-compose up -d
```

### Run populate_skills Script
```bash
docker-compose exec keymaster-app python populate_skills.py
```

### Access Container Shell
```bash
docker-compose exec keymaster-app bash
```

### Remove Everything (containers, volumes, networks)
```bash
docker-compose down -v
```

---

## Troubleshooting

### Issue: "Cannot connect to Docker daemon"
**Solution:** Make sure Docker Desktop is running. Open the Docker Desktop app.

### Issue: "Port 8082 already in use"
**Solution:** Either stop the other service or change the port in docker-compose.yml:
```yaml
ports:
  - "8083:8082"  # Change 8083 to any available port
```

### Issue: "Redis connection refused"
**Solution:**
1. Verify your external Redis instance is running
2. Check `.env` has correct Redis credentials
3. Verify network connectivity to your Redis host
4. Check app logs: `docker-compose logs keymaster-app`

### Issue: "Health check failing"
**Solution:**
1. Check app logs: `docker-compose logs keymaster-app`
2. Wait a few seconds for app to start
3. Verify Redis is running: `docker-compose logs redis`

### Issue: "Module not found" errors
**Solution:** Rebuild the image:
```bash
docker-compose build --no-cache
docker-compose up -d
```

---

## Docker Desktop UI

You can also manage containers using Docker Desktop UI:

1. Open Docker Desktop app
2. Go to **Containers** tab
3. You'll see `keymaster-app` and `keymaster-redis` containers
4. Click on them to view logs, stats, and manage them

---

## Next Steps

### Populate Skills Data
```bash
docker-compose exec keymaster-app python populate_skills.py
```

### Test API Endpoints
```bash
# Get all employees
curl http://localhost:8082/v1/employees

# Get specific employee
curl http://localhost:8082/v1/employees/367

# Search by skills (employees with ALL skills)
curl "http://localhost:8082/v1/employees/search/by-skills?skills=aws,docker,gcp"
```

### View Container Stats
```bash
docker stats
```

### Clean Up
```bash
# Stop all containers
docker-compose down

# Remove all containers, volumes, networks
docker-compose down -v

# Remove unused images
docker image prune
```

---

## Production Deployment

For production, you might want to:

1. Use environment-specific compose files
2. Add resource limits
3. Use secrets management
4. Set up logging drivers
5. Configure restart policies
6. Use health checks

See the main README.md for Kubernetes deployment examples.

