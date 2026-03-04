---
alwaysApply: true
description: "TAGS: [changelog,documentation,tracking] | TRIGGERS: any | SCOPE: global | DESCRIPTION: Change documentation protocol for CSOG workspace"
---
<rule>

# Change Documentation Protocol

## Core Rule

**[STRICT]** Every session that modifies files MUST document changes in CHANGELOG.md before session ends.

---

## Critical Files (Full Documentation)

```
CRITICAL_PATHS:
- .windsurf/rules/**/*.md
- .windsurf/workflows/*.md
- .windsurf/skills/**/*.md
- .claude/commands/*.md
- .claude/rules/*.md
- .cursor/rules/**/*.mdc
- CLAUDE.md, AGENTS.md, README.md
- CSOG-MANUAL-*.md
- MODULE-*.md
- FP-*.md
```

Required format:
```markdown
### File: `{path}`
**Modified**: {timestamp}
**Changes**: {description}
**Lines**: {affected lines}
**Impact**: {what it affects}
```

---

## Standard Files (Brief Documentation)

Required format:
```markdown
### File: `{path}`
**Change**: {one-line description}
```

---

## Session End Checklist

**[STRICT]** Before ending session:

```
□ Did I modify files? → Update CHANGELOG.md
□ Critical files modified? → Include full documentation
□ New files created? → Document in CHANGELOG.md
□ Structure changed? → Update README.md
```

---

## CHANGELOG.md Format

```markdown
## [{DATE}] - {Session Description}

### Summary
{Brief description}

### Files Modified
| File | Change Type | Description |
|------|-------------|-------------|
| `path` | Modified/Created | Brief description |

### Status: ✅ EXECUTED
```

---

**Version: 1.0 | Purpose: Change tracking**

</rule>
