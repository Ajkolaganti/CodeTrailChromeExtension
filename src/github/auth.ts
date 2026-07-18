import type { AuthState } from "../types";
import { saveAuthState } from "../storage/settings";
import { GitHubClient } from "./client";

const GITHUB_AUTHORIZE_URL = "https://github.com/login/oauth/authorize";
const DEFAULT_BACKEND_URL = "http://localhost:8787";
const DEFAULT_SCOPE = "public_repo";

interface TokenExchangeResponse {
  access_token?: string;
  token_type?: string;
  scope?: string;
  error?: string;
  error_description?: string;
}

export async function connectGitHub(): Promise<AuthState> {
  ensureChromeIdentity();

  const clientId = import.meta.env.VITE_GITHUB_CLIENT_ID as string | undefined;
  if (!clientId) {
    throw new Error("Missing VITE_GITHUB_CLIENT_ID.");
  }

  const redirectUri = chrome.identity.getRedirectURL("github");
  const state = createOAuthState();
  const scope = (import.meta.env.VITE_GITHUB_SCOPE as string | undefined) || DEFAULT_SCOPE;
  const authUrl = new URL(GITHUB_AUTHORIZE_URL);
  authUrl.searchParams.set("client_id", clientId);
  authUrl.searchParams.set("redirect_uri", redirectUri);
  authUrl.searchParams.set("scope", scope);
  authUrl.searchParams.set("state", state);
  authUrl.searchParams.set("allow_signup", "true");

  const redirectResponse = await launchWebAuthFlow(authUrl.toString());
  const responseUrl = new URL(redirectResponse);
  const code = responseUrl.searchParams.get("code");
  const returnedState = responseUrl.searchParams.get("state");
  const oauthError = responseUrl.searchParams.get("error");

  if (oauthError) {
    throw new Error(responseUrl.searchParams.get("error_description") || oauthError);
  }

  if (!code || returnedState !== state) {
    throw new Error("GitHub OAuth state validation failed.");
  }

  const token = await exchangeCode(code, redirectUri);
  const client = new GitHubClient(token.access_token);
  const account = await client.getAuthenticatedUser();
  const authState: AuthState = {
    accessToken: token.access_token,
    tokenType: "bearer",
    scope: token.scope ?? scope,
    account,
    authenticatedAt: new Date().toISOString()
  };
  await saveAuthState(authState);
  return authState;
}

async function exchangeCode(code: string, redirectUri: string): Promise<Required<Pick<TokenExchangeResponse, "access_token">> & TokenExchangeResponse> {
  const backendUrl = (import.meta.env.VITE_OAUTH_BACKEND_URL as string | undefined) || DEFAULT_BACKEND_URL;
  const response = await fetch(`${backendUrl.replace(/\/$/, "")}/api/github/oauth/exchange`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code, redirectUri })
  });

  const body = (await response.json()) as TokenExchangeResponse;
  if (!response.ok || !body.access_token) {
    throw new Error(body.error_description || body.error || "GitHub token exchange failed.");
  }

  return body as Required<Pick<TokenExchangeResponse, "access_token">> & TokenExchangeResponse;
}

function createOAuthState(): string {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function launchWebAuthFlow(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    chrome.identity.launchWebAuthFlow({ url, interactive: true }, (responseUrl) => {
      const error = chrome.runtime.lastError;
      if (error) {
        reject(new Error(error.message));
        return;
      }
      if (!responseUrl) {
        reject(new Error("GitHub did not return an OAuth redirect."));
        return;
      }
      resolve(responseUrl);
    });
  });
}

function ensureChromeIdentity(): void {
  if (typeof chrome === "undefined" || !chrome.identity?.launchWebAuthFlow) {
    throw new Error("Chrome Identity API is unavailable.");
  }
}
