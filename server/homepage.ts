const SUPPORT_EMAIL = "contact@sidhiratech.com";

export function buildHomepageHtml(): string {
  return buildPageHtml({
    title: "CodeTrail | Sync accepted LeetCode submissions to GitHub",
    description:
      "CodeTrail captures accepted LeetCode submissions, commits them to GitHub, and keeps a clean portfolio of solved problems.",
    active: "home",
    body: `
      <section class="wrap hero">
        <div class="hero-copy">
          <div class="eyebrow">LeetCode to GitHub, without manual cleanup</div>
          <h1>Turn accepted practice into a polished GitHub portfolio.</h1>
          <p class="lead">
            CodeTrail watches for accepted LeetCode submissions, saves the final code, and updates your GitHub repo so your progress is organized, visible, and ready to share.
          </p>
          <div class="cta-row">
            <a class="btn btn-primary" href="https://github.com/Ajkolaganti/CodeTrailChromeExtension" target="_blank" rel="noreferrer">View on GitHub</a>
            <a class="btn btn-secondary" href="/support">Support</a>
          </div>
          <div class="meta-row" aria-label="Highlights">
            <span class="meta-pill">Accepted submissions only</span>
            <span class="meta-pill">GitHub sync</span>
            <span class="meta-pill">Portfolio README updates</span>
          </div>
        </div>

        <div class="hero-visual">
          <img class="hero-image" src="/marketing/promo-440x280.png" alt="CodeTrail promotional preview showing submission sync and GitHub portfolio updates" />
        </div>
      </section>

      <section class="wrap gallery" aria-label="Product screenshots">
        <div class="section-heading">
          <div>
            <p class="section-kicker">Product preview</p>
            <h2>What CodeTrail does for you</h2>
          </div>
          <p class="section-copy">
            The extension stays out of the way while you solve. When an answer is accepted, it takes over the repetitive work of storing and organizing that result.
          </p>
        </div>

        <div class="gallery-grid">
          <figure class="shot">
            <img src="/marketing/promo-440x280.png" alt="CodeTrail promotional preview" />
            <figcaption>
              <strong>Sync overview</strong>
              <span>Accepted runs flow into GitHub with clean commit history and portfolio updates.</span>
            </figcaption>
          </figure>
          <figure class="shot">
            <img src="/marketing/product-shot.png" alt="CodeTrail dashboard-style screenshot showing waiting, accepted, syncing, and committed states" />
            <figcaption>
              <strong>Live status</strong>
              <span>See when CodeTrail is waiting, syncing, or committed without guessing what happened.</span>
            </figcaption>
          </figure>
        </div>
      </section>

      <section class="wrap features" aria-label="Key features">
        <article class="feature">
          <span class="feature-mark">01</span>
          <h3>Capture accepted submissions</h3>
          <p>CodeTrail detects accepted LeetCode results and keeps only the solved version, not the failed attempts.</p>
        </article>
        <article class="feature">
          <span class="feature-mark">02</span>
          <h3>Sync to GitHub</h3>
          <p>Each accepted solution is pushed to a repository you control, with problem-level organization and README updates.</p>
        </article>
        <article class="feature">
          <span class="feature-mark">03</span>
          <h3>Show progress clearly</h3>
          <p>Your GitHub repo becomes a structured portfolio of solved problems instead of a pile of loose files.</p>
        </article>
      </section>

      <section class="wrap workflow" aria-label="How it works">
        <div class="section-heading">
          <div>
            <p class="section-kicker">Workflow</p>
            <h2>Simple enough to stay invisible</h2>
          </div>
          <p class="section-copy">
            Install it once, connect GitHub, and let the extension handle the handoff from accepted solution to repository.
          </p>
        </div>

        <div class="steps">
          <div class="step">
            <span class="step-number">1</span>
            <div>
              <strong>Solve on LeetCode</strong>
              <p>Work normally on the problem page or submission page.</p>
            </div>
          </div>
          <div class="step">
            <span class="step-number">2</span>
            <div>
              <strong>Accept and detect</strong>
              <p>CodeTrail watches for the accepted result and captures the final submission.</p>
            </div>
          </div>
          <div class="step">
            <span class="step-number">3</span>
            <div>
              <strong>Commit and organize</strong>
              <p>The solution, problem note, and portfolio README are updated in GitHub.</p>
            </div>
          </div>
        </div>
      </section>

      <section class="wrap support-band" aria-label="Support prompt">
        <div>
          <p class="section-kicker">Need help?</p>
          <h2>Support is one email away.</h2>
          <p class="section-copy">
            Questions about setup, GitHub connection, or sync behavior go to
            <a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a>.
          </p>
        </div>
        <div class="support-actions">
          <a class="btn btn-primary" href="/support">Open support page</a>
          <a class="btn btn-secondary" href="mailto:${SUPPORT_EMAIL}">Email support</a>
        </div>
      </section>
    `
  });
}

