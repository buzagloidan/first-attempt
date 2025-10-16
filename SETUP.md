# Setup Guide

Detailed setup instructions for the Buzaglo Engine.

## Quick Start (Development)

### 1. System Requirements

- **Node.js**: v18.0.0 or higher
- **PostgreSQL**: v14.0 or higher  
- **npm**: v9.0.0 or higher (comes with Node.js)
- **Git**: Latest version

### 2. PostgreSQL Setup

#### macOS (Homebrew)
```bash
brew install postgresql@14
brew services start postgresql@14
createdb buzaglo
```

#### Ubuntu/Debian
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo -u postgres createdb buzaglo
```

#### Windows
1. Download PostgreSQL from https://www.postgresql.org/download/windows/
2. Run the installer
3. Use pgAdmin or psql to create database:
```sql
CREATE DATABASE buzaglo;
```

### 3. Gemini API Key

1. Visit [Google AI Studio](https://ai.google.dev/)
2. Click "Get API Key"
3. Create a new API key or use existing one
4. Copy the API key for later use

### 4. Project Setup

```bash
# Clone repository
git clone <your-repo-url>
cd buzaglo-engine

# Install all dependencies
npm install

# Copy environment template
cp .env.example .env
```

### 5. Configure Environment

Edit `.env` file:

```env
# Required: Gemini API Key
GEMINI_API_KEY=AIzaSy...your-key-here

# Database (adjust if needed)
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=buzaglo
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_postgres_password

# Optional: Redis (for caching)
REDIS_URL=redis://localhost:6379

# Server
PORT=3000
NODE_ENV=development
```

### 6. Database Migration

```bash
cd backend
npm run migrate
cd ..
```

You should see:
```
✓ Database migrations completed successfully
```

### 7. Start Development Servers

From the root directory:

```bash
npm run dev
```

This starts both:
- **Backend**: http://localhost:3000
- **Frontend**: http://localhost:5173

### 8. Verify Installation

1. Open http://localhost:5173 in your browser
2. Enter a test question: "What are the benefits of exercise?"
3. Click "Start"
4. You should see the root node created
5. Click "Branch" to test the Gemini integration

## Advanced Setup

### Redis Setup (Optional, for Caching)

#### macOS
```bash
brew install redis
brew services start redis
```

#### Ubuntu/Debian
```bash
sudo apt install redis-server
sudo systemctl start redis
```

#### Docker
```bash
docker run -d -p 6379:6379 redis:alpine
```

Add to `.env`:
```env
REDIS_URL=redis://localhost:6379
```

### S3 Setup (Optional, for Exports)

For AWS S3:
```env
S3_ENDPOINT=https://s3.amazonaws.com
S3_BUCKET=buzaglo-exports
S3_ACCESS_KEY=your-access-key
S3_SECRET_KEY=your-secret-key
```

For MinIO (local S3-compatible storage):
```bash
docker run -p 9000:9000 -p 9001:9001 \
  -e "MINIO_ROOT_USER=admin" \
  -e "MINIO_ROOT_PASSWORD=password" \
  minio/minio server /data --console-address ":9001"
```

```env
S3_ENDPOINT=http://localhost:9000
S3_BUCKET=buzaglo
S3_ACCESS_KEY=admin
S3_SECRET_KEY=password
```

## Production Deployment

### Backend (Railway)

1. Install Railway CLI:
```bash
npm i -g @railway/cli
```

2. Login and deploy:
```bash
railway login
railway init
railway up
```

3. Set environment variables:
```bash
railway variables set GEMINI_API_KEY=your-key
railway variables set POSTGRES_URL=your-postgres-url
```

### Frontend (Vercel)

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy:
```bash
cd frontend
vercel
```

3. Set environment variables in Vercel dashboard:
- `VITE_API_URL`: Your backend URL

### Docker Deployment

Build and run with Docker Compose:

```bash
docker-compose up -d
```

## Troubleshooting

### "Module not found" errors
```bash
# Clean install
rm -rf node_modules package-lock.json
rm -rf backend/node_modules backend/package-lock.json
rm -rf frontend/node_modules frontend/package-lock.json
npm install
```

### PostgreSQL connection refused
```bash
# Check if PostgreSQL is running
pg_isready

# If not running (macOS):
brew services start postgresql@14

# If not running (Linux):
sudo systemctl start postgresql
```

### Gemini API errors
- Verify API key is correct and active
- Check rate limits: https://ai.google.dev/pricing
- Review backend logs for detailed errors

### Port already in use
```bash
# Find and kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Find and kill process on port 5173
lsof -ti:5173 | xargs kill -9
```

### Frontend can't connect to backend
1. Ensure backend is running: `curl http://localhost:3000/health`
2. Check proxy config in `frontend/vite.config.ts`
3. Verify CORS is enabled in backend

## Development Tips

### Hot Reload
Both frontend and backend support hot reload. Changes are reflected automatically.

### Database Reset
To reset the database:
```bash
dropdb buzaglo
createdb buzaglo
cd backend && npm run migrate
```

### Viewing Logs
Backend logs appear in the terminal where you ran `npm run dev`.

### Testing API Endpoints
Use curl or Postman:
```bash
# Health check
curl http://localhost:3000/health

# Create tree
curl -X POST http://localhost:3000/trees \
  -H "Content-Type: application/json" \
  -d '{"title":"Test","prompt":"What is AI?"}'
```

### Database Inspection
```bash
# Connect to database
psql buzaglo

# List tables
\dt

# View nodes
SELECT * FROM nodes;

# Exit
\q
```

## Next Steps

1. ✅ Verify installation works
2. 📖 Read the main README.md
3. 🎨 Explore the UI and features
4. 🔧 Customize complexity configs
5. 🚀 Deploy to production

## Getting Help

- Check the main README.md
- Review error logs in terminal
- Check GitHub Issues
- Consult PRD document for feature details

