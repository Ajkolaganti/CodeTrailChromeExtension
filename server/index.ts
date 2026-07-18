import "dotenv/config";
import cors from "cors";
import express from "express";

const app = express();
const port = Number(process.env.PORT ?? 8787);
const corsOptions = {
  origin(origin: string | undefined, callback: (error: Error | null, allow?: boolean) => void) {
    const allowed = getAllowedOrigins();
    if (!origin || allowed.includes(origin) || /^chrome-extension:\/\/[a-z]{32}$/.test(origin)) {
      callback(null, true);
      return;
    }
    callback(new Error("Origin is not allowed."));
  }
};

app.use(express.json({ limit: "32kb" }));
app.use(cors(corsOptions));
app.options("/api/github/oauth/exchange", cors(corsOptions));

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.post("/api/github/oauth/exchange", async (req, res) => {
  const { code, redirectUri } = req.body as { code?: string; redirectUri?: string };
  const clientId = process.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    res.status(500).json({ error: "server_not_configured" });
    return;
  }

  if (!code || !redirectUri) {
    res.status(400).json({ error: "invalid_request" });
    return;
  }

  const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      redirect_uri: redirectUri
    })
  });

  const body = (await tokenResponse.json()) as Record<string, unknown>;
  if (!tokenResponse.ok || body.error) {
    res.status(400).json({
      error: body.error ?? "token_exchange_failed",
      error_description: body.error_description
    });
    return;
  }

  res.json({
    access_token: body.access_token,
    token_type: body.token_type,
    scope: body.scope
  });
});

app.listen(port, () => {
  console.info(`CodeTrail OAuth backend listening on http://localhost:${port}`);
});

function getAllowedOrigins(): string[] {
  return (process.env.ALLOWED_EXTENSION_ORIGINS ?? "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
}
