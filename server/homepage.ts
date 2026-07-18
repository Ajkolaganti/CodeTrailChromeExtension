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

function buildPageHtml({
  title,
  description,
  active,
  body
}: {
  title: string;
  description: string;
  active: "home" | "support";
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
        .gallery-grid,
        .features,
        .steps,
        .support-band {
          grid-template-columns: 1fr;
        }
        .section-heading {
          display: grid;
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
            <a href="https://github.com/Ajkolaganti/CodeTrailChromeExtension" target="_blank" rel="noreferrer">GitHub</a>
          </nav>
        </div>
      </header>

      <main>
        ${body}

        <footer class="wrap footer">
          <span>© ${year} CodeTrail</span>
          <span><a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a></span>
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
