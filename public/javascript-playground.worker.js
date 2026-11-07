self.onmessage = async ({ data }) => {
  let output = '';
  const write = (...values) => {
    if (output.length >= 12000) return;
    output += (values.map(value => typeof value === 'string' ? value : JSON.stringify(value)).join(' ') + '\n').slice(0, 12000 - output.length);
  };
  self.postMessage({ type: 'ready' });
  try {
    const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
    await new AsyncFunction('console', data.code)({ log: write, info: write, warn: write, error: write, table: write });
    self.postMessage({ type: 'done', output });
  } catch (error) {
    self.postMessage({ type: 'error', output, error: String(error.message || error).slice(0, 4000) });
  }
};