export function buildSupportHtml(): string {
  return buildPageHtml({
    title: "CodeTrail Support",
    description:
      "Get help with CodeTrail setup, GitHub connection, and LeetCode submission sync.",
    active: "support",
    body: `
      <section class="wrap hero support-hero">
        <div class="hero-copy">
          <div class="eyebrow">Support</div>
          <h1>Help with CodeTrail.</h1>
          <p class="lead">
            If the extension is not detecting submissions, GitHub login is failing, or you want help with setup, reach out and we will help you get it working.
          </p>
          <div class="cta-row">
            <a class="btn btn-primary" href="mailto:${SUPPORT_EMAIL}">Email ${SUPPORT_EMAIL}</a>
            <a class="btn btn-secondary" href="/">Back to home</a>
          </div>
        </div>

        <aside class="support-card">
          <p class="section-kicker">Contact</p>
          <h2>${SUPPORT_EMAIL}</h2>
          <p class="support-note">Use this address for setup help, bug reports, or extension upload questions.</p>
          <div class="support-points">
            <div>
              <strong>Common topics</strong>
              <span>GitHub connect, submission detection, sync status, and Chrome Web Store build questions.</span>
            </div>
            <div>
              <strong>Typical response</strong>
              <span>We keep replies focused and practical so you can get back to using the extension.</span>
            </div>
          </div>
        </aside>
      </section>
    `
  });
}

