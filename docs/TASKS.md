# skillpack - TASKS.md

## Wave 0: Scaffold & Baseline
- [x] Initialize git repo, package.json, tsconfig
- [x] Create project structure (src/, tests/, fixtures/
- [x] Set up CLI entry point with `src/index.ts`
- [x] Configure releasebox, CI workflows, validate script

## Wave 1: Skill Validator
- [ ] Implement SkillParser: parse SKILL.md files, extract YAML frontmatter
- [ ] Validate required fields: name, description, scope
- [ ] Check markdown syntax: headers, code blocks, list structure
- [ ] Unit tests with valid/invalid skill fixtures
- [ ] CLI `skillpack validate <dir>` command

## Wave 2: Schema & Dependency Checker
- [ ] Define skill JSON schema for frontmatter validation
- [ ] Implement dependency reference check: tools, paths, other skills
- [ ] Detect broken references: missing files, invalid tool names
- [ ] Unit tests for schema validation and reference checking
- [ ] CLI `skillpack lint <dir>` command

## Wave 3: Fixture Testing Engine
- [ ] Implement FixtureRunner: apply skill to test inputs, capture output pattern
- [ ] Support inline fixtures in SKILL.md (YAML code blocks)
- [ ] Support external fixture directory
- [ ] Mock mode: validate skill structure without model calls
- [ ] Unit tests with fixture suites
- [ ] CLI `skillpack test <dir>` command

## Wave 4: Reporting & Polish
- [ ] JSON + human-readable report generation
- [ ] Exit codes based on validation failure thresholds
- [ ] README with personality, examples, safety notes
- [ ] Package metadata: description, keywords, repository
- [ ] Smoke tests: validate real skill directories
- [ ] ReleaseBox config, CI workflow integration
