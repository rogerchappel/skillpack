# Release Candidate: skillpack

## Candidate

`release-candidate/skillpack` packages the current local-first skill validator with an added safety lint for external side-effect boundaries.

## Included

- Frontmatter, schema, markdown, scope, tags, reference, and fixture validation.
- CLI commands for `validate`, `lint`, `test`, and `report`.
- Warning when skill instructions mention external actions such as publishing, deploying, deleting, uploading, queueing, or opening PRs without nearby approval, preview, confirmation, or dry-run language.
- Fixture-backed tests and smoke command coverage.

## Verification

Run before release:

```bash
npm run check
npm test
npm run build
npm run smoke
npm run package:check
```

## Release Notes

- Improves skill safety review by surfacing missing side-effect boundaries during markdown validation.
- Keeps checks local-only; no model calls or external account writes are performed.
- Remaining follow-up: add external fixture directory loading and CI wiring for `release:check`.
