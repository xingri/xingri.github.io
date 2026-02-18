// shared-worker.js
// SharedWorkers accept connections via onconnect and communicate through MessagePort. [4](https://developer.mozilla.org/en-US/docs/Web/API/SharedWorker)[3](https://developer.mozilla.org/en-US/docs/Web/API/SharedWorker/port)

const workerId = Math.random().toString(16).slice(2);
const ports = new Set();

function send(port, data) {
  port.postMessage(data);
}

function broadcast(data) {
  for (const p of ports) p.postMessage(data);
}

async function timedFetch(url, fetchOptions) {
  const t0 = performance.now();
  const res = await fetch(url, fetchOptions);
  // Force reading body so you see realistic cost even when cached.
  const text = await res.text();
  const t1 = performance.now();

  return {
    ok: res.ok,
    status: res.status,
    elapsedMs: +(t1 - t0).toFixed(2),
    // Useful cache hints:
    cacheControl: res.headers.get("cache-control"),
    etag: res.headers.get("etag"),
    date: res.headers.get("date"),
    contentLength: text.length
  };
}

onconnect = (e) => {
  const port = e.ports[0];
  ports.add(port);

  // If you attach handlers via addEventListener in some patterns you must call port.start().
  // We'll use onmessage here (no need), but calling start() is harmless. [3](https://developer.mozilla.org/en-US/docs/Web/API/SharedWorker/port)[4](https://developer.mozilla.org/en-US/docs/Web/API/SharedWorker)
  port.start?.();

  send(port, { type: "log", workerId, message: `Connected. workerId=${workerId}, clients=${ports.size}` });

  port.onmessage = async (evt) => {
    const msg = evt.data;

    if (msg?.type === "hello") {
      send(port, { type: "log", workerId, message: `Hello from tabId=${msg.tabId}` });
      return;
    }

    if (msg?.type === "fetch") {
      const { url, times = 1, fetchOptions = {} } = msg;
      broadcast({ type: "log", workerId, message: `Fetch request: url=${url} times=${times}` });

      const results = [];
      for (let i = 0; i < times; i++) {
        try {
          const r = await timedFetch(url, fetchOptions);
          results.push({ i, ...r });
          send(port, { type: "log", workerId, message: `#${i + 1} status=${r.status} ${r.elapsedMs}ms cache-control=${r.cacheControl}` });
        } catch (err) {
          results.push({ i, error: String(err?.message || err) });
          send(port, { type: "log", workerId, message: `#${i + 1} ERROR ${String(err?.message || err)}` });
        }
      }

      send(port, {
        type: "result",
        workerId,
        url,
        times,
        results
      });
    }
  };

  port.onmessageerror = () => {
    ports.delete(port);
  };
};
