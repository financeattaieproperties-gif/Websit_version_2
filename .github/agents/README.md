# Copilot Agents for Attaie Properties

This directory contains specialized AI agent personalities from [The Agency](https://github.com/msitarzewski/agency-agents) — a curated collection of expert agents for development, security, product, and testing.

## 🎯 Installed Agents

### Engineering (5 agents)
- **Frontend Developer** — Expert in React, TypeScript, UI implementation, and component architecture
- **Backend Architect** — Designs scalable PHP/MySQL backends, APIs, and system architecture
- **Code Reviewer** — Conducts thorough code reviews focusing on correctness, maintainability, and security
- **Database Optimizer** — Optimizes SQL queries, schemas, and database performance
- **Code-Reviewer** — High-confidence code analysis for bugs, security issues, and logic errors

### Security (2 agents)
- **Security Architect** — Designs secure systems, threat models, and security strategies
- **AppSec Engineer** — Identifies and remediates application security vulnerabilities

### Design (1 agent)
- **UI Designer** — Designs user interfaces, interaction patterns, and visual systems

### Product (1 agent)
- **Product Manager** — Manages product strategy, roadmaps, and prioritization

### Testing (3 agents)
- **API Tester** — Tests REST/GraphQL APIs for correctness, edge cases, and performance
- **Performance Benchmarker** — Profiles and benchmarks code for optimization
- **Accessibility Auditor** — Audits for WCAG compliance and accessibility issues

### Project Management (1 agent)
- **Project Shepherd** — Manages timelines, scope, stakeholder communication, and risk

## 📖 How to Use

Each agent file is a Markdown document with detailed instructions. To activate an agent in a GitHub Copilot CLI session:

```bash
copilot -a engineering-frontend-developer  # Activate the Frontend Developer agent
```

Or reference the agent mode in conversation:

> "Hey Claude, activate Frontend Developer mode and help me build a React component for property listings."

## 🔗 For This Project

The Attaie Properties codebase is a **bilingual real estate website + admin CRM** with:
- **Public site**: Vite + React 19 + TypeScript + Tailwind v4 + i18next
- **Admin CRM**: Electron + Vite + React 18 + PHP/MySQL backend

**Recommended agent flows**:
1. **Feature development**: Frontend Developer → Code Reviewer → Performance Benchmarker
2. **API work**: Backend Architect → API Tester → Database Optimizer
3. **Security review**: Security Architect → AppSec Engineer
4. **UI/UX work**: UI Designer → Accessibility Auditor
5. **Planning**: Product Manager → Project Shepherd

## 📚 Source

All agents are from [The Agency](https://github.com/msitarzewski/agency-agents) by [Marcin Sitarzewski](https://github.com/msitarzewski). 

To install more agents or manage the roster:
```bash
# Clone the full agency-agents repo (already done in C:\projects\agency-agents)
cd C:\projects\agency-agents

# Run the interactive installer (from WSL/Git Bash)
bash scripts/install.sh --tool copilot --division engineering,security,product
```

See `.github/copilot-instructions.md` for project-specific conventions and guidelines.
