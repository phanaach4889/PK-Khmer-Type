# Project & Workflow Rules

## 1. Strict Zero-Emoji Policy (Always Use Inline SVG Icons)
- Never use emoji characters (e.g., ✨, 🎉, 🚀, 🌐, ⭐, ✅, ❌) anywhere in HTML, CSS, JavaScript, tutorial strings, status badges, documentation, or responses.
- Always use crisp inline `<svg>` vector icons (`stroke="currentColor"`, `stroke-width="2.2"`, `stroke-linecap="round"`, `stroke-linejoin="round"`) for all UI badges, buttons, tooltips, and status indicators.

## 2. Always Commit and Push to GitHub After Completing Changes
Whenever you finish making code, asset, or documentation changes for a user request:
1. Stage all modified and newly created project files (`git add -A`).
2. Commit with a clear, descriptive commit message (`git commit -m "<type>(<scope>): <summary>"`).
3. Pull with rebase to integrate any upstream changes cleanly (`git pull --rebase origin main`), resolving any conflicts if they arise.
4. Push the commit immediately to GitHub (`git push origin main`) before ending your turn, without waiting for the user to ask.
