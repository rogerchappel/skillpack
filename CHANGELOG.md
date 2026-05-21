# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Added
- `skillpack validate` — Scan and validate SKILL.md directory trees
- `skillpack lint` — Schema validation and reference checking
- `skillpack test` — Run inline fixtures with mock mode support
- `skillpack report` — Generate text or JSON validation reports
- YAML frontmatter parser with field extraction
- Frontmatter validator for required fields (name, description)
- Markdown syntax checker (unclosed blocks, bad headers, empty body)
- JSON schema validation with pattern matching
- File reference checker for broken paths
- Mock fixture runner with copy-paste detection
- Skill name validator (kebab-case enforcement)
- Version validator (semver compliance)
- Tags validator (format, duplicates, max count)
- Scope validator (20+ recognized category validation)
- Colorized terminal UI output
- Library API with clean exports
- Example skills directory
- 55 test cases across 9 suites

[Unreleased]: https://github.com/rogerchappel/skillpack/compare/v0.1.0...HEAD
