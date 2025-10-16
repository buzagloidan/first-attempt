# Architecture Documentation

## System Overview

Buzaglo Engine is a visual reasoning platform that combines interactive graph visualization with AI-powered content generation. The system uses a client-server architecture with PostgreSQL for persistence and Gemini AI for reasoning.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────┐
│                    Frontend (React)                  │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────┐│
│  │ React Flow   │  │   Zustand    │  │ Components ││
│  │   Canvas     │  │    Store     │  │  (UI/UX)   ││
│  └──────────────┘  └──────────────┘  └────────────┘│
└─────────────────────────────────────────────────────┘
                          │ REST API
                          ↓
┌─────────────────────────────────────────────────────┐
│                 Backend (Node.js/Fastify)            │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────┐│
│  │   Routes     │  │   Services   │  │   Gemini   ││
│  │              │  │              │  │   Client   ││
│  └──────────────┘  └──────────────┘  └────────────┘│
└─────────────────────────────────────────────────────┘
           │                    │
           ↓                    ↓
    ┌─────────────┐      ┌─────────────┐
    │ PostgreSQL  │      │   Gemini    │
    │  Database   │      │     API     │
    └─────────────┘      └─────────────┘
```

## Core Components

### Frontend Architecture

#### 1. React Flow Canvas
- **Purpose**: Visual DAG rendering and interaction
- **Key Features**:
  - Auto-layout using Dagre algorithm
  - Custom node components
  - Minimap and controls
  - Zoom and pan
- **Files**: `frontend/src/components/Canvas.tsx`

#### 2. State Management (Zustand)
- **Store Structure**:
```typescript
{
  tree: Tree | null,           // Current tree
  nodes: TreeNode[],           // All nodes
  edges: TreeEdge[],           // All edges
  selectedNode: TreeNode | null,
  complexity: ComplexityLevel,
  isLoading: boolean,
  flattenResult: string | null,
  isFlattenOpen: boolean
}
```
- **Files**: `frontend/src/store.ts`

#### 3. Component Hierarchy
```
App
├── HeaderBar
│   ├── PromptInput
│   ├── ComplexitySlider
│   └── FlattenButton
├── Canvas (React Flow)
│   └── NodeCard (custom node)
├── BranchModal
├── DeepDiveModal
└── FlattenDrawer
```

### Backend Architecture

#### 1. API Layer (Fastify)
- **Routes**:
  - `/trees` - Tree CRUD operations
  - `/actions/branch` - Branch execution
  - `/actions/deep-dive` - Deep dive execution
  - `/actions/flatten` - Flatten execution
  - `/export/:id` - Export functionality

#### 2. Service Layer
- **GeminiClient**: Gemini API integration
  - Content generation
  - Streaming responses
  - JSON mode for structured output
  
- **Planner**: Reasoning orchestration
  - Branch planning (k options)
  - Deep dive planning (CU-based)
  - Cost estimation

- **GraphBuilder**: Node and edge management
  - Node creation and execution
  - Edge creation
  - Tree traversal

- **Summarizer**: Tree summarization
  - DFS traversal
  - Deduplication
  - Citation extraction

#### 3. Data Layer
- **Database Client**: PostgreSQL connection pool
- **Query Builder**: Raw SQL with parameterization
- **Migration System**: Schema versioning

## Data Flow

### 1. Branch Operation Flow

```
User clicks "Branch" 
    ↓
BranchModal opens
    ↓
User submits (hint, k, complexity)
    ↓
Frontend → POST /actions/branch
    ↓
Backend: Planner.planBranch()
    ↓
Gemini API: Generate k options
    ↓
Backend: GraphBuilder.buildBranchNodes()
    ↓
Database: Insert nodes & edges
    ↓
Response → Frontend
    ↓
Zustand: addNodes(), addEdges()
    ↓
React Flow re-renders with new layout
```

### 2. Deep Dive Operation Flow

```
User clicks "Deep Dive"
    ↓
DeepDiveModal opens
    ↓
User submits (description, complexity)
    ↓
Frontend → POST /actions/deep-dive
    ↓
Backend: Planner.planDeepDive()
    ↓
Gemini API: Plan steps within CU budget
    ↓
Backend: GraphBuilder.buildDeepDiveNodes()
    ↓
For each step:
  - Create node
  - Execute (Gemini API call)
  - Update status
    ↓
Database: Insert nodes & edges
    ↓
Response → Frontend
    ↓
Zustand: addNodes(), addEdges()
    ↓
React Flow re-renders
```

### 3. Flatten Operation Flow

```
User clicks "Flatten"
    ↓
Frontend → POST /actions/flatten
    ↓
Backend: Summarizer.flattenTree()
    ↓
Database: Fetch all nodes & edges
    ↓
DFS traversal from root
    ↓
Extract summaries & deduplicate
    ↓
Gemini API: Generate markdown summary
    ↓
Extract citations
    ↓
Response → Frontend
    ↓
Zustand: setFlattenResult()
    ↓
FlattenDrawer opens with markdown
```

## Database Schema

### Entity Relationships

```
users 1──n projects 1──n trees 1──n nodes
                                      │
                                      └──n edges
