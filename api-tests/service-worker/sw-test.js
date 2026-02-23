// === Configure these ===
// Use absolute URL to test the exact file you care about.
const SW_URL = "https://xingri.github.io/api-tests/service-worker/test-worker.js";

// Scope must be same-origin and within the allowed scope rules.
// This matches the scope in your error.
const SW_SCOPE = "https://xingri.github.io/api-tests/service-worker/";

// === Helpers ===
const out = document.getElementById("out");
const swUrlEl = document.getElementById("swUrl");
const swScopeEl = document.getElementById("swScope");

swUrlEl.textContent = SW_URL;
swScopeEl.textContent = SW_SCOPE;

function log(obj) {
  const line = typeof obj === "string" ? obj : JSON.stringify(obj, null, 2);
  out.textContent += line + "\n";
  console.log(obj);
}

function headerMap(headers) {
  const o = {};
  for (const [k, v] of headers.entries()) o[k] = v;
  return o;
}

async function fetchProbe(url, options, label) {
  try {
    log(`\n=== FETCH PROBE: ${label} ===`);
    log({ url, options });

    const resp = await fetch(url, options);
    const hdrs = headerMap(resp.headers);
    const text = await resp.text();

    log({
      result: "ok",
      status: resp.status,
      ok: resp.ok,
      redirected: resp.redirected,
      finalUrl: resp.url,
      contentType: hdrs["content-type"] || null,
      cacheControl: hdrs["cache-control"] || null,
      via: hdrs["via"] || null,
      server: hdrs["server"] || null,
      // show only first 300 chars to avoid dumping huge content
      bodyPreview: text.slice(0, 300)
    });

    return resp.status;
  } catch (e) {
    log({ result: "error", label, error: String(e), stack: e?.stack });
    return null;
  }
}

async function runDiagnostics() {
  out.textContent = "";
  log("=== BASIC ENV CHECKS ===");

  // 1) Does browser even support SW?
  log({
    secureContext: window.isSecureContext,
    serviceWorkerSupported: "serviceWorker" in navigator,
    userAgent: navigator.userAgent
  });

  // 2) Confirm you are on the same origin you expect
  log({
    pageOrigin: location.origin,
    pageHref: location.href
  });

  // 3) If SW supported, show current controller + registrations
  if ("serviceWorker" in navigator) {
    log({
      controller: navigator.serviceWorker.controller ? "present" : "none"
    });

    const regs = await navigator.serviceWorker.getRegistrations();
    log({ registrationsFound: regs.length });
    for (const r of regs) {
      log({
        scope: r.scope,
        active: !!r.active,
        installing: !!r.installing,
        waiting: !!r.waiting,
        scriptURL: r.active?.scriptURL || r.installing?.scriptURL || r.waiting?.scriptURL || null
      });
    }
  }

  // 4) Probe fetching the SW script in different modes
  // Note: Service worker script fetch uses a "script" request internally.
  // We can't replicate it perfectly, but these probes reveal policy differences.
  await fetchProbe(
    SW_URL,
    { method: "GET", cache: "no-store", credentials: "same-origin" },
    "Normal fetch (credentials: same-origin)"
  );

  await fetchProbe(
    SW_URL,
    { method: "GET", cache: "no-store", credentials: "include" },
    "Fetch with credentials: include (if auth cookies required)"
  );

  await fetchProbe(
    SW_URL,
    { method: "GET", cache: "no-store", credentials: "omit" },
    "Fetch with credentials: omit (no cookies)"
  );

  // 5) If the SW URL redirects, SW registration can fail depending on redirect/auth
  // This probe tries to surface redirects (fetch follows by default).
  // Look for resp.redirected=true and finalUrl differs from requested.
  log("\n=== NOTE ===");
  log("If normal fetch returns 200 but registration fails with 403, check if server/CDN/WAF treats 'ServiceWorker' script fetch differently.");
}

async function registerSW() {
  log("\n=== REGISTER ===");

  if (!("serviceWorker" in navigator)) {
    log("❌ ServiceWorker not supported in this browser.");
    return;
  }
  if (!window.isSecureContext) {
    log("❌ Not a secure context. SW requires HTTPS (or localhost).");
    return;
  }

  try {
    // Important: scope must be on same origin and within allowed rules.
    const reg = await navigator.serviceWorker.register(SW_URL, { scope: SW_SCOPE });
    log("✅ Registered successfully.");
    log({ scope: reg.scope });

    // Wait for the SW to become ready (activated)
    const readyReg = await navigator.serviceWorker.ready;
    log("✅ navigator.serviceWorker.ready resolved.");
    log({
      readyScope: readyReg.scope,
      activeScriptURL: readyReg.active?.scriptURL || null
    });
  } catch (e) {
    log("❌ Registration failed.");
    log({ name: e?.name, message: e?.message, stack: e?.stack });

    // Extra hint: browsers often hide the real network details behind this error.
    log("\nTip: Check DevTools → Network for the gfn-service-worker.js request and compare its Request Headers to a normal navigation.");
  }
}

async function unregisterAll() {
  log("\n=== UNREGISTER ALL REGISTRATIONS (this origin) ===");
  if (!("serviceWorker" in navigator)) return;

  const regs = await navigator.serviceWorker.getRegistrations();
  log({ found: regs.length });

  for (const r of regs) {
    const ok = await r.unregister();
    log({ scope: r.scope, unregistered: ok });
  }
}

async function hardReset() {
  log("\n=== HARD RESET (unregister + clear caches) ===");
  await unregisterAll();

  if ("caches" in window) {
    const keys = await caches.keys();
    log({ cachesFound: keys });
    await Promise.all(keys.map(k => caches.delete(k)));
    log("✅ Caches cleared.");
  } else {
    log("caches API not available.");
  }

  log("✅ Hard reset done. Reload the page to test from a clean state.");
}

// Wire up UI
document.getElementById("btnDiag").addEventListener("click", runDiagnostics);
document.getElementById("btnReg").addEventListener("click", registerSW);
document.getElementById("btnUnreg").addEventListener("click", unregisterAll);
document.getElementById("btnHardReset").addEventListener("click", hardReset);

// Auto-run diagnostics once on load
runDiagnostics();
