# skillpack - ORCHESTRATION.md

## Sub-agent build plan

This project follows the standard StackForge OSS CLI build pattern:

1. Wave 0 (done by scaffold): Baseline project structure
2. Wave 1: Skill validator implementation with frontmatter and syntax checking
3. Wave 2: Schema validation and dependency reference checking
4. Wave 3: Fixture-based testing engine with dry-run validation
5. Wave 4: Polish, README, smoke tests, CI

## Verification commands

```bash
npm test          # Unit tests
npm run build     # TypeScript compilation
bash scripts/validate.sh  # Full validation pipeline
skillpack validate fixtures/   # Real smoke test
```

## Commit target

~30-50 atomic commits. Split by: scaffold, parser, validator, schema, tests, fixtures, reporting, docs, CLI commands.
