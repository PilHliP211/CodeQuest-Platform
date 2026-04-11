# A Skills-First Approach to Agentic Development

Notes on the restructuring we did to CodeQuest's planning docs, captured for an article.

## The Problem We Were Solving

The project had a 254-line `CLAUDE.md` trying to be everything at once: quick reference, style guide, architecture doc, security policy, anti-pattern list, dependency philosophy. It was doing the job it was designed for — telling the agent how to build the project — but it had two failure modes we wanted to fix:

1. **Every token counts against the working context.** A 250-line CLAUDE.md gets injected into every session, even when the agent is doing something trivial like fixing a typo in a README. The agent is paying rent on context it doesn't need.
2. **Big, undifferentiated instructions degrade quality.** When standards, patterns, architecture, and security rules are all in one file, the agent treats them as a homogeneous wall of "things to remember" rather than a set of focused references to consult at the right moment. Important rules get diluted by adjacent ones that don't apply.

The industry wisdom is "bigger CLAUDE.md = worse output." We felt that in practice.

## The Restructuring

Three moves, done in one commit:

### 1. Shrink CLAUDE.md to a pointer, not a manual

The new CLAUDE.md is 34 lines. It contains only:
- Project one-liner
- The five `npm run` commands
- Five hard rules (the non-negotiables — no `any`, no `eval`, no hardcoded content, no `console.log`, no `eslint-disable`)
- A "Where to Find Things" table pointing to `.claude/skills/`, `docs/ARCHITECTURE.md`, `docs/CONTENT_SCHEMA.md`, `docs/PRD.md`, `docs/stories/`

That's it. Everything else moved out.

The test was: *does every line in CLAUDE.md apply to every session?* If not, it moved to a skill.

### 2. Create `.claude/skills/` — 15 focused, single-concern guidance files

Each skill is one topic, loaded contextually:

**Standards (load for code-writing tasks):**
- `typescript-standards` — strict flags, no-any policy, discriminated unions
- `eslint-rules` — the project rule set with rationale
- `formatting` — Prettier config
- `naming-conventions` — files, symbols, boolean predicates
- `accessibility` — forms, keyboard, semantic HTML
- `dependency-policy` — the approved list and the "default no" stance
- `ci-and-quality-gates` — the four gates and what they enforce

**Patterns (load for specific kinds of work):**
- `react-component-structure` — file template, named exports, props pattern
- `react-context-pattern` — the canonical provider/hook/memo shape
- `localstorage-pattern` — the typed wrapper and per-domain stores
- `error-handling` — three boundaries and what to do at each

**Architecture (load for navigation and placement decisions):**
- `architecture-overview` — directory layout, four hard rules, where things go
- `content-pack-system` — the "no lesson content in platform code" rule
- `security-rules` — the no-eval pipeline and whitelist validation

**Cross-cutting:**
- `anti-patterns` — the "don't do this" quick reference
- `README.md` — index of when to load which skill

Each skill has a YAML frontmatter description explaining when to load it, so the agent (or a human) can decide which ones matter for a given task.

### 3. Break epics into granular, linkable stories with explicit skill bindings

`docs/stories/E-01-platform-shell.md` (one monolithic file, 19 subsections) became `docs/stories/E-01/` (one README + 19 individual story files). Same for E-02.

Crucially, **each story declares which skills to load before starting.** Example from `S-02.05-profile-context.md`:

```markdown
## Skills to Load

- `react-context-pattern` — the canonical provider/hook shape
- `react-component-structure` — file layout, named exports
- `localstorage-pattern` — provider does its own persistence
- `typescript-standards` — useMemo typing
```

The story doesn't repeat the patterns. It points at them.

## Why This Works

### Context is budgeted per task, not per session

Instead of shoving 250 lines into every session, the agent loads:
- 34 lines of CLAUDE.md (always)
- Plus 3–5 relevant skill files (per task)
- Plus the specific story it's working on

For a trivial task the footprint might be 50 lines. For a complex story touching React context and localStorage it might be 300 — but those 300 lines are the *right* 300 lines, not an averaged slice of the whole style guide.

### Agents match attention to specificity

When a rule lives in a file called `localstorage-pattern.md` that the agent just loaded because the current story said to, the rule has the agent's full attention. When the same rule is buried on line 137 of a 250-line CLAUDE.md, it's noise.

