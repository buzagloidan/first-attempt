# Changelog

All notable changes to Buzaglo Engine will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.9.0] - 2025-10-10

### Added - MVP Release

#### Core Features
- 🌳 **Visual Tree Canvas**: Interactive DAG visualization with React Flow
- 🔀 **Branch Operation**: Generate multiple exploration paths from any node
- 🔍 **Deep Dive Operation**: Expand paths with adjustable complexity
- 📝 **Flatten Operation**: Summarize entire trees into markdown
- 💾 **Export Functionality**: JSON and Markdown export
- ⚙️ **Complexity Levels**: Intern, Manager, CEO with CU budgets

#### Backend
- Node.js + Fastify REST API
- PostgreSQL database with full schema
- Gemini 2.0 AI integration
- Planner service for reasoning orchestration
- GraphBuilder for node/edge management
- Summarizer for tree flattening
- Database migrations system
- Cost tracking and usage metering

#### Frontend
- React 18 + TypeScript
- React Flow canvas with auto-layout (Dagre)
- Zustand state management
- Custom node cards with status indicators
- Header bar with prompt input and complexity control
- Branch modal with hint input
- Deep dive modal with complexity info
- Flatten drawer with markdown rendering
- Dark theme with purple accents
- Responsive design

#### Documentation
- Comprehensive README
- Detailed SETUP guide
- QUICKSTART guide
- ARCHITECTURE documentation
- CONTRIBUTING guidelines
- API documentation
- Docker support
- Development scripts

#### Developer Experience
- TypeScript throughout
- ESLint + Prettier configuration
- Hot reload for frontend and backend
- Database migration scripts
- Environment variable templates
- Docker Compose setup
- Monorepo structure with npm workspaces

### Technical Details

**Dependencies:**
- React Flow 11.11
- Fastify 4.26
- Zustand 4.5
- PostgreSQL 14+
- Google Generative AI 0.21
- Dagre 0.8

**Database Tables:**
- users, projects, trees, nodes, edges
- runs, usage_events, wallets, providers

**API Endpoints:**
- POST /trees - Create tree
- GET /trees/:id - Get tree
- POST /actions/branch - Execute branch
- POST /actions/deep-dive - Execute deep dive
- POST /actions/flatten - Execute flatten
- POST /export/:id - Export tree

### Known Limitations (MVP)

- No authentication system yet
- No real-time collaboration
- Export to PNG/SVG not implemented
- No mobile optimization
- Limited error recovery
- No undo/redo functionality

### Performance

- Canvas renders 300 nodes at 60 FPS
- Flatten operation: <2s for 100-node trees
- Deep dive (Manager): ~2 min for 8-10 nodes
- Database queries: indexed and optimized

### Security

- API keys server-side only
- SQL injection prevention
- Input validation with Zod
- CORS configuration
- TLS support ready

## [Unreleased]

### Planned for v1.0

- [ ] Authentication (email + magic link)
- [ ] Real-time collaboration (WebSockets)
- [ ] PNG/SVG export
- [ ] Undo/redo functionality
- [ ] Keyboard shortcuts
- [ ] Mobile responsive design
- [ ] Search/filter nodes
- [ ] Auto-save
- [ ] User profiles
- [ ] Billing integration

### Planned for v1.1

- [ ] Research nodes with external tools
- [ ] Code interpreter nodes
- [ ] Multi-model support (OpenAI, Claude)
- [ ] Template library
- [ ] Shared tree links
- [ ] Comments on nodes
- [ ] Version history
- [ ] Advanced analytics

### Long-term Roadmap

- Second brain / knowledge graph
- Auto mode (autonomous exploration)
- Custom plugins/tools
- Team workspaces
- API marketplace
- Mobile apps
- Voice input
- Slides/podcast generation

## Version History

### [0.9.0] - 2025-10-10
Initial MVP release

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for how to contribute to this project.

## Support

- GitHub Issues: Report bugs and request features
- Documentation: See README.md and other docs
- Discussions: Ask questions and share ideas

