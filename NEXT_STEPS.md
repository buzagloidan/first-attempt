# 🚀 Next Steps - You're Almost Ready!

## ✅ Installation Complete!

Dependencies are installed. Here's what to do next:

## Step 1: Set Up Environment Variables

```bash
# Copy the environment template
cp .env.example .env
```

Then edit `.env` and add your Gemini API key:

```env
GEMINI_API_KEY=your_actual_api_key_here
```

**Get a free Gemini API key:** https://ai.google.dev/

## Step 2: Set Up PostgreSQL Database

### Option A: Use Existing PostgreSQL

```bash
# Create the database
createdb buzaglo

# Run migrations
cd backend
npm run migrate
cd ..
```

### Option B: Use Docker

```bash
# Start PostgreSQL with Docker
docker run -d \
  --name buzaglo-postgres \
  -e POSTGRES_DB=buzaglo \
  -e POSTGRES_PASSWORD=buzaglo_password \
  -p 5432:5432 \
  postgres:14-alpine

# Wait a few seconds, then run migrations
cd backend
npm run migrate
cd ..
```

## Step 3: Start Development Servers

```bash
npm run dev
```

This will start:
- **Backend**: http://localhost:3000
- **Frontend**: http://localhost:5173

## Step 4: Open Your Browser

Visit: **http://localhost:5173**

## Step 5: Try Your First Tree!

1. Enter a question: "What are the benefits of exercise?"
2. Click "Start"
3. Click "Branch" on the root node
4. Watch the magic happen! ✨

## 🆘 Troubleshooting

### "Database connection failed"

**Check if PostgreSQL is running:**
```bash
# Windows
pg_isready

# If not running, start it
# See SETUP.md for platform-specific instructions
```

### "GEMINI_API_KEY not set"

Make sure you:
1. Created `.env` file from `.env.example`
2. Added your actual API key
3. No extra spaces or quotes around the key

### "Port already in use"

**Kill processes on the ports:**
```bash
# Find process on port 3000
netstat -ano | findstr :3000

# Kill it (replace PID with actual process ID)
taskkill /PID <PID> /F

# Repeat for port 5173 if needed
```

### Still having issues?

Run the environment checker:
```bash
bash scripts/check-env.sh
```

Or check the detailed setup guide: [SETUP.md](SETUP.md)

## 📚 Useful Resources

- **Quick Start**: [QUICKSTART.md](QUICKSTART.md) - 5-minute guide
- **Full Setup**: [SETUP.md](SETUP.md) - Detailed instructions
- **Architecture**: [ARCHITECTURE.md](ARCHITECTURE.md) - How it works
- **Contributing**: [CONTRIBUTING.md](CONTRIBUTING.md) - How to contribute

## 🎯 What You Can Build

- Research summaries
- Decision frameworks
- Creative brainstorming
- Problem exploration
- Systematic analysis
- Knowledge mapping

## 💡 Example Prompts

Try these to get started:

**Research:**
- "What are the latest AI trends?"
- "Compare SQL vs NoSQL databases"
- "Explain quantum computing"

**Business:**
- "Startup ideas for sustainability"
- "Marketing strategies for SaaS"
- "Product roadmap considerations"

**Personal:**
- "Should I learn Python or JavaScript?"
- "How to improve productivity?"
- "Career path options in tech"

## 🎉 You're Ready!

Once you complete steps 1-3, you'll have a fully functional reasoning engine!

**Need help?** Check the docs or open an issue on GitHub.

Happy exploring! 🚀

