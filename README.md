# CodeTrail

> Solve it. Sync it. Show it.

CodeTrail is a production-ready Chrome extension MVP that syncs accepted LeetCode submissions to GitHub and organizes them into a recruiter-friendly portfolio repository.

CodeTrail does not provide answers, hints, autocomplete, or coding assistance while the user solves a problem. It only reacts after an accepted submission is detected.

## Features

- Manifest V3 Chrome extension built with React, TypeScript, Vite, Tailwind CSS, and Chrome Storage API.
- Secure GitHub OAuth flow using `chrome.identity.launchWebAuthFlow` and a backend authorization-code exchange.
- GitHub REST API integration for profile fetch, repository listing, repository creation, file create/update with SHAs, and README maintenance.
- LeetCode platform adapter isolated behind a `CodingPlatformAdapter` interface.
- Local pending sync queue with retry support.
- Popup and full settings page with repository selection, autosync, duplicate handling, notifications, data export, and mock submission simulation.
- Unit tests for mapping, paths, validation, duplicates, README generation, commits, queue behavior, GitHub errors, and LeetCode metadata normalization.

## Development

```bash
npm install
npm run server:dev
npm run dev
```

For extension testing, build the unpacked extension:

```bash
npm run build
```

Then load `dist/` in Chrome:

1. Open `chrome://extensions`.
2. Enable Developer mode.
3. Click **Load unpacked**.
4. Select the `dist` directory.
5. Pin CodeTrail and open the popup.

## GitHub OAuth Configuration

Create a GitHub OAuth App:

- Homepage URL: your product or backend URL.
- Authorization callback URL for local unpacked builds: use the value from `chrome.identity.getRedirectURL("github")`. In practice this is `https://<extension-id>.chromiumapp.org/github`.
- Scope: `public_repo` by default. Use `repo` only if private repository write access is required.

Configure `.env`:

```bash
VITE_GITHUB_CLIENT_ID=your_client_id
VITE_OAUTH_BACKEND_URL=http://localhost:8787
VITE_GITHUB_SCOPE=public_repo
GITHUB_CLIENT_ID=your_client_id
GITHUB_CLIENT_SECRET=your_client_secret
ALLOWED_EXTENSION_ORIGINS=chrome-extension://your-extension-id
PORT=8787
```

The GitHub client secret is used only by `server/index.ts`.

## LeetCode Manual Test Notes

LeetCode is a client-rendered site and can change selectors. The MVP adapter checks:

- Problem route: `/problems/:slug`.
- Accepted status text in common result containers and visible page text.
- GraphQL `question`, `questionSubmissionList`, and `submissionDetails` responses.
- DOM fallbacks for title, difficulty, language, runtime, memory, and Monaco code lines.

Manual browser testing should verify accepted detection, current submitted code extraction, and metadata capture after LeetCode UI changes.

## Production Build

```bash
npm run typecheck
npm run lint
npm run test
npm run build
```

Before publishing, set `VITE_OAUTH_BACKEND_URL` to an HTTPS backend and restrict `ALLOWED_EXTENSION_ORIGINS` to the final Chrome extension origin.

## Security

- No GitHub client secret is included in the extension bundle.
- Source code is never sent to an AI service.
- The extension does not collect analytics.
- Host permissions are limited to LeetCode, GitHub API, and the OAuth backend.
- Failed submissions are not saved by default.
- Public repository users are warned that synced code will be visible.
