import "../styles/global.css";
import { AlertTriangle, Bell, Download, Github, GitBranch, LogOut, Moon, Plus, RefreshCw, ShieldCheck, Sun, Trash2, UploadCloud } from "lucide-react";
import { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { Field } from "../components/Field";
import { Logo } from "../components/Logo";
import { StatusPill } from "../components/StatusPill";
import { Toggle } from "../components/Toggle";
import type { CodeTrailSettings, GitHubRepository, PendingSyncItem, RuntimeSnapshot } from "../types";
import { sendMessage } from "../utils/messages";
import { applyTheme } from "../utils/theme";

const selectClassName =
  "min-h-11 rounded-md border border-ink-200 bg-white px-3 py-2 text-sm text-ink-700 outline-none transition focus:border-trail-500 focus:ring-2 focus:ring-trail-500/30 disabled:cursor-not-allowed disabled:opacity-60 dark:border-ink-700 dark:bg-ink-800 dark:text-ink-50";

function StatBlock({ label, value, tone = "neutral" }: { label: string; value: number; tone?: "neutral" | "good" | "warning" }) {
  const toneClass =
    tone === "good"
      ? "text-trail-700 dark:text-trail-100"
      : tone === "warning"
        ? "text-red-700 dark:text-red-200"
        : "text-ink-700 dark:text-ink-50";

  return (
    <div className="rounded-md border border-ink-200 bg-white/80 p-4 dark:border-ink-700 dark:bg-ink-800/80">
      <p className="text-xs font-medium uppercase text-ink-500 dark:text-ink-200">{label}</p>
      <p className={`mt-2 text-3xl font-semibold tabular-nums ${toneClass}`}>{value}</p>
    </div>
  );
}

function OptionsApp() {
  const [snapshot, setSnapshot] = useState<RuntimeSnapshot | null>(null);
  const [repositories, setRepositories] = useState<GitHubRepository[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void refresh();
  }, []);

  useEffect(() => {
    if (snapshot) applyTheme(snapshot.settings.theme);
  }, [snapshot]);

  async function refresh() {
    setSnapshot(await sendMessage<RuntimeSnapshot>({ type: "GET_RUNTIME_SNAPSHOT" }));
  }

  async function run(action: () => Promise<void>) {
    setBusy(true);
    setError(null);
    try {
      await action();
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Action failed.");
    } finally {
      setBusy(false);
    }
  }

  async function updateSettings(settings: Partial<CodeTrailSettings>) {
    const next = await sendMessage<CodeTrailSettings>({ type: "UPDATE_SETTINGS", settings });
    setSnapshot((current) => (current ? { ...current, settings: next } : current));
  }

  async function loadRepositories() {
    setRepositories(await sendMessage<GitHubRepository[]>({ type: "LIST_REPOSITORIES" }));
  }

  function exportPending(items: PendingSyncItem[]) {
    const blob = new Blob([JSON.stringify(items, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "codetrail-pending-submissions.json";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  if (!snapshot) {
    return (
      <main className="app-surface min-h-screen p-8 text-ink-500 dark:text-ink-200">
        <div className="mx-auto max-w-5xl">
          <Card className="max-w-md space-y-3">
            <div className="flex items-center gap-3">
              <Logo size="sm" />
              <div>
                <h1 className="text-base font-semibold text-ink-700 dark:text-ink-50">CodeTrail Settings</h1>
                <p className="text-sm">Loading workspace state</p>
              </div>
            </div>
            <div className="h-2 rounded-full bg-ink-100 dark:bg-ink-800">
              <div className="h-2 w-1/3 rounded-full bg-trail-500" />
            </div>
          </Card>
        </div>
      </main>
    );
  }

  const selectedRepository = snapshot.settings.selectedRepository;
  const pendingCount = snapshot.queue.filter((item) => item.status === "pending").length;
  const failedCount = snapshot.queue.filter((item) => item.status === "failed").length;

  return (
    <main className="app-surface min-h-screen px-5 py-6 text-ink-700 dark:text-ink-50">
      <div className="mx-auto max-w-5xl space-y-5">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <Logo size="lg" />
            <div className="min-w-0">
              <h1 className="text-3xl font-semibold tracking-normal">CodeTrail</h1>
              <p className="mt-1 truncate text-sm text-ink-500 dark:text-ink-200">
                {selectedRepository?.fullName ?? (snapshot.auth ? snapshot.auth.account.login : "GitHub not connected")}
              </p>
            </div>
          </div>
          <StatusPill status={snapshot.status} />
        </header>

        <div className="grid gap-3 sm:grid-cols-3">
          <StatBlock label="Synced" value={snapshot.synced.length} tone="good" />
          <StatBlock label="Queued" value={pendingCount} />
          <StatBlock label="Failed" value={failedCount} tone={failedCount > 0 ? "warning" : "neutral"} />
        </div>

        {error ? (
          <div className="flex gap-2 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
            <AlertTriangle size={16} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        ) : null}

        <Card className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold">GitHub Account</h2>
              <p className="text-sm text-ink-500 dark:text-ink-200">
                {snapshot.auth ? `Connected as ${snapshot.auth.account.login}` : "Not connected"}
              </p>
            </div>
            <div className="flex gap-2">
              {!snapshot.auth ? (
                <Button disabled={busy} icon={<Github size={16} />} onClick={() => run(() => sendMessage({ type: "CONNECT_GITHUB" }))}>
                  Connect GitHub
                </Button>
              ) : (
                <Button variant="danger" disabled={busy} icon={<LogOut size={16} />} onClick={() => run(() => sendMessage({ type: "DISCONNECT_GITHUB" }))}>
                  Disconnect GitHub
                </Button>
              )}
            </div>
          </div>

          {snapshot.auth ? (
            <div className="flex items-center gap-3 rounded-md border border-ink-200 bg-ink-50 p-3 dark:border-ink-700 dark:bg-ink-800">
              <img src={snapshot.auth.account.avatarUrl} alt="" className="h-12 w-12 rounded-lg ring-1 ring-ink-200 dark:ring-ink-700" />
              <div className="min-w-0">
                <p className="font-medium">{snapshot.auth.account.login}</p>
                <p className="truncate text-sm text-ink-500 dark:text-ink-200">{snapshot.auth.scope || "public_repo"}</p>
              </div>
            </div>
          ) : null}
        </Card>

        <Card className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold">Repository</h2>
              <p className="text-sm text-ink-500 dark:text-ink-200">{selectedRepository?.fullName ?? "Select or create a repository."}</p>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" disabled={busy || !snapshot.auth} icon={<RefreshCw size={16} />} onClick={() => run(loadRepositories)}>
                Fetch Repos
              </Button>
              <Button variant="secondary" disabled={busy || !snapshot.auth} icon={<Plus size={16} />} onClick={() => run(() => sendMessage({ type: "CREATE_REPOSITORY", name: "codetrail" }))}>
                Create codetrail
              </Button>
            </div>
          </div>

          <select
            className={`w-full ${selectClassName}`}
            value={selectedRepository?.fullName ?? ""}
            disabled={!repositories.length}
            onChange={(event) => {
              const repository = repositories.find((repo) => repo.fullName === event.target.value);
              if (!repository) return;
              void run(() =>
                sendMessage({
                  type: "SELECT_REPOSITORY",
                  repository: {
                    owner: repository.fullName.split("/")[0],
                    name: repository.name,
                    fullName: repository.fullName,
                    htmlUrl: repository.htmlUrl,
                    defaultBranch: repository.defaultBranch,
                    private: repository.private
                  }
                })
              );
            }}
          >
            <option value="">Choose repository</option>
            {repositories.map((repository) => (
              <option key={repository.id} value={repository.fullName}>
                {repository.fullName}
              </option>
            ))}
          </select>

          <Field label="Default branch" description="Used for GitHub file updates.">
            <input
              className={`w-40 ${selectClassName}`}
              value={snapshot.settings.defaultBranch ?? selectedRepository?.defaultBranch ?? "main"}
              onChange={(event) => void updateSettings({ defaultBranch: event.target.value })}
            />
          </Field>

          <div className="flex gap-2 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-100">
            <ShieldCheck size={16} className="mt-0.5 shrink-0" />
            <p>Public repositories expose synced source code. Use a private repository for private solutions.</p>
          </div>
        </Card>

        <Card>
          <h2 className="mb-3 text-lg font-semibold">Synchronization</h2>
          <Field label="Auto-sync" description="Automatically sync accepted submissions.">
            <Toggle label="Auto-sync" checked={snapshot.settings.autoSync} onChange={(value) => void updateSettings({ autoSync: value })} />
          </Field>
          <Field label="Duplicate handling" description="Default behavior updates existing solutions.">
            <select
              className={selectClassName}
              value={snapshot.settings.duplicateBehavior}
              onChange={(event) => void updateSettings({ duplicateBehavior: event.target.value as "update" | "skip" })}
            >
              <option value="update">Update existing solution</option>
              <option value="skip">Skip duplicate</option>
            </select>
          </Field>
          <Field label="Include performance statistics" description="Add runtime and memory when LeetCode exposes them.">
            <Toggle
              label="Include performance statistics"
              checked={snapshot.settings.includePerformanceStats}
              onChange={(value) => void updateSettings({ includePerformanceStats: value })}
            />
          </Field>
          <Field label="Desktop notifications" description="Show sync status notifications.">
            <Toggle
              label="Desktop notifications"
              checked={snapshot.settings.desktopNotifications}
              onChange={(value) => void updateSettings({ desktopNotifications: value })}
            />
          </Field>
          <Field label="Theme" description="Match the browser theme or choose a fixed appearance.">
            <select
              className={selectClassName}
              value={snapshot.settings.theme}
              onChange={(event) => void updateSettings({ theme: event.target.value as CodeTrailSettings["theme"] })}
            >
              <option value="system">System</option>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </Field>
        </Card>

        <Card className="space-y-3">
          <h2 className="text-lg font-semibold">Local Data</h2>
          <div className="grid gap-3 text-sm sm:grid-cols-3">
            <div className="rounded-md border border-ink-200 bg-ink-50 p-3 dark:border-ink-700 dark:bg-ink-800">
              <UploadCloud size={16} className="mb-2 text-trail-600 dark:text-trail-100" />
              <p className="font-medium">{snapshot.queue.length} pending records</p>
            </div>
            <div className="rounded-md border border-ink-200 bg-ink-50 p-3 dark:border-ink-700 dark:bg-ink-800">
              <GitBranch size={16} className="mb-2 text-cobalt-600 dark:text-cobalt-100" />
              <p className="font-medium">{selectedRepository?.defaultBranch ?? snapshot.settings.defaultBranch ?? "main"} branch</p>
            </div>
            <div className="rounded-md border border-ink-200 bg-ink-50 p-3 dark:border-ink-700 dark:bg-ink-800">
              {snapshot.settings.desktopNotifications ? (
                <Bell size={16} className="mb-2 text-cobalt-600 dark:text-cobalt-100" />
              ) : snapshot.settings.theme === "dark" ? (
                <Moon size={16} className="mb-2 text-cobalt-600 dark:text-cobalt-100" />
              ) : (
                <Sun size={16} className="mb-2 text-cobalt-600 dark:text-cobalt-100" />
              )}
              <p className="font-medium">{snapshot.settings.theme} theme</p>
            </div>
          </div>
          <div className="grid gap-2 sm:grid-cols-3">
            <Button
              variant="secondary"
              icon={<Download size={16} />}
              onClick={() => run(async () => exportPending(await sendMessage<PendingSyncItem[]>({ type: "EXPORT_PENDING_SUBMISSIONS" })))}
            >
              Export pending
            </Button>
            <Button variant="secondary" onClick={() => run(() => sendMessage({ type: "SIMULATE_ACCEPTED_SUBMISSION" }))}>
              Simulate accepted
            </Button>
            <Button variant="danger" icon={<Trash2 size={16} />} onClick={() => run(() => sendMessage({ type: "CLEAR_LOCAL_DATA" }))}>
              Clear local data
            </Button>
          </div>
        </Card>
      </div>
    </main>
  );
}

createRoot(document.getElementById("root") as HTMLElement).render(<OptionsApp />);
