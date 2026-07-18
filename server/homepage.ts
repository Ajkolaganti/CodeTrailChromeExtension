export function buildHomepageHtml(): string {
  const year = new Date().getFullYear();

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="color-scheme" content="dark light" />
    <title>CodeTrail | Sync LeetCode submissions to GitHub</title>
    <meta
      name="description"
      content="CodeTrail is a Chrome extension and OAuth backend that syncs accepted LeetCode submissions to GitHub with a clean portfolio README."
    />
    <style>
      :root {
        color-scheme: dark;
        --bg: #050816;
        --bg-2: #091121;
        --panel: rgba(10, 18, 34, 0.84);
        --panel-strong: rgba(14, 24, 42, 0.92);
        --line: rgba(167, 179, 214, 0.14);
        --text: #f4f7ff;
        --muted: #aeb9d5;
        --accent: #4be37f;
        --accent-2: #57c8ff;
        --accent-3: #f7c863;
        --shadow: 0 24px 80px rgba(0, 0, 0, 0.42);
        --radius: 24px;
      }

      * { box-sizing: border-box; }
      html { scroll-behavior: smooth; }
      body {
        margin: 0;
        min-height: 100dvh;
        background:
          radial-gradient(1200px circle at 15% 10%, rgba(75, 227, 127, 0.08), transparent 35%),
          radial-gradient(900px circle at 85% 18%, rgba(87, 200, 255, 0.08), transparent 32%),
          linear-gradient(180deg, #040712 0%, #060b17 45%, #050816 100%);
        color: var(--text);
        font: 16px/1.5 Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        text-rendering: optimizeLegibility;
      }
      a { color: inherit; text-decoration: none; }
      a:focus-visible, button:focus-visible {
        outline: 3px solid rgba(75, 227, 127, 0.55);
        outline-offset: 3px;
      }
      .page {
        position: relative;
        overflow: hidden;
      }
      .page::before {
        content: "";
        position: fixed;
        inset: 0;
        pointer-events: none;
        background-image:
          linear-gradient(rgba(255, 255, 255, 0.025) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255, 255, 255, 0.025) 1px, transparent 1px);
        background-size: 56px 56px;
        mask-image: linear-gradient(180deg, rgba(0, 0, 0, 0.8), transparent 92%);
      }
      .wrap {
        width: min(1160px, calc(100% - 32px));
        margin: 0 auto;
      }
      .topbar {
        position: sticky;
        top: 0;
        z-index: 20;
        backdrop-filter: blur(20px);
        background: rgba(5, 8, 22, 0.72);
        border-bottom: 1px solid rgba(167, 179, 214, 0.08);
      }
      .topbar-inner {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        padding: 18px 0;
      }
      .brand {
        display: inline-flex;
        align-items: center;
        gap: 14px;
        min-width: 0;
      }
      .brand img {
        width: 42px;
        height: 42px;
        border-radius: 12px;
        box-shadow: 0 10px 24px rgba(75, 227, 127, 0.18);
      }
      .brand-copy {
        display: grid;
        gap: 2px;
        min-width: 0;
      }
      .brand-copy strong {
        font-size: 15px;
        letter-spacing: 0.01em;
      }
      .brand-copy span {
        color: var(--muted);
        font-size: 13px;
      }
      .nav {
        display: flex;
        align-items: center;
        gap: 18px;
        flex-wrap: wrap;
        justify-content: flex-end;
        color: var(--muted);
        font-size: 14px;
      }
      .nav a:hover { color: var(--text); }
      .status-chip {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 10px 14px;
        border: 1px solid rgba(75, 227, 127, 0.2);
        border-radius: 999px;
        background: rgba(75, 227, 127, 0.08);
        color: #d8ffe6;
        font-size: 13px;
      }
      .dot {
        width: 8px;
        height: 8px;
        border-radius: 999px;
        background: var(--accent);
        box-shadow: 0 0 0 6px rgba(75, 227, 127, 0.12);
      }
      .hero {
        display: grid;
        grid-template-columns: 1.05fr 0.95fr;
        gap: 28px;
        align-items: center;
        padding: 72px 0 42px;
      }
      .eyebrow {
        display: inline-flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 18px;
        padding: 9px 14px;
        border: 1px solid var(--line);
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.03);
        color: var(--muted);
        font-size: 13px;
      }
      h1 {
        margin: 0;
        font-size: clamp(3rem, 5vw, 5.25rem);
        line-height: 0.98;
        letter-spacing: -0.04em;
        max-width: 9.5ch;
      }
      .lead {
        margin: 22px 0 0;
        max-width: 58ch;
        color: var(--muted);
        font-size: 1.08rem;
      }
      .cta-row {
        display: flex;
        gap: 12px;
        flex-wrap: wrap;
        margin-top: 28px;
      }
      .btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
        min-height: 48px;
        padding: 0 18px;
        border-radius: 14px;
        border: 1px solid transparent;
        font-weight: 600;
        transition: transform 180ms ease, background 180ms ease, border-color 180ms ease;
      }
      .btn:hover { transform: translateY(-1px); }
      .btn-primary {
        background: linear-gradient(135deg, #4be37f 0%, #2fc16a 100%);
        color: #04100a;
        box-shadow: 0 18px 40px rgba(75, 227, 127, 0.18);
      }
      .btn-secondary {
        border-color: rgba(167, 179, 214, 0.18);
        background: rgba(255, 255, 255, 0.03);
        color: var(--text);
      }
      .meta-row {
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
        margin-top: 18px;
        color: var(--muted);
        font-size: 13px;
      }
      .meta-pill {
        padding: 8px 12px;
        border-radius: 999px;
        border: 1px solid var(--line);
        background: rgba(255, 255, 255, 0.02);
      }
      .showcase {
        position: relative;
        min-height: 640px;
        border-radius: calc(var(--radius) + 6px);
        border: 1px solid rgba(167, 179, 214, 0.14);
        background:
          linear-gradient(180deg, rgba(12, 20, 37, 0.94), rgba(7, 12, 24, 0.96)),
          linear-gradient(135deg, rgba(75, 227, 127, 0.08), transparent 45%);
        box-shadow: var(--shadow);
        overflow: hidden;
      }
      .showcase::before {
        content: "";
        position: absolute;
        inset: 0;
        background:
          radial-gradient(circle at top left, rgba(75, 227, 127, 0.12), transparent 32%),
          radial-gradient(circle at 78% 18%, rgba(87, 200, 255, 0.12), transparent 26%);
      }
      .showcase-inner {
        position: relative;
        display: grid;
        gap: 16px;
        padding: 24px;
      }
      .panel {
        border: 1px solid rgba(167, 179, 214, 0.14);
        background: rgba(6, 11, 22, 0.74);
        border-radius: 20px;
        overflow: hidden;
      }
      .panel-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        padding: 16px 18px;
        border-bottom: 1px solid rgba(167, 179, 214, 0.08);
      }
      .panel-head strong {
        font-size: 14px;
        letter-spacing: 0.02em;
      }
      .status {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 8px 12px;
        border-radius: 999px;
        background: rgba(75, 227, 127, 0.09);
        color: #d8ffe6;
        font-size: 12px;
      }
      .sync-grid {
        display: grid;
        grid-template-columns: 1fr;
        gap: 12px;
        padding: 18px;
      }
      .sync-line {
        display: grid;
        grid-template-columns: auto 1fr auto;
        align-items: center;
        gap: 12px;
        padding: 14px 16px;
        border-radius: 16px;
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid rgba(167, 179, 214, 0.1);
      }
      .sync-badge {
        width: 34px;
        height: 34px;
        border-radius: 11px;
        display: grid;
        place-items: center;
        background: rgba(75, 227, 127, 0.12);
        color: var(--accent);
        font-weight: 700;
      }
      .sync-line h3 {
        margin: 0;
        font-size: 14px;
      }
      .sync-line p {
        margin: 3px 0 0;
        color: var(--muted);
        font-size: 13px;
      }
      .sync-pill {
        padding: 8px 10px;
        border-radius: 999px;
        border: 1px solid rgba(87, 200, 255, 0.18);
        background: rgba(87, 200, 255, 0.08);
        color: #d5f1ff;
        font-size: 12px;
        white-space: nowrap;
      }
      .code-card {
        padding: 18px;
        margin-top: 8px;
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
        font-size: 12px;
        line-height: 1.75;
        color: #dbe6ff;
      }
      .code-card .dim { color: #7d8ba9; }
      .feature-band {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 14px;
        padding: 18px 0 34px;
      }
      .feature {
        border-top: 1px solid rgba(167, 179, 214, 0.14);
        padding-top: 18px;
      }
      .feature strong {
        display: block;
        font-size: 16px;
        margin-bottom: 6px;
      }
      .feature p {
        margin: 0;
        color: var(--muted);
        font-size: 14px;
      }
      .stats {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 14px;
        padding: 14px 0 54px;
      }
      .stat {
        padding: 18px;
        border-radius: var(--radius);
        border: 1px solid rgba(167, 179, 214, 0.14);
        background: rgba(255, 255, 255, 0.03);
      }
      .stat .label {
        color: var(--muted);
        font-size: 13px;
      }
      .stat .value {
        display: block;
        margin-top: 10px;
        font-size: clamp(1.8rem, 3vw, 2.5rem);
        letter-spacing: -0.04em;
      }
      .stat .note {
        display: block;
        margin-top: 8px;
        color: var(--muted);
        font-size: 13px;
      }
      .footer {
        padding: 18px 0 34px;
        color: var(--muted);
        font-size: 13px;
        display: flex;
        justify-content: space-between;
        gap: 14px;
        flex-wrap: wrap;
        border-top: 1px solid rgba(167, 179, 214, 0.08);
      }
      .footer a:hover { color: var(--text); }
      @media (max-width: 920px) {
        .hero,
        .feature-band,
        .stats {
          grid-template-columns: 1fr;
        }
        .showcase {
          min-height: 0;
        }
        .topbar-inner {
          align-items: flex-start;
          flex-direction: column;
        }
        h1 {
          max-width: none;
        }
      }
      @media (prefers-reduced-motion: reduce) {
        html { scroll-behavior: auto; }
        .btn { transition: none; }
        .btn:hover { transform: none; }
      }
    </style>
  </head>
  <body>
    <div class="page">
      <header class="topbar">
        <div class="wrap topbar-inner">
          <a class="brand" href="/" aria-label="CodeTrail home">
            <img src="/icon.svg" alt="" />
            <span class="brand-copy">
              <strong>CodeTrail</strong>
              <span>LeetCode to GitHub sync for accepted submissions</span>
            </span>
          </a>
          <nav class="nav" aria-label="Primary">
            <a href="#features">Features</a>
            <a href="#workflow">Workflow</a>
            <a href="https://github.com/Ajkolaganti/CodeTrailChromeExtension" target="_blank" rel="noreferrer">GitHub</a>
            <span class="status-chip"><span class="dot"></span>Backend live on Railway</span>
          </nav>
        </div>
      </header>

      <main>
        <section class="wrap hero">
          <div>
            <div class="eyebrow">Chrome extension + production OAuth backend</div>
            <h1>Ship accepted LeetCode work into GitHub.</h1>
            <p class="lead">
              CodeTrail watches for accepted submissions, captures the final code and metadata, and pushes them into a clean GitHub portfolio repo with README updates and retry handling.
            </p>
            <div class="cta-row">
              <a class="btn btn-primary" href="https://github.com/Ajkolaganti/CodeTrailChromeExtension" target="_blank" rel="noreferrer">View source</a>
              <a class="btn btn-secondary" href="/health">Check backend health</a>
            </div>
            <div class="meta-row" aria-label="Highlights">
              <span class="meta-pill">LeetCode detection</span>
              <span class="meta-pill">GitHub OAuth exchange</span>
              <span class="meta-pill">README portfolio sync</span>
            </div>
          </div>

          <div class="showcase" aria-label="CodeTrail product preview">
            <div class="showcase-inner">
              <div class="panel">
                <div class="panel-head">
                  <strong>Sync pipeline</strong>
                  <span class="status"><span class="dot"></span>Processing accepted submission</span>
                </div>
                <div class="sync-grid">
                  <div class="sync-line">
                    <div class="sync-badge">1</div>
                    <div>
                      <h3>Detect accepted run</h3>
                      <p>Observe LeetCode and capture the final accepted submission.</p>
                    </div>
                    <span class="sync-pill">LeetCode</span>
                  </div>
                  <div class="sync-line">
                    <div class="sync-badge">2</div>
                    <div>
                      <h3>Exchange GitHub token</h3>
                      <p>Use the Railway-hosted backend to complete OAuth securely.</p>
                    </div>
                    <span class="sync-pill">OAuth backend</span>
                  </div>
                  <div class="sync-line">
                    <div class="sync-badge">3</div>
                    <div>
                      <h3>Commit and update README</h3>
                      <p>Write the solution file, problem README, and portfolio index.</p>
                    </div>
                    <span class="sync-pill">GitHub repo</span>
                  </div>
                </div>
              </div>

              <div class="panel code-card">
                <div><span class="dim">status</span> &nbsp; accepted_detected</div>
                <div><span class="dim">queue</span> &nbsp; pending → syncing → committed</div>
                <div><span class="dim">repo</span> &nbsp; /solutions/medium/median-of-two-sorted-arrays.ts</div>
                <div><span class="dim">readme</span> &nbsp; README.md updated with new submission</div>
              </div>
            </div>
          </div>
        </section>

        <section id="features" class="wrap feature-band" aria-label="Features">
          <div class="feature">
            <strong>Quiet by default</strong>
            <p>No hinting, autocomplete, or distraction while you solve. It only reacts after acceptance.</p>
          </div>
          <div class="feature">
            <strong>Resilient sync</strong>
            <p>Queueing, retries, SHA conflict handling, and backend notifications keep the pipeline moving.</p>
          </div>
          <div class="feature">
            <strong>Portfolio-ready output</strong>
            <p>Every accepted submission updates the problem file and a structured README portfolio page.</p>
          </div>
        </section>

        <section id="workflow" class="wrap stats" aria-label="Workflow summary">
          <div class="stat">
            <span class="label">Capture</span>
            <strong class="value">LeetCode</strong>
            <span class="note">Detects accepted submissions and normalizes the metadata.</span>
          </div>
          <div class="stat">
            <span class="label">Commit</span>
            <strong class="value">GitHub</strong>
            <span class="note">Writes code, problem notes, and portfolio README updates.</span>
          </div>
          <div class="stat">
            <span class="label">Deploy</span>
            <strong class="value">Railway</strong>
            <span class="note">The OAuth exchange backend runs on the same production service.</span>
          </div>
        </section>

        <footer class="wrap footer">
          <span>© ${year} CodeTrail</span>
          <span>
            <a href="https://github.com/Ajkolaganti/CodeTrailChromeExtension" target="_blank" rel="noreferrer">Repository</a>
            &nbsp;·&nbsp;
            <a href="/health">Health</a>
          </span>
        </footer>
      </main>
    </div>
  </body>
</html>`;
}
