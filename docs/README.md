# skillpack Documentation

- [PRD.md](PRD.md) — Product Requirements Document
- [TASKS.md](TASKS.md) — Implementation tasks with priority
- [ORCHESTRATION.md](ORCHESTRATION.md) — Build orchestration plan
- [orchestration.json](orchestration.json) — Machine-readable task configuration

## Architecture

skillpack is a TypeScript library + CLI with clean separation:

```
src/
├── cli.ts              # CLI entry point (commands: validate, lint, test, report)
├── index.ts            # Library API exports
├── types.ts            # Core type definitions
├── parser.ts           # SKILL.md file parser (frontmatter + body)
├── schema.ts           # JSON schema validation engine
├── checker.ts          # File reference checker
├── runner.ts           # Inline fixture runner
├── ui/
│   └── colors.ts       # ANSI color helpers
├── validators/
│   ├── frontmatter.ts  # Required field validation
│   ├── markdown.ts     # Markdown syntax checker
│   ├── name.ts         # Skill name validator (kebab-case)
│   ├── version.ts      # Semver version validator
│   ├── tags.ts         # Tags array validator
│   └── scope.ts        # Scope category validator
└── commands/           # Command stubs for future plugin architecture
    ├── validate.ts
    ├── lint.ts
    ├── test.ts
    └── report.ts
tests/
├── frontmatter.test.js  # Frontmatter and parser tests (7 tests)
├── markdown.test.js     # Markdown syntax + checker/runner tests (7 tests)
├── validators.test.js   # Specialized validator tests (24 tests)
├── pack.test.js         # Package.json structural tests (7 tests)
├── integration.test.js  # End-to-end pipeline tests (8 tests)
└── total: 55 tests
fixtures/
├── skills/
│   ├── good-skill/SKILL.md  # Valid skill for testing
│   └── bad-skill/SKILL.md   # Broken skill for error detection