export function buildPrivacyHtml(): string {
  return buildPageHtml({
    title: "CodeTrail Privacy Policy",
    description:
      "Privacy policy for CodeTrail Chrome extension and OAuth backend, including what data is collected, how it is used, and who it is shared with.",
    active: "privacy",
    body: `
      <section class="wrap legal-hero">
        <div class="hero-copy">
          <div class="eyebrow">Privacy Policy</div>
          <h1>How CodeTrail handles data.</h1>
          <p class="lead">
            This page explains what information CodeTrail handles, why it handles that information, where it is stored, and who it is shared with. It is written to match the actual behavior of the extension and backend.
          </p>
          <div class="cta-row">
            <a class="btn btn-primary" href="mailto:${SUPPORT_EMAIL}">Contact ${SUPPORT_EMAIL}</a>
            <a class="btn btn-secondary" href="/">Back to home</a>
          </div>
        </div>

        <aside class="support-card">
          <p class="section-kicker">Short version</p>
          <h2>CodeTrail only handles the data required to sync accepted LeetCode submissions to GitHub.</h2>
          <p class="support-note">
            It does not sell personal data, does not use data for advertising, and does not intentionally collect browsing history or unrelated personal information.
          </p>
        </aside>
      </section>

      <section class="wrap legal-grid" aria-label="Privacy details">
        <article class="legal-card">
          <h2>1. What CodeTrail collects</h2>
          <p>CodeTrail handles the following categories of information when you use the extension:</p>
          <ul>
            <li><strong>LeetCode submission data:</strong> problem title, problem slug, problem URL, difficulty, language, submitted code, runtime, memory, and submission timestamp.</li>
            <li><strong>GitHub account and repository data:</strong> GitHub account profile information returned by GitHub, repository names, repository URLs, default branch, and repository selection settings.</li>
            <li><strong>Authentication data:</strong> GitHub OAuth access token, token type, scope, and authentication timestamp.</li>
            <li><strong>Local extension data:</strong> user settings, sync queue state, sync status, last error text, and previously synced submission metadata.</li>
            <li><strong>Operational page data:</strong> the LeetCode page route and limited page content needed to detect accepted submissions and extract the final answer.</li>
          </ul>
        </article>

        <article class="legal-card">
          <h2>2. How CodeTrail uses data</h2>
          <p>CodeTrail uses the data above only for the product purpose you chose:</p>
          <ul>
            <li>Detect accepted LeetCode submissions.</li>
            <li>Authenticate with GitHub through OAuth.</li>
            <li>Write solution files and README updates to the GitHub repository you selected.</li>
            <li>Show sync status, errors, badges, and notifications in the extension UI.</li>
            <li>Store settings, queue state, and synced history locally so the extension can continue working across sessions.</li>
          </ul>
        </article>

        <article class="legal-card">
          <h2>3. Where data is stored</h2>
          <p>Data is stored in the following places:</p>
          <ul>
            <li><strong>Chrome local storage:</strong> extension settings, auth state, queue data, sync status, and synced submission metadata.</li>
            <li><strong>GitHub:</strong> accepted submissions and README entries are written to the repository you selected.</li>
            <li><strong>LeetCode:</strong> the extension reads publicly available or authenticated page and GraphQL data from LeetCode to detect accepted submissions.</li>
            <li><strong>Railway OAuth backend:</strong> receives the GitHub OAuth authorization code and redirect URI so it can exchange the code for an access token. It is not used to store your LeetCode solutions.</li>
          </ul>
        </article>

        <article class="legal-card">
          <h2>4. What we do not collect</h2>
          <p>CodeTrail does not intentionally collect or use:</p>
          <ul>
            <li>Google or GitHub passwords.</li>
            <li>Payment or financial data.</li>
            <li>Contacts, calendar data, microphone, camera, or physical location data.</li>
            <li>General browsing history or unrelated websites.</li>
            <li>Analytics, ad targeting identifiers, or advertising profiles.</li>
          </ul>
        </article>

        <article class="legal-card">
          <h2>5. Sharing and third parties</h2>
          <p>CodeTrail only shares information with services required to provide the extension:</p>
          <ul>
            <li><strong>GitHub:</strong> for OAuth authentication and repository writes that you explicitly initiate or enable.</li>
            <li><strong>LeetCode:</strong> for reading submission details and problem metadata required to detect an accepted solution.</li>
            <li><strong>Railway OAuth backend:</strong> for exchanging the GitHub OAuth authorization code for an access token.</li>
          </ul>
          <p>CodeTrail does not sell user data, does not share user data with advertising networks or data brokers, and does not use user data for targeted advertising.</p>
        </article>

        <article class="legal-card">
          <h2>6. Security</h2>
          <p>CodeTrail uses HTTPS for external network requests where supported by the destination service. GitHub access tokens are stored locally in Chrome storage for the extension session and are not intentionally disclosed publicly. The backend keeps the GitHub client secret server-side and does not bundle it into the extension.</p>
        </article>

        <article class="legal-card">
          <h2>7. Retention and deletion</h2>
          <p>Your local extension data stays on your device until you remove it. You can clear stored settings, auth state, queues, and synced history from the extension UI. If you want GitHub repository content removed, you must delete it from GitHub directly or ask us for help.</p>
        </article>

        <article class="legal-card">
          <h2>8. Permissions</h2>
          <p>CodeTrail requests permissions only for the features it provides:</p>
          <ul>
            <li><strong>storage:</strong> save settings, queue state, and sync history locally.</li>
            <li><strong>identity:</strong> complete the GitHub OAuth flow through Chrome.</li>
            <li><strong>notifications:</strong> show sync success or failure updates.</li>
            <li><strong>LeetCode host access:</strong> detect accepted submissions and read the final submission details.</li>
            <li><strong>GitHub API access:</strong> fetch account and repository data and write synced files.</li>
          </ul>
        </article>

        <article class="legal-card">
          <h2>9. Children and eligibility</h2>
          <p>CodeTrail is intended for general use by people who can install browser extensions and connect a GitHub account. It is not directed at children.</p>
        </article>

        <article class="legal-card">
          <h2>10. Changes to this policy</h2>
          <p>If CodeTrail changes how it handles data, this page will be updated so it continues to match the extension’s actual behavior. Continued use after an update means the revised policy applies.</p>
        </article>

        <article class="legal-card">
          <h2>11. Contact</h2>
          <p>Questions about this policy or CodeTrail data handling can be sent to <a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a>.</p>
        </article>
      </section>
    `
  });
}

