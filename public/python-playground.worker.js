const RUNTIME_URL = 'https://cdn.jsdelivr.net/pyodide/v0.28.3/full/';

self.onmessage = async ({ data }) => {
  let output = '';
  const write = text => {
    if (output.length < 12000) output += `${text}\n`.slice(0, 12000 - output.length);
  };
  try {
    importScripts(`${RUNTIME_URL}pyodide.js`);
    const python = await self.loadPyodide({ indexURL: RUNTIME_URL, stdout: write, stderr: write, stdin: () => null });
    self.postMessage({ type: 'ready' });
    const result = await python.runPythonAsync(data.code);
    result?.destroy?.();
    self.postMessage({ type: 'done', output });
  } catch (error) {
    self.postMessage({ type: 'error', output, error: String(error.message || error).slice(0, 4000) });
  }
};
