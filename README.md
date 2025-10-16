# Buzaglo Engine

A visual reasoning engine built with React Flow and Gemini AI. Explore complex topics through interactive tree structures with Branch, Deep Dive, and Flatten operations.

## Features

- 🌳 **Visual Tree Canvas**: Interactive DAG visualization using React Flow
- 🤖 **Gemini AI Integration**: Powered by Google's Gemini 2.0 for intelligent reasoning
- 🔄 **Branch Exploration**: Generate multiple exploration paths from any node
- 🔍 **Deep Dive**: Expand specific paths with adjustable complexity
- 📝 **Flatten**: Summarize entire reasoning trees into clean markdown
- 💾 **Export**: Export trees as JSON, Markdown, or images
- ⚡ **Real-time Updates**: Live node status and streaming responses
- 🎨 **Modern UI**: Beautiful dark theme with purple accents

## Architecture

### Tech Stack

**Frontend:**
- React 18 + TypeScript
- React Flow for canvas visualization
- Zustand for state management
- Vite for build tooling

**Backend:**
- Node.js + Fastify
- PostgreSQL for data persistence
- Gemini API for AI reasoning
- Redis for caching (optional)

## Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL 14+
- Gemini API key ([Get one here](https://ai.google.dev/))

### Installation

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd buzaglo-engine
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
```

Edit `.env` and add your credentials:
```env
# Gemini API Configuration
GEMINI_API_KEY=your_gemini_api_key_here

# Database Configuration
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=buzaglo
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_password

# Server Configuration
PORT=3000
NODE_ENV=development
```

4. **Set up the database**

Create the PostgreSQL database:
```bash
createdb buzaglo
```

Run migrations:
```bash
cd backend
npm run migrate
```

5. **Start the development servers**

In the root directory:
```bash
npm run dev
```

This will start:
- Backend server on `http://localhost:3000`
- Frontend dev server on `http://localhost:5173`

## Usage

### Creating a Tree

1. Enter your question or topic in the header input
2. Click "Start" to create a new reasoning tree
3. The root node will be created automatically

### Branch Operation

1. Click "Branch" on any successful node
2. Optionally provide a hint to focus the exploration
3. Set the number of branches (2-8)
4. System generates diverse exploration paths

### Deep Dive Operation

1. Click "Deep Dive" on any successful node
2. Optionally describe what to explore
3. Select complexity level (Intern/Manager/CEO)
4. System expands the path with multiple reasoning steps

### Flatten Operation

1. Click "Flatten" in the header
2. System traverses the tree and generates a summary
3. View the markdown summary in the drawer
4. Export as Markdown or JSON

### Complexity Levels

- **Intern** (Fast): 3 CU, ~20 seconds, 2-3 nodes
- **Manager** (Balanced): 12 CU, ~2 minutes, 8-10 nodes
- **CEO** (Deep): 36 CU, ~5 minutes, 25-30 nodes

CU (Complexity Units) control the depth and breadth of exploration.

## API Endpoints

### Trees
- `POST /trees` - Create a new tree
- `GET /trees/:id` - Get tree with nodes and edges
- `DELETE /trees/:id` - Delete a tree

### Actions
- `POST /actions/branch` - Execute branch operation
- `POST /actions/deep-dive` - Execute deep dive operation
- `POST /actions/flatten` - Execute flatten operation

### Export
- `POST /export/:id` - Export tree (format: json|md)

## Database Schema

The system uses the following main tables:

- `users` - User accounts
- `projects` - Project containers
- `trees` - Reasoning trees
- `nodes` - Individual reasoning nodes (LLM or Research type)
- `edges` - Connections between nodes
- `runs` - Execution tracking
- `usage_events` - Usage metering and cost tracking
- `wallets` - User balance for API costs

## Project Structure

```
buzaglo-engine/
├── backend/
│   ├── src/
│   │   ├── db/          # Database client and schema
│   │   ├── routes/      # API routes
│   │   ├── services/    # Core services (Gemini, Planner, etc.)
│   │   ├── types/       # TypeScript types
│   │   ├── config.ts    # Configuration
│   │   └── index.ts     # Server entry point
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── api.ts       # API client
│   │   ├── store.ts     # Zustand store
│   │   ├── types.ts     # TypeScript types
│   │   ├── App.tsx      # Main app component
│   │   └── main.tsx     # Entry point
│   └── package.json
└── package.json         # Root package.json
```

## Development

### Backend Development

```bash
cd backend
npm run dev          # Start with hot reload
npm run build        # Build TypeScript
npm run migrate      # Run database migrations
```

### Frontend Development

```bash
cd frontend
npm run dev          # Start Vite dev server
npm run build        # Build for production
npm run preview      # Preview production build
```

## Deployment

### Backend Deployment (Railway/Render)

1. Set environment variables in your platform
2. Build command: `npm run build --workspace=backend`
3. Start command: `npm run start --workspace=backend`

### Frontend Deployment (Vercel/Netlify)

1. Build command: `npm run build --workspace=frontend`
2. Output directory: `frontend/dist`
3. Set API proxy to your backend URL

## Configuration

### Gemini Models

The default model is `gemini-2.0-flash-exp`. You can configure different models in `backend/src/config.ts`:

```typescript
gemini: {
  apiKey: process.env.GEMINI_API_KEY || '',
  model: 'gemini-2.0-flash-exp', // or gemini-1.5-pro, etc.
}
```

### Complexity Configuration

Adjust complexity levels in `backend/src/types/index.ts`:

```typescript
export const COMPLEXITY_CONFIGS: Record<ComplexityLevel, ComplexityConfig> = {
  intern: { cu: 3, maxDepth: 2, maxWidth: 2, defaultBranches: 3, estimatedETA: 20 },
  manager: { cu: 12, maxDepth: 3, maxWidth: 3, defaultBranches: 5, estimatedETA: 120 },
  ceo: { cu: 36, maxDepth: 4, maxWidth: 4, defaultBranches: 7, estimatedETA: 300 },
};
```

## Troubleshooting

### Database Connection Issues
- Ensure PostgreSQL is running: `pg_isready`
- Check credentials in `.env`
- Verify database exists: `psql -l`

### Gemini API Errors
- Verify API key is correct
- Check rate limits and quotas
- Review error logs in terminal

### Frontend Not Loading
- Check backend is running on port 3000
- Verify proxy configuration in `vite.config.ts`
- Clear browser cache and restart dev server

## Performance Considerations

- **Canvas Rendering**: Optimized for up to 300 nodes at 60 FPS
- **Node Memoization**: Redis caching for duplicate prompts
- **Streaming**: Real-time updates via SSE for better UX
- **Auto-layout**: Dagre algorithm for clean tree visualization

## Security

- API keys stored server-side only
- PostgreSQL encryption at rest (AES-256)
- TLS/HTTPS for data in transit
- Input validation and sanitization
- Rate limiting on API endpoints

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - See LICENSE file for details

## Acknowledgments

- Built with [React Flow](https://reactflow.dev/)
- Powered by [Google Gemini AI](https://ai.google.dev/)
- Inspired by reasoning visualization tools

## Support

For issues and questions:
- GitHub Issues: [Create an issue](https://github.com/your-repo/issues)
- Documentation: See `/docs` folder

---

**Version**: 0.9.0  
**Status**: MVP Ready  
**Last Updated**: 2025

