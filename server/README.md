# CodeTrail OAuth Backend

This small backend exchanges GitHub OAuth authorization codes for access tokens. The GitHub client secret must stay here and must never be bundled into the Chrome extension.

## Environment

```bash
GITHUB_CLIENT_ID=your_github_oauth_app_client_id
GITHUB_CLIENT_SECRET=your_github_oauth_app_client_secret
ALLOWED_EXTENSION_ORIGINS=chrome-extension://your-extension-id
PORT=8787
```

## Local Development

```bash
npm run server:dev
```

## Deployment

Deploy the `server/` entrypoint to a Node.js host that supports environment variables, such as Fly.io, Render, Railway, Azure App Service, or a small container service. Set `VITE_OAUTH_BACKEND_URL` in the extension build to the deployed HTTPS origin.

Use HTTPS in production. Configure CORS with the exact Chrome extension origin once the extension ID is known.
