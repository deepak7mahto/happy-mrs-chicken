/**
 * Zero-Dependency Chrome DevTools Protocol (CDP) Client for Node.js 24
 * Uses native Node 24 WebSocket and http/child_process modules.
 */

import http from 'node:http';
import { spawn } from 'node:child_process';
import fs from 'node:fs';

export class CDPClient {
  constructor(wsUrl) {
    this.wsUrl = wsUrl;
    this.ws = null;
    this.idCounter = 0;
    this.pendingCallbacks = new Map();
    this.eventListeners = new Map();
    this.consoleLogs = [];
    this.errors = [];
    this.unhandledExceptions = [];
    this.networkRequests = [];
  }

  async connect() {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new globalThis.WebSocket(this.wsUrl);
        
        this.ws.onopen = () => {
          resolve(this);
        };

        this.ws.onerror = (err) => {
          reject(err);
        };

        this.ws.onclose = (event) => {
          // Closed
        };

        this.ws.onmessage = (msg) => {
          try {
            const data = JSON.parse(msg.data);
            if (data.id !== undefined && this.pendingCallbacks.has(data.id)) {
              const { resolve, reject } = this.pendingCallbacks.get(data.id);
              this.pendingCallbacks.delete(data.id);
              if (data.error) {
                reject(new Error(`CDP Error (${data.error.code}): ${data.error.message}`));
              } else {
                resolve(data.result);
              }
            } else if (data.method) {
              // Handle CDP domain events
              this.handleEvent(data.method, data.params);
            }
          } catch (e) {
            // Ignore parse errors
          }
        };
      } catch (err) {
        reject(err);
      }
    });
  }

  handleEvent(method, params) {
    if (method === 'Runtime.consoleAPICalled') {
      const type = params.type;
      const text = params.args.map(a => a.value || a.description || '').join(' ');
      this.consoleLogs.push({ type, text, timestamp: params.timestamp });
      if (type === 'error') {
        this.errors.push({ type: 'console.error', text });
      }
    } else if (method === 'Runtime.exceptionThrown') {
      const desc = params.exceptionDetails?.exception?.description || params.exceptionDetails?.text || 'Unknown Exception';
      this.unhandledExceptions.push(desc);
      this.errors.push({ type: 'exception', text: desc });
    } else if (method === 'Network.requestWillBeSent') {
      this.networkRequests.push({ url: params.request.url, method: params.request.method });
    }

    const listeners = this.eventListeners.get(method) || [];
    for (const listener of listeners) {
      listener(params);
    }
  }

  on(method, callback) {
    if (!this.eventListeners.has(method)) {
      this.eventListeners.set(method, []);
    }
    this.eventListeners.get(method).push(callback);
  }

  async send(method, params = {}) {
    const id = ++this.idCounter;
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        if (this.pendingCallbacks.has(id)) {
          this.pendingCallbacks.delete(id);
          reject(new Error(`CDP command '${method}' timed out after 10000ms`));
        }
      }, 10000);

      this.pendingCallbacks.set(id, {
        resolve: (res) => {
          clearTimeout(timeout);
          resolve(res);
        },
        reject: (err) => {
          clearTimeout(timeout);
          reject(err);
        }
      });

      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  async evaluate(expression, awaitPromise = false, returnByValue = true) {
    const res = await this.send('Runtime.evaluate', {
      expression,
      awaitPromise,
      returnByValue
    });
    if (res.exceptionDetails) {
      const desc = res.exceptionDetails.exception?.description || res.exceptionDetails.text;
      throw new Error(`Evaluation Exception: ${desc}`);
    }
    return res.result?.value;
  }

  async evaluateAsync(asyncFunctionCode) {
    const expr = `(async () => { return (${asyncFunctionCode})(); })()`;
    return this.evaluate(expr, true);
  }

  async navigate(url) {
    await this.send('Page.navigate', { url });
    await this.waitForLoad();
  }

  async waitForLoad(timeoutMs = 5000) {
    return new Promise((resolve) => {
      const timeout = setTimeout(resolve, timeoutMs);
      const onLoad = () => {
        clearTimeout(timeout);
        resolve();
      };
      this.on('Page.loadEventFired', onLoad);
    });
  }

  async waitForExpression(expression, timeoutMs = 5000, intervalMs = 50) {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      try {
        const val = await this.evaluate(expression);
        if (val) return val;
      } catch (e) {
        // Ignore during poll
      }
      await new Promise(r => setTimeout(r, intervalMs));
    }
    throw new Error(`Timeout waiting for expression: ${expression}`);
  }

  async click(x, y) {
    await this.send('Input.dispatchMouseEvent', {
      type: 'mousePressed',
      x: Math.round(x),
      y: Math.round(y),
      button: 'left',
      clickCount: 1
    });
    await new Promise(r => setTimeout(r, 20));
    await this.send('Input.dispatchMouseEvent', {
      type: 'mouseReleased',
      x: Math.round(x),
      y: Math.round(y),
      button: 'left',
      clickCount: 1
    });
  }

  async mouseMove(x, y) {
    await this.send('Input.dispatchMouseEvent', {
      type: 'mouseMoved',
      x: Math.round(x),
      y: Math.round(y)
    });
  }

  async keyPress(key, code = null) {
    const keyCodeMap = {
      ' ': { key: ' ', code: 'Space', windowsVirtualKeyCode: 32 },
      'Space': { key: ' ', code: 'Space', windowsVirtualKeyCode: 32 },
      'ArrowLeft': { key: 'ArrowLeft', code: 'ArrowLeft', windowsVirtualKeyCode: 37 },
      'ArrowUp': { key: 'ArrowUp', code: 'ArrowUp', windowsVirtualKeyCode: 38 },
      'ArrowRight': { key: 'ArrowRight', code: 'ArrowRight', windowsVirtualKeyCode: 39 },
      'ArrowDown': { key: 'ArrowDown', code: 'ArrowDown', windowsVirtualKeyCode: 40 },
      'Escape': { key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 },
      'm': { key: 'm', code: 'KeyM', windowsVirtualKeyCode: 77 },
      'M': { key: 'M', code: 'KeyM', windowsVirtualKeyCode: 77 },
      'w': { key: 'w', code: 'KeyW', windowsVirtualKeyCode: 87 },
      'W': { key: 'W', code: 'KeyW', windowsVirtualKeyCode: 87 },
      'a': { key: 'a', code: 'KeyA', windowsVirtualKeyCode: 65 },
      'A': { key: 'A', code: 'KeyA', windowsVirtualKeyCode: 65 },
      'd': { key: 'd', code: 'KeyD', windowsVirtualKeyCode: 68 },
      'D': { key: 'D', code: 'KeyD', windowsVirtualKeyCode: 68 }
    };

    const info = keyCodeMap[key] || { key, code: code || key, windowsVirtualKeyCode: key.charCodeAt(0) };

    await this.send('Input.dispatchKeyEvent', {
      type: 'rawKeyDown',
      key: info.key,
      code: info.code,
      windowsVirtualKeyCode: info.windowsVirtualKeyCode
    });

    if (info.key.length === 1 && info.key !== ' ') {
      await this.send('Input.dispatchKeyEvent', {
        type: 'char',
        text: info.key,
        unmodifiedText: info.key
      });
    }

    await new Promise(r => setTimeout(r, 20));

    await this.send('Input.dispatchKeyEvent', {
      type: 'keyUp',
      key: info.key,
      code: info.code,
      windowsVirtualKeyCode: info.windowsVirtualKeyCode
    });
  }

  async tap(x, y) {
    await this.send('Input.dispatchTouchEvent', {
      type: 'touchStart',
      touchPoints: [{ x: Math.round(x), y: Math.round(y) }]
    });
    await new Promise(r => setTimeout(r, 20));
    await this.send('Input.dispatchTouchEvent', {
      type: 'touchEnd',
      touchPoints: []
    });
  }

  async multiTouch(points = []) {
    await this.send('Input.dispatchTouchEvent', {
      type: 'touchStart',
      touchPoints: points.map(p => ({ x: Math.round(p.x), y: Math.round(p.y) }))
    });
    await new Promise(r => setTimeout(r, 20));
    await this.send('Input.dispatchTouchEvent', {
      type: 'touchEnd',
      touchPoints: []
    });
  }

  async setViewport({ width = 960, height = 540, deviceScaleFactor = 1.0, isMobile = false }) {
    await this.send('Emulation.setDeviceMetricsOverride', {
      width,
      height,
      deviceScaleFactor,
      mobile: isMobile
    });
  }

  async setNetworkConditions({ offline = false, latency = 0, downloadThroughput = -1, uploadThroughput = -1 }) {
    await this.send('Network.emulateNetworkConditions', {
      offline,
      latency,
      downloadThroughput,
      uploadThroughput
    });
  }

  async enableStandardDomains() {
    await this.send('Page.enable');
    await this.send('Runtime.enable');
    await this.send('DOM.enable');
    await this.send('Network.enable');
  }

  async close() {
    if (this.ws) {
      try {
        this.ws.close();
      } catch (e) {}
    }
  }
}