function buildPageHtml({
  title,
  description,
  active,
  body
}: {
  title: string;
  description: string;
  active: "home" | "support" | "privacy";
  body: string;
}): string {
  const year = new Date().getFullYear();
  const homeActive = active === "home" ? "active" : "";
  const supportActive = active === "support" ? "active" : "";

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="color-scheme" content="dark light" />
    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeHtml(description)}" />
    <style>
      :root {
        color-scheme: dark;
        --bg: #050816;
        --panel: rgba(10, 18, 34, 0.84);
        --panel-strong: rgba(14, 24, 42, 0.92);
        --line: rgba(167, 179, 214, 0.14);
        --text: #f4f7ff;
        --muted: #aeb9d5;
        --accent: #4be37f;
        --accent-2: #57c8ff;
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
        font: 16px/1.55 Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        text-rendering: optimizeLegibility;
      }
      a { color: inherit; text-decoration: none; }
      a:hover { color: #ffffff; }
      a:focus-visible {
        outline: 3px solid rgba(75, 227, 127, 0.55);
        outline-offset: 3px;
      }
      .page { position: relative; overflow: hidden; }
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
      .brand-copy strong { font-size: 15px; letter-spacing: 0.01em; }
      .brand-copy span { color: var(--muted); font-size: 13px; }
      .nav {
        display: flex;
        align-items: center;
        gap: 18px;
        flex-wrap: wrap;
        justify-content: flex-end;
        color: var(--muted);
        font-size: 14px;
      }
      .nav a.active {
        color: #ffffff;
        text-decoration: underline;
        text-underline-offset: 6px;
      }
      .nav a:hover { color: #ffffff; }
      .hero {
        display: grid;
        grid-template-columns: 1.1fr 0.9fr;
        gap: 28px;
        align-items: center;
        padding: 76px 0 42px;
      }
      .support-hero { grid-template-columns: 1fr 0.9fr; }
      .eyebrow,
      .section-kicker {
        display: inline-flex;
        align-items: center;
        gap: 10px;
        margin: 0 0 18px;
        padding: 9px 14px;
        border: 1px solid var(--line);
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.03);
        color: var(--muted);
        font-size: 13px;
      }
      h1 {
        margin: 0;
        font-size: clamp(3rem, 5vw, 5.4rem);
        line-height: 0.96;
        letter-spacing: -0.05em;
        max-width: 10ch;
      }
      h2 {
        margin: 0;
        font-size: clamp(1.8rem, 3vw, 2.6rem);
        line-height: 1.05;
        letter-spacing: -0.03em;
      }
      h3 {
        margin: 0;
        font-size: 1.16rem;
        line-height: 1.2;
      }
      .lead,
      .section-copy,
      .support-note,
      .support-points span,
      .feature p,
      .step p {
        color: var(--muted);
      }
      .lead {
        margin: 20px 0 0;
        max-width: 58ch;
        font-size: 1.08rem;
      }
      .section-heading {
        display: flex;
        justify-content: space-between;
        gap: 20px;
        align-items: end;
        margin: 0 0 18px;
      }
      .section-copy {
        margin: 0;
        max-width: 50ch;
      }
      .cta-row,
      .support-actions {
        display: flex;
        gap: 12px;
        flex-wrap: wrap;
        margin-top: 28px;
      }
      .btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
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
      }
      .meta-pill {
        padding: 8px 12px;
        border-radius: 999px;
        border: 1px solid var(--line);
        background: rgba(255, 255, 255, 0.02);
        color: var(--muted);
        font-size: 13px;
      }
      .hero-visual {
        display: grid;
        place-items: center;
      }
      .hero-image {
        width: 100%;
        max-width: 620px;
        aspect-ratio: 440 / 280;
        object-fit: cover;
        border-radius: 22px;
        border: 1px solid rgba(167, 179, 214, 0.14);
        box-shadow: var(--shadow);
        background: rgba(255, 255, 255, 0.02);
      }
      .gallery,
      .features,
      .workflow {
        padding: 30px 0 8px;
      }
      .gallery-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 16px;
      }
      .shot {
        margin: 0;
        border-radius: var(--radius);
        border: 1px solid rgba(167, 179, 214, 0.14);
        background: rgba(255, 255, 255, 0.03);
        overflow: hidden;
        box-shadow: var(--shadow);
      }
      .shot img {
        display: block;
        width: 100%;
        aspect-ratio: 440 / 280;
        object-fit: cover;
      }
      .shot figcaption {
        display: grid;
        gap: 6px;
        padding: 16px 18px 18px;
      }
      .shot strong { font-size: 15px; }
      .shot span { color: var(--muted); font-size: 14px; }
      .features {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 16px;
      }
      .feature {
        padding: 20px;
        border-radius: var(--radius);
        border: 1px solid rgba(167, 179, 214, 0.14);
        background: rgba(255, 255, 255, 0.03);
      }
      .feature-mark {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 40px;
        height: 40px;
        border-radius: 12px;
        margin-bottom: 14px;
        background: rgba(75, 227, 127, 0.12);
        color: #d8ffe6;
        font-weight: 700;
      }
      .feature p { margin: 10px 0 0; }
      .steps {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 16px;
      }
      .step {
        display: grid;
        grid-template-columns: auto 1fr;
        gap: 14px;
        align-items: start;
        padding: 20px;
        border-radius: var(--radius);
        border: 1px solid rgba(167, 179, 214, 0.14);
        background: rgba(255, 255, 255, 0.03);
      }
      .step-number {
        width: 36px;
        height: 36px;
        border-radius: 999px;
        display: grid;
        place-items: center;
        background: rgba(87, 200, 255, 0.11);
        color: #d5f1ff;
        font-weight: 700;
      }
      .step p { margin: 10px 0 0; }
      .support-band {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 20px;
        margin: 36px 0 46px;
        padding: 22px 24px;
        border-radius: calc(var(--radius) + 4px);
        border: 1px solid rgba(167, 179, 214, 0.14);
        background: rgba(255, 255, 255, 0.03);
      }
      .support-band .section-copy {
        max-width: 58ch;
      }
      .support-card {
        padding: 24px;
        border-radius: calc(var(--radius) + 4px);
        border: 1px solid rgba(167, 179, 214, 0.14);
        background: rgba(255, 255, 255, 0.03);
        box-shadow: var(--shadow);
      }
      .legal-hero {
        display: grid;
        grid-template-columns: 1fr 0.9fr;
        gap: 28px;
        align-items: start;
        padding: 76px 0 28px;
      }
      .legal-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 16px;
        padding: 10px 0 40px;
      }
      .legal-card {
        padding: 22px;
        border-radius: var(--radius);
        border: 1px solid rgba(167, 179, 214, 0.14);
        background: rgba(255, 255, 255, 0.03);
        box-shadow: var(--shadow);
      }
      .legal-card h2 {
        margin-bottom: 10px;
        font-size: 1.35rem;
      }
      .legal-card p {
        margin: 0 0 10px;
      }
      .legal-card ul {
        margin: 0;
        padding-left: 18px;
        color: var(--muted);
      }
      .legal-card li + li { margin-top: 8px; }
      .support-card h2 {
        margin-top: 10px;
        font-size: clamp(1.7rem, 2.8vw, 2.2rem);
      }
      .support-note {
        margin: 12px 0 0;
      }
      .support-points {
        display: grid;
        gap: 16px;
        margin-top: 18px;
      }
      .support-points strong {
        display: block;
        margin-bottom: 4px;
        font-size: 14px;
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
      @media (max-width: 960px) {
        .hero,
        .legal-hero,
        .gallery-grid,
        .legal-grid,
        .features,
        .steps,
        .support-band {
          grid-template-columns: 1fr;
        }
        .section-heading {
          display: grid;
        }
        .legal-hero {
          padding-top: 42px;
        }
        .hero,
        .gallery,
        .features,
        .workflow {
          padding-top: 42px;
        }
        .support-band {
          display: grid;
          align-items: start;
        }
        .topbar-inner {
          flex-direction: column;
          align-items: flex-start;
        }
        h1 { max-width: none; }
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
              <span>Accepted LeetCode submissions, organized in GitHub</span>
            </span>
          </a>
          <nav class="nav" aria-label="Primary">
            <a class="${homeActive}" href="/">Home</a>
            <a class="${supportActive}" href="/support">Support</a>
            <a class="${active === "privacy" ? "active" : ""}" href="/privacy">Privacy</a>
            <a href="https://github.com/Ajkolaganti/CodeTrailChromeExtension" target="_blank" rel="noreferrer">GitHub</a>
          </nav>
        </div>
      </header>

      <main>
        ${body}

        <footer class="wrap footer">
          <span>© ${year} CodeTrail</span>
          <span><a href="/privacy">Privacy Policy</a> · <a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a></span>
        </footer>
      </main>
    </div>
  </body>
</html>`;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
