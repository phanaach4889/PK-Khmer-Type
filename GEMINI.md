# Project & Workflow Rules

## 1. Strict Zero-Emoji Policy (Always Use Inline SVG Icons)
- Never use emoji Unicode characters anywhere in HTML, CSS, JavaScript, tutorial strings, status badges, documentation, commit messages, or responses.
- Always use crisp inline `<svg>` vector icons (`stroke="currentColor"`, `stroke-width="2.2"`, `stroke-linecap="round"`, `stroke-linejoin="round"`) for all UI badges, buttons, tooltips, and status indicators.

## 2. Always Validate, Commit, Push, and Auto-Deploy to GitHub When Done
Whenever you finish making code, asset, or documentation changes for a user request, you MUST execute this sequence before ending your turn (without waiting for the user to ask):
1. **Validate Syntax & Curriculum Integrity**:
   - Check modified JavaScript files with `node --check <file>`.
   - If curriculum or keyboard data was touched, run `node scripts/validate_curriculum.js`.
2. **Ensure GitHub Pages Deployment Completeness (`.github/workflows/deploy.yml`)**:
   - Whenever a new root HTML file, asset, or directory is added, verify it is included in the `_site/` staging step of `.github/workflows/deploy.yml` so GitHub Actions deploys it automatically.
3. **Stage, Commit, Rebase, and Push to `origin/main`**:
   - Stage all modified and newly created project files: `git add -A`
   - Commit with a clear, descriptive Conventional Commit message: `git commit -m "<type>(<scope>): <summary>"`
   - Pull with rebase to integrate any upstream changes cleanly: `git pull --rebase origin main`
   - Push immediately to GitHub (`git push origin main`) to trigger the automated GitHub Pages deployment workflow.
