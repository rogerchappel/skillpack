# skillpack 🦺

**The Jest for agent skill directories.**

Validate, lint, test, and package [SKILL.md](https://docs.openclaw.ai/skills) files for any AI agent ecosystem — Claude Code, Cline, OpenClaw, or custom agents.

```bash
npm install -g skillpack
skillpack validate ./skills/
```

Or use it without installing:

```bash
npx skillpack validate ./skills/
```

## Why?

Agent skills are markdown files with YAML frontmatter. They define what tools your AI agent can use, how to invoke them, and when. But skills rot: missing frontmatter, broken links, malformed markdown, and invalid schemas go undetected until an agent fails at the worst moment.

**skillpack** catches these issues before they reach production.

## Commands

### validate

Scan a directory tree and validate all `SKILL.md` files:

```
$ skillpack validate ./skills/

skillpack validate
scanning: ./skills/

Found 3 SKILL.md file(s):

  ✓ PASS  ./skills/code-review/SKILL.md
  ✓ PASS  ./skills/test-generator/SKILL.md
  ✗ FAIL  ./skills/old-skill/SKILL.md
      → MISSING_DESCRIPTION: Missing required field: 'description' (what this skill does)
      → UNCLOSED_CODE_BLOCK: Unclosed code block started at this line

Summary:
  3 files scanned
  2 passed, 1 failed
  2 errors, 0 warnings
```

### lint

Deeper schema checking, reference validation, and fixture analysis:

```
$ skillpack lint ./skills/

skillpack lint
scanning: ./skills/

Found 2 SKILL.md file(s):

  ✓ PASS  ./skills/code-review/SKILL.md
  ✓ PASS  ./skills/test-generator/SKILL.md

Lint summary:
  2 passed, 0 failed
```

### test

Run inline fixtures defined in SKILL.md files:

```yaml
# In your SKILL.md:
```yaml
# fixture: basic-input
input: "hello world"
expect: "HELLO WORLD"
```
```

```
$ skillpack test ./skills/

skillpack test
scanning: ./skills/

Running 4 fixture(s):

./skills/code-review/SKILL.md
  ✓ basic-input
  ✓ complex-test

./skills/test-generator/SKILL.md
  ✓ simple-case
  ✓ edge-case

Test summary:
  4 passed, 0 failed
```

### report

Generate a validation report (text or JSON):

```
$ skillpack report ./skills/ --json
[
  { "file": "code-review/SKILL.md", "status": "pass", "issues": [] },
  { "file": "old-skill/SKILL.md", "status": "fail", "issues": ["ERROR: MISSING_DESCRIPTION: ..."] }
]
```

## Validation Rules

skillpack validates:

| Category | Checks |
|----------|--------|
| **Frontmatter** | Required fields, type checking, empty values |
| **Schema** | Name format (kebab-case), semver version, field lengths |
| **Markdown** | Unclosed code blocks, malformed headers, empty body |
| **Safety** | Side-effect instructions that lack approval, preview, or dry-run boundaries |
| **Scope** | Known ecosystem categories (20+ recognized) |
| **Tags** | Array format, lowercase, no duplicates, max 20 tags |
| **References** | Broken file links, missing dependencies |
| **Fixtures** | Input/expect pairs, mock execution |

## As a Library

skillpack also works as a library in your toolchain:

```typescript
import { parseSkillFile, validateFrontmatter, validateFrontmatterSchema } from "skillpack";

const skill = parseSkillFile("./my-skill/SKILL.md");
const errors = [...validateFrontmatter(skill.frontmatter), ...validateFrontmatterSchema(skill.frontmatter)];
```

## Requirements

- Node.js ≥ 18.0.0
- TypeScript ≥ 5.9 (building from source)

## Verify

```bash
npm run check
npm test
npm run build
npm run smoke
npm run release:check
```

## License

MIT — see [LICENSE](LICENSE)