This is the same insight that makes "just-in-time context" work in traditional software: the closer a piece of information is to the point where it's needed, the more likely it is to be used correctly.

### Skills are refactorable

When the same pattern shows up in 10 stories, we update the skill once. When a new anti-pattern emerges, it goes in `anti-patterns.md` — not re-copied into every story that could trip on it. The stories stay thin because the knowledge lives upstream.

### Stories become real tickets, not chapters

Breaking `E-02` into 15 files meant each story fits in a single agent session with a single concern, has its own acceptance criteria, and can be completed and verified in isolation. You can hand `S-02.05-profile-context.md` to an agent and get a focused result. You cannot hand a 500-line epic document to an agent and get a focused result.

The story files average 30–60 lines. They include: dependencies, skills to load, task list, done-when checklist. Nothing else. The patterns they use come from the skills.

### Skill binding is the key mechanism

The `## Skills to Load` section on each story is the piece that makes this approach agentic rather than just organized documentation. It explicitly tells the agent: *for this task, these are the patterns that matter.* The agent doesn't have to guess which parts of the style guide apply. The story tells it.

This mirrors how a senior engineer mentors a junior: "before you start this ticket, go read the section on context providers and the one on localStorage wrappers." The story file is that mentorship, encoded.

## What Got Left In CLAUDE.md and Why

The five hard rules stayed in CLAUDE.md because they are universal constraints — violating any of them is a bug regardless of what the agent is doing. They're not patterns to apply; they're invariants that must always hold. That's the test for CLAUDE.md content: *is violating this always wrong, in every task?*

The `npm run` commands stayed because they're muscle memory the agent needs for every build/test cycle.

The "Where to Find Things" table stayed because the whole approach depends on the agent knowing where to look.

Everything else — how to structure a React component, how to name files, how to validate localStorage data, how to handle errors — went to skills, because those are context-dependent and shouldn't fill the context window on tasks that don't touch them.

## The Shape of the Result

```
CodeQuest-Platform/
├── CLAUDE.md                  # 34 lines — invariants and pointers
├── .claude/skills/
│   ├── README.md              # index: "load X when doing Y"
│   ├── typescript-standards.md
│   ├── eslint-rules.md
│   ├── react-component-structure.md
│   ├── react-context-pattern.md
│   ├── localstorage-pattern.md
│   ├── error-handling.md
│   ├── content-pack-system.md
│   ├── security-rules.md
│   └── ... (15 skills total)
└── docs/stories/
    ├── E-01/
    │   ├── README.md          # epic overview + dependency graph
    │   ├── S-01.01-vite-scaffold.md
    │   ├── S-01.02-tsconfig-strict.md
    │   └── ... (19 stories)
    └── E-02/
        ├── README.md
        └── ... (15 stories)
```

## The Mental Model

Think of it as three layers:

| Layer | Scope | Loaded |
|-------|-------|--------|
| **CLAUDE.md** | Invariants — things that are always true | Every session |
| **Skills** | Patterns and standards — reusable knowledge | Contextually, per task |
| **Stories** | Specific work items — tasks to do | Per story, when assigned |

The skills layer is the one most projects don't have. Most projects have either a giant CLAUDE.md (everything loaded always) or scattered docs with no agent binding (nothing loaded reliably). The skills layer is the middle ground: *structured, indexed, reusable knowledge, loaded on demand.*

## What We'd Do Differently Next Time

- Start with skills on day one. We retrofitted this after 254 lines of CLAUDE.md accumulated. Starting with skills-first would have been easier than unwinding them.
- Resist the urge to make skills comprehensive. Each skill should be the *minimum* an agent needs to apply a pattern correctly — not an exhaustive style guide chapter. Ours average ~100 lines each.
- Write the "when to load this" line in the frontmatter first, before the body. If you can't describe when it should be loaded, it's probably not a single skill — it's two skills glued together.

## Headline for the Article

"Stop writing bigger CLAUDE.md files. Start writing skills and binding them to tasks."

The core move is separating *invariants* (CLAUDE.md) from *patterns* (skills) from *work items* (stories), and letting each story explicitly declare which patterns it needs. That's the skills-first approach.
