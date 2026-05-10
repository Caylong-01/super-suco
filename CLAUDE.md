# Agent Instructions

## Environment
- OS: Windows
- Terminal: PowerShell

## Skill Orchestration
You have access to a global library of skills at `C:\Users\layla\.gemini\antigravity\skills\skills`.
To discover or load a skill, use the following commands:

| Task | Command |
|------|---------|
| Search Skills | `python C:\Users\layla\.gemini\antigravity\skills\scripts\find_skill.py "<query>" --index C:\Users\layla\.gemini\antigravity\skills\skills_index.json` |
| Load Skill | `type C:\Users\layla\.gemini\antigravity\skills\skills\<category>\<skill-id>\SKILL.md` |

## Commit Attribution
AI commits MUST include:
```
Co-Authored-By: OpenClaude <openclaude@gitlawb.ai>
```
