# Contributing to Buzaglo Engine

Thank you for your interest in contributing to Buzaglo Engine! This document provides guidelines for contributing to the project.

## Code of Conduct

- Be respectful and inclusive
- Focus on constructive feedback
- Help others learn and grow
- Follow the project's coding standards

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/your-username/buzaglo-engine.git`
3. Create a branch: `git checkout -b feature/your-feature-name`
4. Follow the setup instructions in SETUP.md

## Development Workflow

### 1. Making Changes

- Write clear, concise commit messages
- Follow the existing code style
- Add comments for complex logic
- Update documentation as needed

### 2. Testing

Before submitting:
- Test your changes locally
- Ensure all existing features still work
- Add tests for new functionality (if applicable)
- Check for console errors and warnings

### 3. Code Style

We use:
- **Prettier** for formatting
- **ESLint** for linting
- **TypeScript** for type safety

Run before committing:
```bash
npm run lint
npm run format
```

### 4. Commit Messages

Follow conventional commits:
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting, etc.)
- `refactor:` Code refactoring
- `test:` Adding tests
- `chore:` Maintenance tasks

Examples:
```
feat: add export to PDF functionality
fix: resolve node layout overlap issue
docs: update setup instructions for Windows
```

### 5. Pull Requests

1. Update your branch with main:
```bash
git checkout main
git pull upstream main
git checkout your-branch
git rebase main
```

2. Push your changes:
```bash
git push origin your-branch
```

3. Create a Pull Request:
- Use a clear, descriptive title
- Reference any related issues
- Describe what changed and why
- Include screenshots for UI changes
- Request review from maintainers

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
Describe how you tested the changes

## Screenshots (if applicable)
Add screenshots here

## Checklist
- [ ] Code follows project style
- [ ] Self-reviewed the code
- [ ] Commented complex areas
- [ ] Updated documentation
- [ ] No new warnings
- [ ] Added tests (if applicable)
```

## Project Structure

### Backend (`/backend`)
- `/src/db` - Database client and schemas
- `/src/routes` - API endpoints
- `/src/services` - Business logic (Gemini, Planner, etc.)
- `/src/types` - TypeScript interfaces

### Frontend (`/frontend`)
- `/src/components` - React components
- `/src/api.ts` - API client
- `/src/store.ts` - State management
- `/src/types.ts` - TypeScript types

## Areas for Contribution

### High Priority
- [ ] Add unit tests
- [ ] Implement SSE streaming for real-time updates
- [ ] Add authentication system
- [ ] Improve error handling
- [ ] Add loading states and skeleton screens
- [ ] Optimize React Flow performance

### Medium Priority
- [ ] Add keyboard shortcuts
- [ ] Implement undo/redo
- [ ] Add dark/light theme toggle
- [ ] Export to PNG/SVG
- [ ] Add search/filter for nodes
- [ ] Improve mobile responsiveness

### Low Priority
- [ ] Add multi-language support
- [ ] Create VS Code extension
- [ ] Add video tutorials
- [ ] Create component storybook

## Feature Requests

To suggest a new feature:
1. Check existing issues first
2. Create a new issue with label `enhancement`
3. Describe the feature and use case
4. Discuss with maintainers before implementing

## Bug Reports

To report a bug:
1. Check if already reported
2. Create issue with label `bug`
3. Include:
   - Steps to reproduce
   - Expected behavior
   - Actual behavior
   - Screenshots/logs
   - Environment (OS, browser, versions)

## Documentation

Documentation improvements are always welcome:
- Fix typos
- Clarify instructions
- Add examples
- Translate to other languages
- Create video tutorials

## Questions?

- Open a GitHub Discussion
- Check existing issues
- Review the README and SETUP docs

## Recognition

Contributors will be:
- Listed in CONTRIBUTORS.md
- Mentioned in release notes
- Credited in documentation

Thank you for contributing! 🎉

