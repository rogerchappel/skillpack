# PRD: skillpack

Status: in-progress

## Summary

SkillPack is a local-first TypeScript CLI for packaging, validating, and testing agent skills (skills/ folders used by Claude Code, Cline, OpenClaw, and similar agents). It validates skill structure, schemas, markdown syntax, dependency references, and executes dry-run invocations to catch broken skills before they're shared.

Built for developers who build agent skills and teams that share skill directories — ensuring every skill in the repo actually works.

## Inspiration

- `mattpocock/skills` (96k+ stars) and `anthropics/skills` show massive demand for skill directories.
- `obra/superpowers` and `skillcrate/skilldeck/skillforge` backlog items exist but aren't built yet.
- No dedicated validation/testing CLI for the emerging `skills/` folder convention.

Reframed: skillpack is the **Jest for agent skills** — validate, test, and verify skills with fixtures before publishing.

## Scorecard

Total: 86/100
Band: build now

| Criterion | Points | Notes |
|---|---:|---|
| Problem pain | 17/20 | Skills proliferate quickly but break silently; no CI validation exists yet. |
| Demand signal | 18/20 | 96k+ stars on the top skills repo proves massive adoption of the skill pattern. |
| V1 buildability | 17/20 | Markdown parsing, JSON schema validation, and fixture-based dry runs are well-scoped. |
| Differentiation | 14/15 | First-mover on skill validation specifically, not just creation. |
| Agentic workflow leverage | 13/15 | Directly serves the skill-authoring loop for agents. |
| Distribution potential | 7/10 | Niche but clear audience; name is memorable. |

## MVP

- Validate `skills/<name>/SKILL.md` structure and required fields
- Check YAML frontmatter for required fields (name, description)
- Parse skill markdown and extract tool references, checking for valid syntax
- Fixture-based dry-run: apply skill to sample inputs without calling models
- Output: pass/fail report with line numbers for issues
- CLI: `skillpack validate [dir]`, `skillpack lint`, `skillpack test`, `skillpack report`

## Tech stack

TypeScript, Node.js CLI, no external dependencies for core validation

## Non-goals

- No skill generation or creation (that's skillforge's job)
- No model invocation or LLM calls
- No publishing to registries
