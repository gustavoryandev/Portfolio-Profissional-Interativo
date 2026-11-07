self.onmessage = async ({ data }) => {
  try {
    const response = await fetch('https://wandbox.org/api/compile.json', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ compiler: 'openjdk-jdk-21+35', code: data.code, save: false }),
      signal: AbortSignal.timeout(45000),
    });
    if (!response.ok) throw new Error(`Wandbox HTTP ${response.status}`);
    const result = await response.json();
    const output = [result.compiler_message, result.program_message].filter(Boolean).join('\n').slice(0, 12000);
    self.postMessage({ type: String(result.status) === '0' && !result.signal ? 'done' : 'error', output });
  } catch (error) {
    self.postMessage({ type: 'error', error: String(error.message || error).slice(0, 4000) });
  }
};
