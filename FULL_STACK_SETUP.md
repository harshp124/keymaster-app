# Full Stack Setup - Keymaster App

Complete guide to run the entire Keymaster application (Backend API + Frontend UI).

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (React + Vite)              │
│                   http://localhost:5173                 │
│  - Multi-select skills filter                           │
│  - Employee cards grid                                  │
│  - Health status indicator                              │
└────────────────────┬────────────────────────────────────┘
                     │ HTTP Requests
                     ▼
┌─────────────────────────────────────────────────────────┐
│              Backend API (Flask + Python)               │
│                   http://localhost:8082                 │
│  - /v1/employees                                        │
│  - /v1/employees/{id}                                   │
│  - /v1/employees/search/by-skills                       │
│  - /health, /health/detailed, /health/live, /health/ready
└────────────────────┬────────────────────────────────────┘
                     │ Redis Commands
                     ▼
┌─────────────────────────────────────────────────────────┐
│                  Redis Database                         │
│            (External or Local Instance)                 │
│  - user:id:* (Employee JSON)                            │
│  - skill:*:employees (Skill to Employee mapping)        │
└─────────────────────────────────────────────────────────┘
```

## Prerequisites

1. **Node.js 16+** - For frontend
2. **Python 3.12+** - For backend
3. **Docker Desktop** - For containerization
4. **Redis Instance** - External or local
5. **Git** - For version control

## Quick Start (5 minutes)

### Terminal 1: Start Backend API

```bash
# Navigate to project root
cd /Users/harsh.patel/Documents/Work/hackathon/keymaster-app

# Create .env file (if not exists)
cat > .env << EOF
REDIS_HOST=your_redis_host
REDIS_PORT=your_redis_port
REDIS_USERNAME=default
REDIS_PASSWORD=your_password
FLASK_ENV=production
FLASK_DEBUG=False
EOF

# Start with Docker Compose
docker-compose up -d

# Verify API is running
curl http://localhost:8082/health
```

### Terminal 2: Start Frontend UI

```bash
# Navigate to frontend directory
cd frontend

# Create .env file
cat > .env << EOF
VITE_API_URL=http://localhost:8082
EOF

# Install dependencies
npm install

# Start dev server
npm run dev
```

### Terminal 3: Populate Skills (Optional)

```bash
# In the project root directory
docker-compose exec keymaster-app python populate_skills.py
```

## Access the Application

- **Frontend UI**: http://localhost:5173
- **Backend API**: http://localhost:8082
- **API Health**: http://localhost:8082/health/detailed

## Full Setup Instructions

### Step 1: Backend Setup

```bash
# Navigate to project root
cd /Users/harsh.patel/Documents/Work/hackathon/keymaster-app

# Create .env file with your Redis credentials
cat > .env << EOF
REDIS_HOST=redis-19312.c80.us-east-1-2.ec2.redns.redis-cloud.com
REDIS_PORT=19312
REDIS_USERNAME=default
REDIS_PASSWORD=your_actual_password_here
FLASK_ENV=production
FLASK_DEBUG=False
EOF

# Build and start Docker container
docker-compose build
docker-compose up -d

# Verify container is running
docker-compose ps

# Check API health
curl http://localhost:8082/health/detailed
```

### Step 2: Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Create .env file
cat > .env << EOF
VITE_API_URL=http://localhost:8082
EOF

# Install dependencies
npm install

# Start development server
npm run dev
```

### Step 3: Populate Data

```bash
# In project root, populate skills
docker-compose exec keymaster-app python populate_skills.py

# Verify data was populated
curl http://localhost:8082/v1/employees | head -20
```

### Step 4: Test the Application

1. Open http://localhost:5173 in your browser
2. Select skills from the dropdown
3. View matching employees
4. Check health status in header

## Development Workflow

### Making Backend Changes

```bash
# Edit app.py or other backend files
# Rebuild and restart
docker-compose build --no-cache
docker-compose up -d

# View logs
docker-compose logs -f keymaster-app
```

### Making Frontend Changes

```bash
# Edit React components
# Changes auto-reload with HMR (Hot Module Replacement)
# No restart needed!
```

