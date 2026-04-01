---
name: verify
description: Run full project validation (build,lint, format, copyright headers) to catch issues before committing. IMPORTANT - Proactively invoke this skill after completing any code changes (new features, bug fixes, refactors) before reporting completion to the user.
---

Run the full validation suite for this project from the repository root:

```bash
yarn check:all
```

On failure:

1. Report which check failed and the specific errors
2. Auto-fix by invoking the `/fix` skill
3. Re-run `yarn check:all` to confirm everything passes
