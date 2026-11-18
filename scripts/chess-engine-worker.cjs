// Node harness for the exact browser WASM distribution; application still uses Web Worker.
const { parentPort } = require('node:worker_threads');
const { readFileSync } = require('node:fs');
const { resolve } = require('node:path');
const Module = require('node:module');
const filename = resolve('public/stockfish/stockfish-19-lite-single.js');
const mod = new Module(filename, module);
mod.filename = filename;
mod.paths = module.paths;
mod._compile(readFileSync(filename, 'utf8'), filename);
const engine = mod.exports();
engine.listener = line => parentPort.postMessage(line);
parentPort.on('message', command => engine.processCommand(command));