### Testing APIs

```bash
# Get all employees
curl http://localhost:8082/v1/employees

# Get specific employee
curl http://localhost:8082/v1/employees/367

# Search by skills
curl "http://localhost:8082/v1/employees/search/by-skills?skills=aws,docker"

# Health check
curl http://localhost:8082/health/detailed
```

## Stopping the Application

```bash
# Stop frontend (Ctrl+C in terminal 2)

# Stop backend
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

## Troubleshooting

### Frontend Can't Connect to API

**Problem**: "Cannot connect to API" error in browser

**Solution**:
1. Verify backend is running: `docker-compose ps`
2. Check API health: `curl http://localhost:8082/health`
3. Verify `.env` has correct `VITE_API_URL`
4. Check browser console for CORS errors
5. Restart frontend: `npm run dev`

### Backend Container Won't Start

**Problem**: Docker container exits immediately

**Solution**:
1. Check logs: `docker-compose logs keymaster-app`
2. Verify `.env` file exists and has correct credentials
3. Test Redis connection: `redis-cli -h your_host -p your_port`
4. Rebuild: `docker-compose build --no-cache`

### Skills Not Showing

**Problem**: Skills dropdown is empty

**Solution**:
1. Populate skills: `docker-compose exec keymaster-app python populate_skills.py`
2. Verify data: `curl http://localhost:8082/v1/employees`
3. Check Redis: `docker-compose exec redis redis-cli KEYS "*"`

### Port Already in Use

**Problem**: "Port 8082 already in use" or "Port 5173 already in use"

**Solution**:
```bash
# Find process using port
lsof -i :8082
lsof -i :5173

# Kill process
kill -9 <PID>

# Or change port in docker-compose.yml or vite.config.js
```

## Production Deployment

### Build Frontend

```bash
cd frontend
npm run build
# Output in dist/ directory
```

### Deploy Frontend

**Option 1: Vercel**
```bash
npm install -g vercel
vercel
```

**Option 2: Netlify**
```bash
npm install -g netlify-cli
netlify deploy --prod --dir=dist
```

**Option 3: Docker**
```bash
docker build -f Dockerfile.frontend -t keymaster-ui:latest .
docker run -p 80:80 keymaster-ui:latest
```

### Deploy Backend

```bash
# Push to Docker registry
docker tag keymaster-app:latest yourusername/keymaster-app:latest
docker push yourusername/keymaster-app:latest

# Deploy to Kubernetes, AWS, GCP, etc.
```

## Environment Variables

### Backend (.env)

```
REDIS_HOST=your_redis_host
REDIS_PORT=your_redis_port
REDIS_USERNAME=default
REDIS_PASSWORD=your_password
FLASK_ENV=production
FLASK_DEBUG=False
```

### Frontend (.env)

```
VITE_API_URL=http://localhost:8082
```

## Performance Tips

1. **Backend**:
   - Use Redis connection pooling
   - Cache frequently accessed data
   - Monitor API response times

2. **Frontend**:
   - Use React DevTools to check re-renders
   - Optimize images and assets
   - Use code splitting for large components

3. **Network**:
   - Enable gzip compression
   - Use CDN for static assets
   - Implement request caching

## Monitoring

### Backend Health

```bash
# Check API health
curl http://localhost:8082/health/detailed

# View logs
docker-compose logs -f keymaster-app

# Check container stats
docker stats keymaster-app
```

### Frontend Performance

1. Open DevTools (F12)
2. Go to Network tab
3. Monitor API requests
4. Check Console for errors

## Next Steps

1. ✅ Backend running
2. ✅ Frontend running
3. ✅ Data populated
4. 📊 Customize UI
5. 🚀 Deploy to production

## Support

For issues:
1. Check logs: `docker-compose logs`
2. Verify configuration
3. Test API endpoints manually
4. Check GitHub issues
5. Create new issue with details

## Resources

- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)
- [Flask Documentation](https://flask.palletsprojects.com)
- [Redis Documentation](https://redis.io/docs)
- [Docker Documentation](https://docs.docker.com)

