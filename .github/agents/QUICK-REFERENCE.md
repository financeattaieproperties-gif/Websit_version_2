# 🤖 Agent Quick Reference

## Agents by Use Case

### 🎨 Building the Landing Page / UI
- **Frontend Developer**: React components, animations (framer-motion), Tailwind styling
- **UI Designer**: Design system, visual consistency, layout patterns
- **Accessibility Auditor**: WCAG compliance, keyboard navigation, screen reader support

### 🏗️ Building APIs & Backend
- **Backend Architect**: PHP API design, database schema, RESTful patterns
- **Database Optimizer**: SQL query optimization, MySQL indexing, schema design
- **API Tester**: Testing PHP endpoints, request/response validation

### 🔍 Code Quality & Review
- **Code Reviewer**: Bug detection, maintainability, security issues
- **Performance Benchmarker**: Profiling, optimization, bundle analysis

### 🛡️ Security & Compliance
- **Security Architect**: Threat modeling, authentication design, data protection
- **AppSec Engineer**: SQL injection prevention, XSS prevention, credential management

### 📊 Product & Planning
- **Product Manager**: Feature prioritization, roadmap, business alignment
- **Project Shepherd**: Timeline management, scope control, risk mitigation

## For This Project

| Scenario | Primary Agent | Supporting Agents |
|----------|---------------|-------------------|
| Build property listing page | Frontend Developer | UI Designer, Accessibility Auditor |
| Build property search API | Backend Architect | Database Optimizer, API Tester |
| Fix security vulnerability | Security Architect | AppSec Engineer, Code Reviewer |
| Optimize page load time | Performance Benchmarker | Frontend Developer, Database Optimizer |
| Review PR before merge | Code Reviewer | Performance Benchmarker |
| Design new feature | Product Manager | Frontend Developer, Backend Architect |
| Plan sprint | Project Shepherd | Product Manager |
| Admin panel redesign | UI Designer | Frontend Developer (admin panel is React 18) |

## Activation Examples

\\\ash
# Activate and ask for help
copilot -a frontend-developer "Help me create a new React component"

# Chain agents for workflow
copilot -a frontend-developer -m "Build the property filter" && copilot -a code-reviewer -m "Review what I just built"

# Get multiple perspectives
copilot -a performance-benchmarker "Analyze the landing page speed"
\\\

## Key Points

- **React 19** (public site) vs **React 18** (admin) — tell the agent which one you're working on
- **Tailwind v4** — tokens in \@theme {}\ inside globals.css, NOT tailwind.config.ts
- **PHP backend** — no Node.js server, deployed to shared hosting
- **Bilingual** — English + Dari-Farsi with i18next
- **Security-sensitive** — DB credentials in .env.local (gitignored), use prepared statements

## Documentation to Share with Agents

When activating an agent, provide context from:
1. \.github/copilot-instructions.md\ — Quick reference for commands & conventions
2. \AGENTS.md\ — Detailed architecture, security, database schema
3. \CLAUDE.md\ — Established patterns and tech stack

Example: "Here's the project structure (from AGENTS.md): [paste relevant section]"