trees 1──n runs 1──n usage_events
users 1──1 wallets
```

### Key Tables

#### nodes
```sql
- id: UUID (PK)
- tree_id: UUID (FK → trees)
- parent_id: UUID (FK → nodes, nullable)
- type: 'llm' | 'research'
- prompt: TEXT
- result_text: TEXT
- status: 'pending' | 'running' | 'success' | 'error'
- cost_cents: INTEGER
- duration_ms: INTEGER
- citations_json: JSONB
```

#### edges
```sql
- id: UUID (PK)
- tree_id: UUID (FK → trees)
- source_id: UUID (FK → nodes)
- target_id: UUID (FK → nodes)
- label: VARCHAR
```

## Complexity System

### CU (Complexity Units) Budget

Each complexity level has a CU budget:
- **Intern**: 3 CU
- **Manager**: 12 CU
- **CEO**: 36 CU

### CU Costs
- LLM node: 1 CU
- Research node: 2 CU
- Branch (k branches): k × 1 CU

### Planning Algorithm

```python
def plan_deep_dive(cu_budget):
  steps = []
  remaining_cu = cu_budget
  
  # Ask Gemini to plan steps
  plan = gemini.plan(cu_budget)
  
  for step in plan.steps:
    cost = 2 if step.type == 'research' else 1
    if remaining_cu >= cost:
      steps.append(step)
      remaining_cu -= cost
    else:
      break
  
  return steps
```

## Gemini Integration

### API Patterns

#### 1. Branch Generation
```typescript
const systemPrompt = `Generate ${k} distinct options...`;
const result = await gemini.generateJSON(prompt, systemPrompt);
// Returns: { options: [{ title, rationale, outline }] }
```

#### 2. Deep Dive Planning
```typescript
const systemPrompt = `Plan steps within ${cu} CU budget...`;
const result = await gemini.generateJSON(prompt, systemPrompt);
// Returns: { steps: [{ title, type, summary }] }
```

#### 3. Flatten/Summarization
```typescript
const systemPrompt = `Summarize DAG nodes, deduplicate...`;
const result = await gemini.generateContent(nodesList, systemPrompt);
// Returns: Markdown text
```

### Error Handling

```typescript
try {
  const result = await gemini.generateContent(prompt);
} catch (error) {
  if (error.code === 'RATE_LIMIT') {
    // Exponential backoff retry
  } else if (error.code === 'SAFETY_BLOCK') {
    // Mark node as redacted
  } else {
    // General error handling
  }
}
```

## Performance Optimizations

### Frontend
1. **React Flow**:
   - Custom node memoization
   - Virtualized rendering for large trees
   - Debounced layout calculations

2. **State Management**:
   - Zustand selectors to prevent unnecessary re-renders
   - Local state for UI-only changes

### Backend
1. **Database**:
   - Indexed queries on tree_id, parent_id
   - Connection pooling (max 20)
   - Prepared statements

2. **Caching** (Redis, optional):
   - Node memoization by prompt hash
   - Tree metadata caching

3. **Gemini API**:
   - Request batching where possible
   - Timeout and retry logic
   - Rate limit handling

## Security Considerations

### API Security
- Input validation with Zod schemas
- SQL injection prevention (parameterized queries)
- Rate limiting per IP/user
- CORS configuration

### Data Security
- API keys server-side only
- PostgreSQL encryption at rest
- TLS/HTTPS in production
- Secrets in environment variables

## Deployment Architecture

### Development
```
localhost:5173 (Frontend - Vite)
    ↓ proxy
localhost:3000 (Backend - Fastify)
    ↓
localhost:5432 (PostgreSQL)
```

### Production (Docker)
```
nginx:80 (Frontend)
    ↓ proxy /api
backend:3000 (Fastify)
    ↓
postgres:5432 (PostgreSQL)
redis:6379 (Cache)
```

### Cloud (Railway + Vercel)
```
Vercel (Frontend CDN)
    ↓ API calls
Railway (Backend + PostgreSQL)
    ↓
Gemini API (Google Cloud)
```

## Extensibility Points

### 1. New Node Types
Add to `NodeType` enum and implement execution logic:
```typescript
// backend/src/services/graphBuilder.ts
async executeNode(node: Node) {
  switch(node.type) {
    case 'llm': return this.executeLLM(node);
    case 'research': return this.executeResearch(node);
    case 'code': return this.executeCode(node); // NEW
  }
}
```

### 2. New Actions
Add route and service:
```typescript
// backend/src/routes/actions.ts
fastify.post('/actions/merge', async (req, reply) => {
  // Merge two nodes/branches
});
```

### 3. Custom Prompts
Modify system prompts in:
- `backend/src/services/gemini.ts`
- Create prompt templates system

### 4. Alternative AI Providers
Implement adapter pattern:
```typescript
interface AIProvider {
  generateContent(prompt: string): Promise<string>;
  generateJSON<T>(prompt: string): Promise<T>;
}

class OpenAIProvider implements AIProvider { ... }
class GeminiProvider implements AIProvider { ... }
```

## Monitoring & Observability

### Metrics to Track
- API response times (P50, P95, P99)
- Gemini API latency
- Node execution success rate
- Database query performance
- Active WebSocket connections

### Logging
- Structured JSON logs
- Request/response logging
- Error stack traces
- User action tracking

### Alerting
- API errors > threshold
- Database connection failures
- Gemini API quota warnings

## Future Architecture Considerations

### Scalability
- Horizontal backend scaling (stateless)
- Database read replicas
- Message queue for async processing
- CDN for static assets

### Real-time Features
- WebSocket for live updates
- Collaborative editing (OT/CRDT)
- Presence indicators

### Advanced Features
- Vector database for semantic search
- Graph database for complex queries
- ML model fine-tuning
- Custom node execution runtime

