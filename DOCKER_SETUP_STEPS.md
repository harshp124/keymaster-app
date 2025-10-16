# Docker Desktop Setup - Visual Step-by-Step Guide

## 🚀 Quick Setup (5 minutes)

### Step 1️⃣: Create `.env` File

In your project root directory, create a file named `.env` with your Redis credentials:

```
# Your existing Redis instance
REDIS_HOST=redis-19312.c80.us-east-1-2.ec2.redns.redis-cloud.com
REDIS_PORT=19312
REDIS_USERNAME=default
REDIS_PASSWORD=your_actual_password_here

FLASK_ENV=production
FLASK_DEBUG=False
```

**Note:** The docker-compose.yml now only runs the Flask app. Your existing Redis instance will be used.

### Step 2️⃣: Open Terminal

Open your terminal and navigate to the project:

```bash
cd /Users/harsh.patel/Documents/Work/hackathon/keymaster-app
```

### Step 3️⃣: Start Docker Compose

```bash
docker-compose up -d
```

**Expected Output:**
```
[+] Running 1/1
 ✔ Container keymaster-app    Started
```

### Step 4️⃣: Verify Container is Running

```bash
docker-compose ps
```

**Expected Output:**
```
NAME                COMMAND             STATUS              PORTS
keymaster-app       python app.py       Up (healthy)        0.0.0.0:8082->8082/tcp
```

**Note:** Only the Flask app container runs. Your existing Redis instance is used externally.

### Step 5️⃣: Test the API

```bash
curl http://localhost:8082/health
```

**Expected Response:**
```json
{
  "status": "healthy",
  "service": "keymaster-app",
  "redis": "connected"
}
```

---

## ✅ Success! Your App is Running

You can now access:
- **API**: http://localhost:8082
- **Health Check**: http://localhost:8082/health
- **Detailed Health**: http://localhost:8082/health/detailed

---

## 📊 Monitor Your Containers

### Option 1: Command Line
```bash
# View logs
docker-compose logs -f

# View only app logs
docker-compose logs -f keymaster-app

# View container stats
docker stats
```

### Option 2: Docker Desktop UI
1. Open Docker Desktop app
2. Click on **Containers** tab
3. You'll see your running containers
4. Click on a container to view logs and stats

---

## 🔧 Common Tasks

### Populate Skills Data
```bash
docker-compose exec keymaster-app python populate_skills.py
```

### Get All Employees
```bash
curl http://localhost:8082/v1/employees
```

### Search Employees by Skills
```bash
curl "http://localhost:8082/v1/employees/search/by-skills?skills=aws,docker"
```

### Access Container Shell
```bash
docker-compose exec keymaster-app bash
```

### Access Container Shell
```bash
docker-compose exec keymaster-app bash
```

### Restart Containers
```bash
docker-compose restart
```

### Stop Containers
```bash
docker-compose down
```

### Stop and Remove Everything
```bash
docker-compose down -v
```

---

## 🐛 Troubleshooting

### ❌ "Cannot connect to Docker daemon"
**Fix:** Open Docker Desktop app and wait for it to start

### ❌ "Port 8082 already in use"
**Fix:** Edit `docker-compose.yml` and change:
```yaml
ports:
  - "8083:8082"  # Use 8083 instead
```

### ❌ "Health check failing"
**Fix:** 
1. Check logs: `docker-compose logs keymaster-app`
2. Wait 10 seconds for app to fully start
3. Try again: `curl http://localhost:8082/health`

### ❌ "Redis connection refused"
**Fix:**
1. Check Redis is running: `docker-compose ps`
2. Verify `.env` has `REDIS_HOST=redis` (not localhost)
3. Restart: `docker-compose restart`

### ❌ "Module not found" error
**Fix:** Rebuild the image:
```bash
docker-compose build --no-cache
docker-compose up -d
```

---

## 📝 File Structure

```
keymaster-app/
├── Dockerfile              # Container definition
├── docker-compose.yml      # Multi-container setup
├── .dockerignore          # Files to exclude from image
├── .env                   # Environment variables (create this)
├── .env.example           # Example env file
├── app.py                 # Flask app
├── config.py              # Configuration
├── redis_client.py        # Redis connection
├── populate_skills.py     # Populate skills script
├── requirements.txt       # Python dependencies
└── README.md              # Documentation
```

---

## 🎯 What's Running

### Container: keymaster-app
- **Image**: Built from Dockerfile
- **Port**: 8082
- **Service**: Flask API
- **Health Check**: Every 30 seconds
- **Redis**: Connects to your external Redis instance

### External Redis
- Your existing Redis instance (not in Docker)
- Configured via `.env` file
- Used by the Flask app container

---

## 🚀 Next Steps

1. ✅ Containers running
2. ✅ API responding
3. 📊 Populate skills: `docker-compose exec keymaster-app python populate_skills.py`
4. 🧪 Test endpoints
5. 📈 Monitor with Docker Desktop UI

---

## 💡 Tips

- **Keep Docker Desktop running** in the background
- **Use `docker-compose logs -f`** to debug issues
- **Restart with `docker-compose restart`** if something goes wrong
- **Use `docker-compose down`** when you're done to free up resources
- **Check Docker Desktop UI** for visual monitoring

---

## 📚 Learn More

- Docker Docs: https://docs.docker.com/
- Docker Compose: https://docs.docker.com/compose/
- Flask in Docker: https://flask.palletsprojects.com/en/latest/
- Redis Docker: https://hub.docker.com/_/redis

