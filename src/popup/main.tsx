import "../styles/global.css";
import { AlertTriangle, CheckCircle2, ExternalLink, Github, GitBranch, Info, LogOut, RefreshCw, Settings, UploadCloud, XCircle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { Field } from "../components/Field";
import { Logo } from "../components/Logo";
import { StatusPill } from "../components/StatusPill";
import { Toggle } from "../components/Toggle";
import type { CodeTrailSettings, GitHubRepository, RuntimeSnapshot } from "../types";
import { sendMessage } from "../utils/messages";
import { applyTheme } from "../utils/theme";

const selectClassName =
  "w-full rounded-md border border-ink-200 bg-white px-3 py-2 text-sm text-ink-700 outline-none transition focus:border-trail-500 focus:ring-2 focus:ring-trail-500/30 dark:border-ink-700 dark:bg-ink-800 dark:text-ink-50";

function Metric({
  label,
  value,
  tone = "neutral"
}: {
  label: string;
  value: number;
  tone?: "neutral" | "good" | "warning";
}) {
  const toneClass =
    tone === "good"
      ? "text-trail-700 dark:text-trail-100"
      : tone === "warning"
        ? "text-red-700 dark:text-red-200"
        : "text-ink-700 dark:text-ink-50";

  return (
    <div className="rounded-md border border-ink-200 bg-ink-50 px-3 py-2 dark:border-ink-700 dark:bg-ink-800">
      <p className="text-[11px] font-medium uppercase text-ink-500 dark:text-ink-200">{label}</p>
      <p className={`mt-1 text-2xl font-semibold tabular-nums ${toneClass}`}>{value}</p>
    </div>
  );
}

function Toast({
  kind,
  message
}: {
  kind: "success" | "error" | "info";
  message: string;
}) {
  const styles =
    kind === "success"
      ? "border-trail-500/30 bg-trail-700 text-white shadow-elevated"
      : kind === "error"
        ? "border-red-400/30 bg-red-600 text-white shadow-elevated"
        : "border-cobalt-400/30 bg-cobalt-700 text-white shadow-elevated";
  const icon =
    kind === "success" ? (
      <CheckCircle2 size={16} />
    ) : kind === "error" ? (
      <XCircle size={16} />
    ) : (
      <Info size={16} />
    );

  return (
    <div
      role={kind === "error" ? "alert" : "status"}
      aria-live={kind === "error" ? "assertive" : "polite"}
      className={`flex items-start gap-2 rounded-md border px-3 py-2 text-sm ${styles}`}
    >
      <span className="mt-0.5 shrink-0">{icon}</span>
      <span className="leading-5">{message}</span>
    </div>
  );
}

function PopupApp() {
  const [snapshot, setSnapshot] = useState<RuntimeSnapshot | null>(null);
  const [repositories, setRepositories] = useState<GitHubRepository[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<{ kind: "success" | "error" | "info"; message: string } | null>(null);

  useEffect(() => {
    void refresh();
  }, []);

  useEffect(() => {
    if (snapshot) applyTheme(snapshot.settings.theme);
  }, [snapshot]);

  useEffect(() => {
    if (!toast) return undefined;
    const timeout = window.setTimeout(() => setToast(null), 3000);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  const totalSynced = snapshot?.synced.length ?? 0;
  const selectedRepository = snapshot?.settings.selectedRepository;
  const pendingCount = snapshot?.queue.filter((item) => item.status === "pending").length ?? 0;
  const failedCount = snapshot?.queue.filter((item) => item.status === "failed").length ?? 0;

  async function refresh() {
    setError(null);
    setSnapshot(await sendMessage<RuntimeSnapshot>({ type: "GET_RUNTIME_SNAPSHOT" }));
  }

  async function run(action: () => Promise<void>, feedback?: { start?: string; success?: string; error?: string }) {
    if (feedback?.start) {
      setToast({ kind: "info", message: feedback.start });
    }
    setBusy(true);
    setError(null);
    try {
      await action();
      await refresh();
      if (feedback?.success) {
        setToast({ kind: "success", message: feedback.success });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Action failed.";
      setError(message);
      setToast({ kind: "error", message: feedback?.error ?? message });
    } finally {
      setBusy(false);
    }
  }

  async function updateSettings(settings: Partial<CodeTrailSettings>) {
    const next = await sendMessage<CodeTrailSettings>({ type: "UPDATE_SETTINGS", settings });
    setSnapshot((current) => (current ? { ...current, settings: next } : current));
  }

  async function loadRepositories() {
    const repos = await sendMessage<GitHubRepository[]>({ type: "LIST_REPOSITORIES" });
    setRepositories(repos.filter((repo) => repo.permissions?.push !== false));
  }

  const repoOptions = useMemo(() => {
    return repositories.map((repository) => (
      <option key={repository.id} value={repository.fullName}>
        {repository.fullName}
      </option>
    ));
  }, [repositories]);

  if (!snapshot) {
    return (
      <main className="app-surface w-[420px] p-4 text-ink-700 dark:text-ink-50">
        <Card className="space-y-3">
          <div className="flex items-center gap-3">
            <Logo size="sm" />
            <div>
              <h1 className="text-base font-semibold">CodeTrail</h1>
              <p className="text-xs text-ink-500 dark:text-ink-200">Loading workspace state</p>
            </div>
          </div>
          <div className="h-2 rounded-full bg-ink-100 dark:bg-ink-800">
            <div className="h-2 w-1/2 rounded-full bg-trail-500" />
          </div>
        </Card>
      </main>
    );
  }

  if (!snapshot.auth) {
    return (
      <main className="app-surface w-[420px] p-4 text-ink-700 dark:text-ink-50">
        <Card className="space-y-4 shadow-elevated">
          <div className="flex items-start gap-3">
            <Logo size="lg" />
            <div>
              <h1 className="text-xl font-semibold">CodeTrail</h1>
              <p className="mt-1 text-sm leading-5 text-ink-500 dark:text-ink-200">Connect GitHub to start syncing accepted submissions.</p>
            </div>
          </div>
          <div className="trail-line h-0.5" />
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="rounded-md border border-ink-200 bg-ink-50 p-3 dark:border-ink-700 dark:bg-ink-800">
              <GitBranch size={16} className="mb-2 text-cobalt-600 dark:text-cobalt-100" />
              <p className="font-medium">Repository setup</p>
            </div>
            <div className="rounded-md border border-ink-200 bg-ink-50 p-3 dark:border-ink-700 dark:bg-ink-800">
              <CheckCircle2 size={16} className="mb-2 text-trail-600 dark:text-trail-100" />
              <p className="font-medium">Accepted only</p>
            </div>
          </div>
          {error ? (
            <p className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
              {error}
            </p>
          ) : null}
          <Button className="w-full" disabled={busy} icon={<Github size={16} />} onClick={() => run(() => sendMessage({ type: "CONNECT_GITHUB" }))}>
            Connect GitHub
          </Button>
        </Card>
      </main>
    );
  }

  return (
    <main className="app-surface w-[440px] space-y-3 p-4 text-ink-700 dark:text-ink-50">
      <header className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <Logo size="sm" />
          <div>
            <h1 className="text-base font-semibold">CodeTrail</h1>
            <p className="text-xs text-ink-500 dark:text-ink-200">{snapshot.auth.account.login}</p>
          </div>
        </div>
        <StatusPill status={snapshot.status} compact />
      </header>

      {toast ? <Toast kind={toast.kind} message={toast.message} /> : null}

      <Card className="space-y-4">
        <div className="flex items-center gap-3">
          <img src={snapshot.auth.account.avatarUrl} alt="" className="h-11 w-11 rounded-lg ring-1 ring-ink-200 dark:ring-ink-700" />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{selectedRepository?.fullName ?? "No repository selected"}</p>
            <p className="truncate text-xs text-ink-500 dark:text-ink-200">{selectedRepository?.private ? "Private repository" : "GitHub repository"}</p>
          </div>
        </div>

        {repositories.length > 0 ? (
          <select
            className={selectClassName}
            value={selectedRepository?.fullName ?? ""}
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
            <option value="">Select a repository</option>
            {repoOptions}
          </select>
        ) : null}

        <div className="grid grid-cols-2 gap-2">
          <Button variant="secondary" disabled={busy} icon={<RefreshCw size={15} />} onClick={() => run(loadRepositories)}>
            Repositories
          </Button>
          <Button variant="secondary" disabled={busy} icon={<GitBranch size={15} />} onClick={() => run(() => sendMessage({ type: "CREATE_REPOSITORY", name: "codetrail" }))}>
            Create codetrail
          </Button>
        </div>
      </Card>

      <Card className="space-y-1">
        <Field label="Auto-sync" description="Commit accepted submissions automatically.">
          <Toggle label="Auto-sync" checked={snapshot.settings.autoSync} onChange={(value) => void updateSettings({ autoSync: value })} />
        </Field>
        <Field label="Accepted submissions only" description="Failed submissions are ignored by default.">
          <Toggle
            label="Accepted submissions only"
            checked={snapshot.settings.acceptedOnly}
            onChange={(value) => void updateSettings({ acceptedOnly: value })}
          />
        </Field>
        <label className="mt-2 block text-sm">
          <span className="mb-1 block font-medium">Duplicate behavior</span>
          <select
            className={selectClassName}
            value={snapshot.settings.duplicateBehavior}
            onChange={(event) => void updateSettings({ duplicateBehavior: event.target.value as "update" | "skip" })}
          >
            <option value="update">Update existing solution</option>
            <option value="skip">Skip duplicate</option>
          </select>
        </label>
      </Card>

      <Card className="grid grid-cols-3 gap-2 text-sm">
        <Metric label="Synced" value={totalSynced} tone="good" />
        <Metric label="Pending" value={pendingCount} />
        <Metric label="Failed" value={failedCount} tone={failedCount > 0 ? "warning" : "neutral"} />
      </Card>

      {snapshot.lastError || error ? (
        <div className="flex gap-2 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
          <AlertTriangle size={16} className="mt-0.5 shrink-0" />
          <span>{error ?? snapshot.lastError}</span>
        </div>
      ) : null}

      <div className="grid grid-cols-2 gap-2">
        <Button
          variant="secondary"
          disabled={busy || !selectedRepository}
          icon={failedCount > 0 ? <RefreshCw size={15} /> : <UploadCloud size={15} />}
          onClick={() =>
            run(() => sendMessage({ type: failedCount > 0 ? "RETRY_FAILED_SYNCS" : "PROCESS_SYNC_QUEUE" }), {
              start: failedCount > 0 ? "Retrying failed syncs..." : "Processing sync queue...",
              success: failedCount > 0 ? "Failed syncs retried." : "Sync processed.",
              error: failedCount > 0 ? "Retry failed." : "Sync failed."
            })
          }
        >
          {failedCount > 0 ? "Retry" : "Sync"}
        </Button>
        <Button
          variant="secondary"
          disabled={!selectedRepository}
          icon={<ExternalLink size={15} />}
          onClick={() => selectedRepository && chrome.tabs.create({ url: selectedRepository.htmlUrl })}
        >
          Open Repo
        </Button>
        <Button variant="ghost" icon={<Settings size={15} />} onClick={() => chrome.runtime.openOptionsPage()}>
          Settings
        </Button>
        <Button variant="ghost" icon={<LogOut size={15} />} onClick={() => run(() => sendMessage({ type: "DISCONNECT_GITHUB" }))}>
          Disconnect
        </Button>
      </div>
    </main>
  );
}

createRoot(document.getElementById("root") as HTMLElement).render(<PopupApp />);
