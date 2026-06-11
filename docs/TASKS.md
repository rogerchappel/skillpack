# skillpack - TASKS.md

## Wave 0: Scaffold & Baseline
- [x] Initialize git repo, package.json, tsconfig
- [x] Create project structure (src/, tests/, fixtures/
- [x] Set up CLI entry point with `src/index.ts`
- [x] Configure releasebox, CI workflows, validate script

## Wave 1: Skill Validator
- [x] Implement SkillParser: parse SKILL.md files, extract YAML frontmatter
- [x] Validate required fields: name, description, scope
- [x] Check markdown syntax: headers, code blocks, list structure
- [x] Unit tests with valid/invalid skill fixtures
- [x] CLI `skillpack validate <dir>` command

## Wave 2: Schema & Dependency Checker
- [x] Define skill JSON schema for frontmatter validation
- [x] Implement dependency reference check: tools, paths, other skills
- [x] Detect broken references: missing files, invalid tool names
- [x] Unit tests for schema validation and reference checking
- [x] CLI `skillpack lint <dir>` command
- [x] Warn when external side-effect instructions omit approval, preview, or dry-run boundaries

## Wave 3: Fixture Testing Engine
- [x] Implement FixtureRunner: apply skill to test inputs, capture output pattern
- [x] Support inline fixtures in SKILL.md (YAML code blocks)
- [ ] Support external fixture directory
- [x] Mock mode: validate skill structure without model calls
- [x] Unit tests with fixture suites
- [x] CLI `skillpack test <dir>` command

## Wave 4: Reporting & Polish
- [x] JSON + human-readable report generation
- [x] Exit codes based on validation failure thresholds
- [x] README with personality, examples, safety notes
- [x] Package metadata: description, keywords, repository
- [x] Smoke tests: validate real skill directories
- [ ] ReleaseBox config, CI workflow integration
