# Quick Start Guide

Get Buzaglo Engine running in 5 minutes!

## Prerequisites

✅ Node.js 18+ installed  
✅ PostgreSQL 14+ installed and running  
✅ Gemini API key ([Get one free](https://ai.google.dev/))

## Installation (5 minutes)

### 1. Clone and Install (1 min)
```bash
git clone <your-repo-url>
cd buzaglo-engine
npm install
```

### 2. Configure (1 min)
```bash
# Copy the environment template
cp .env.example .env

# Edit .env and add your Gemini API key
# GEMINI_API_KEY=your_key_here
```

### 3. Setup Database (1 min)
```bash
# Create database
createdb buzaglo

# Run migrations
cd backend
npm run migrate
cd ..
```

### 4. Start (1 min)
```bash
npm run dev
```

### 5. Open Browser (1 min)
Visit: **http://localhost:5173**

## First Steps

### Try the Demo Flow

1. **Create a Tree**
   - Enter: "What are the benefits of regular exercise?"
   - Click "Start"

2. **Branch Out**
   - Click "Branch" on the root node
   - Leave hint empty or add "Focus on mental health"
   - Click "Create Branches"
   - Watch as 3-5 exploration paths appear

3. **Deep Dive**
   - Click "Deep Dive" on an interesting branch
   - Select complexity: "Manager"
   - Click "Start Deep Dive"
   - Watch the tree expand with detailed reasoning

4. **Flatten**
   - Click "Flatten" in the header
   - View the generated summary
   - Export as Markdown or JSON

## Complexity Levels Explained

| Level   | Speed | Nodes | Best For                    |
|---------|-------|-------|-----------------------------|
| Intern  | 20s   | 2-3   | Quick exploration           |
| Manager | 2min  | 8-10  | Balanced depth & breadth    |
| CEO     | 5min  | 25-30 | Comprehensive analysis      |

## Common Issues

### "Database connection failed"
```bash
# Check if PostgreSQL is running
pg_isready

# Start PostgreSQL (macOS)
brew services start postgresql@14

# Start PostgreSQL (Linux)
sudo systemctl start postgresql
```

### "Gemini API error"
- Verify your API key is correct
- Check you have quota remaining
- Ensure no typos in `.env`

### "Port already in use"
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Kill process on port 5173
lsof -ti:5173 | xargs kill -9
```

### "Module not found"
```bash
# Clean reinstall
rm -rf node_modules */node_modules
npm install
```

## Example Prompts to Try

**Research & Analysis:**
- "What are the pros and cons of remote work?"
- "Explain quantum computing applications"
- "Compare different database types"

**Creative Thinking:**
- "Generate startup ideas for sustainable fashion"
- "Brainstorm features for a productivity app"
- "Design a gamification system"

**Problem Solving:**
- "How can I improve team collaboration?"
- "Strategies to reduce customer churn"
- "Ways to optimize website performance"

## Keyboard Shortcuts (Coming Soon)

- `Cmd/Ctrl + B` - Branch
- `Cmd/Ctrl + D` - Deep Dive
- `Cmd/Ctrl + F` - Flatten
- `Cmd/Ctrl + E` - Export

## Next Steps

1. ✅ Try different complexity levels
2. 📖 Read the [full README](README.md)
3. 🏗️ Explore [architecture docs](ARCHITECTURE.md)
4. 🚀 Deploy to production (see [SETUP.md](SETUP.md))
5. 🤝 Contribute (see [CONTRIBUTING.md](CONTRIBUTING.md))

## Getting Help

- **Documentation**: Check README.md and SETUP.md
- **Issues**: Search existing GitHub issues
- **Questions**: Open a GitHub Discussion

## What to Explore

### Experiment with:
- Different prompt styles
- Varying complexity levels
- Multiple deep dives on different branches
- Flattening at different stages
- Export formats

### Advanced Features:
- Custom node types (code coming soon)
- Research nodes with external tools
- Multi-tree comparison
- Collaborative editing

## Performance Tips

- Trees with 100+ nodes work best at 80% zoom
- Use "Fit to Screen" to reset view
- Flatten works faster on trees under 200 nodes
- Deep dive at lower complexity first, then increase

## Have Fun! 🎉

Buzaglo Engine is designed for exploration. Don't be afraid to:
- Try unusual prompts
- Experiment with settings
- Branch in unexpected directions
- Compare different reasoning paths

The best insights often come from playful exploration!

---

**Need more details?** → [README.md](README.md)  
**Running into issues?** → [SETUP.md](SETUP.md)  
**Want to contribute?** → [CONTRIBUTING.md](CONTRIBUTING.md)