/**
 * Utility to fetch JSON from Chrome HTTP endpoint
 */
export async function fetchJson(url, options = {}) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const reqOptions = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port,
      path: parsedUrl.pathname + parsedUrl.search,
      method: options.method || 'GET'
    };
    const req = http.request(reqOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

/**
 * Checks if Chrome is reachable on debugging port
 */
export async function isChromeRunning(port = 9222) {
  try {
    const version = await fetchJson(`http://127.0.0.1:${port}/json/version`);
    return Boolean(version && version.webSocketDebuggerUrl);
  } catch (e) {
    return false;
  }
}

/**
 * Launches Chrome in background if not already running, and returns CDP client connected to target page
 */
export async function launchOrConnectChrome(options = {}) {
  const {
    port = 9222,
    headless = true,
    chromePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    userDataDir = '/tmp/chrome_test_profile_' + Date.now()
  } = options;

  let running = await isChromeRunning(port);
  let chromeProcess = null;

  if (!running) {
    const args = [
      headless ? '--headless=new' : '--headless=false',
      `--remote-debugging-port=${port}`,
      `--user-data-dir=${userDataDir}`,
      '--disable-gpu',
      '--no-first-run',
      '--no-default-browser-check',
      '--mute-audio=false', // Ensure Web Audio can run
      '--autoplay-policy=no-user-gesture-required',
      'about:blank'
    ];

    chromeProcess = spawn(chromePath, args, {
      detached: true,
      stdio: 'ignore'
    });
    chromeProcess.unref();

    // Poll until Chrome is ready
    let attempts = 0;
    while (attempts < 50) {
      await new Promise(r => setTimeout(r, 100));
      running = await isChromeRunning(port);
      if (running) break;
      attempts++;
    }

    if (!running) {
      throw new Error(`Failed to launch Google Chrome on port ${port} after 5 seconds`);
    }
  }

  // Create a new target tab
  let newTarget;
  try {
    newTarget = await fetchJson(`http://127.0.0.1:${port}/json/new?about:blank`, { method: 'PUT' });
  } catch (e) {
    const list = await fetchJson(`http://127.0.0.1:${port}/json/list`);
    newTarget = list[0];
  }
  const wsUrl = newTarget.webSocketDebuggerUrl;

  const client = new CDPClient(wsUrl);
  await client.connect();
  await client.enableStandardDomains();

  return {
    client,
    targetId: newTarget.id,
    chromeProcess,
    async cleanup() {
      await client.close();
      try {
        await fetchJson(`http://127.0.0.1:${port}/json/close/${newTarget.id}`);
      } catch (e) {}
    }
  };
}
