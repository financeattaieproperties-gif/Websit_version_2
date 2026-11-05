# Agent Installation & Setup

**Installation Date**: 2026-07-07  
**Source**: [The Agency](https://github.com/msitarzewski/agency-agents)  
**Total Agents Installed**: 12  
**Installation Method**: Manual copy to `.github/agents/`

## ✅ Installation Complete

All agents have been copied to `.github/agents/` and are ready to use with GitHub Copilot CLI.

### Agent Categories

| Category | Count | Agents |
|----------|-------|--------|
| **Engineering** | 5 | Frontend Developer, Backend Architect, Code Reviewer, Database Optimizer |
| **Security** | 2 | Security Architect, AppSec Engineer |
| **Design** | 1 | UI Designer |
| **Product** | 1 | Product Manager |
| **Testing** | 3 | API Tester, Performance Benchmarker, Accessibility Auditor |
| **Project Management** | 1 | Project Shepherd |

## 🚀 Next Steps

### 1. Activate an Agent in Copilot

In your Copilot CLI session, activate an agent by referencing its name:

```bash
# Activate a specific agent
copilot -a frontend-developer

# Or in a message
"@frontend-developer: Help me build a React component for property listings"
```

### 2. Use Agent Workflows for Common Tasks

**For building features:**
1. Start with **Frontend Developer** or **Backend Architect** depending on the scope
2. Ask for a code review with **Code Reviewer**
3. Optimize with **Performance Benchmarker**

**For security work:**
1. Use **Security Architect** for threat modeling
2. Use **AppSec Engineer** for vulnerability remediation

**For accessibility:**
1. Use **Accessibility Auditor** to scan for WCAG issues
2. Use **UI Designer** to improve the design

**For API development:**
1. Use **Backend Architect** for API design
2. Use **API Tester** for comprehensive testing

### 3. Reference Project Documentation

The agents are aware of:
- `.github/copilot-instructions.md` — Project-specific conventions
- `AGENTS.md` — Comprehensive architecture guide
- `CLAUDE.md` — Established patterns and tech stack

Share these docs with agents for context if they need clarification on project structure.

## 📋 Agent Inventory

```
.github/agents/
├── README.md
├── design-ui-designer.md
├── engineering-backend-architect.md
├── engineering-code-reviewer.md
├── engineering-database-optimizer.md
├── engineering-frontend-developer.md
├── product-manager.md
├── project-management-project-shepherd.md
├── security-appsec-engineer.md
├── security-architect.md
├── testing-accessibility-auditor.md
├── testing-api-tester.md
└── testing-performance-benchmarker.md
```

## 🔄 Adding More Agents

To install additional agents from The Agency:

1. **From the agency-agents repo** (already cloned to `C:\projects\agency-agents`):
   ```bash
   cd C:\projects\agency-agents
   bash scripts/install.sh --tool copilot --division engineering,security,product,testing
   ```

2. **Or manually copy specific agents**:
   ```powershell
   cp "C:\projects\agency-agents\{division}\{agent-file}.md" ".github/agents/"
   ```

3. **Commit to version control**:
   ```bash
   git add .github/agents/
   git commit -m "Add Agency agents for Copilot"
   ```

## 📖 Resources

- **The Agency**: https://github.com/msitarzewski/agency-agents
- **Agent Descriptions**: See `.github/agents/README.md`
- **Project Guide**: See `.github/copilot-instructions.md`
- **Architecture**: See `AGENTS.md` and `CLAUDE.md`

## 💡 Tips

- Each agent has detailed instructions in their markdown file — read the "Critical Rules" and "Deliverables" sections
- Agents work best when given **specific context** (e.g., "I'm building a React component in the public site, not the admin panel")
- Use agents **sequentially** for complex work (e.g., design → code → review → test)
- Tag agents in messages to activate them: `@frontend-developer`, `@code-reviewer`, etc.

