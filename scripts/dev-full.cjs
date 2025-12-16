/* eslint-disable no-console */
const { spawn } = require('child_process');

const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';

const run = (args, name) => {
  const child = spawn(npmCmd, args, { stdio: 'inherit' });
  child.on('exit', (code) => {
    if (code && code !== 0) {
      console.error(`[${name}] exited with code ${code}`);
    }
  });
  return child;
};

console.log('[dev:full] starting Vite + local functions…');

const children = [
  run(['run', 'functions:watch'], 'functions:watch'),
  run(['run', 'functions:serve'], 'functions:serve'),
  run(['run', 'dev'], 'vite'),
];

const shutdown = () => {
  children.forEach((child) => {
    if (!child.killed) child.kill('SIGINT');
  });
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

