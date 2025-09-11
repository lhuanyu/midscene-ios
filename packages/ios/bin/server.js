#!/usr/bin/env node

import { execSync, spawn } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { existsSync } from 'node:fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const serverPath = join(__dirname, '../idb/auto_server.py');

const port = process.argv[2] || '1412';

console.log(`Starting PyAutoGUI server on port ${port}...`);
console.log(`Server script path: ${serverPath}`);

// Verify server script exists
if (!existsSync(serverPath)) {
  console.error(`Error: Python server script not found at ${serverPath}`);
  process.exit(1);
}

// Find python3 executable
let pythonCmd = 'python3';
try {
  const pythonPath = execSync('which python3', { encoding: 'utf8' }).trim();
  pythonCmd = pythonPath;
  console.log(`Using Python: ${pythonCmd}`);
} catch (error) {
  console.warn('Could not find python3 path, using default command');
}

// kill process on port first; if nothing is listening, silently ignore
try {
  execSync(`lsof -ti:${port} | xargs kill -9`, { stdio: 'ignore' });
  console.log(`Killed existing process on port ${port}`);
} catch (error) {
  console.warn(`No existing process to kill on port ${port}`);
}

const server = spawn(pythonCmd, [serverPath, port], {
  stdio: ['inherit', 'inherit', 'inherit'],
  env: {
    ...process.env,
    PYTHONUNBUFFERED: '1',
    PYTHONDONTWRITEBYTECODE: '1',
    DEBUG: process.env.DEBUG || 'ios:*, midscene:*',
  },
  cwd: dirname(serverPath),
});

let serverStarted = false;

server.on('spawn', () => {
  console.log(`Python server process spawned with PID: ${server.pid}`);
  serverStarted = true;
});

server.on('error', (error) => {
  console.error('Failed to start PyAutoGUI server:', error);
  console.error('Error details:', {
    code: error.code,
    errno: error.errno,
    syscall: error.syscall,
    path: error.path,
    spawnargs: error.spawnargs
  });
  process.exit(1);
});

server.on('close', (code, signal) => {
  if (signal) {
    console.log(`PyAutoGUI server was killed with signal ${signal}`);
  } else {
    console.log(`PyAutoGUI server exited with code ${code}`);
  }

  if (!serverStarted) {
    console.error('Server failed to start properly');
    process.exit(1);
  }

  process.exit(code || 0);
});

server.on('disconnect', () => {
  console.warn('PyAutoGUI server disconnected');
});

// Add a timeout to detect if server starts successfully
setTimeout(() => {
  if (serverStarted) {
    console.log(`✅ PyAutoGUI server should be running on port ${port}`);
    console.log(`Health check: http://localhost:${port}/health`);
  }
}, 2000);

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down PyAutoGUI server...');
  server.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('\nShutting down PyAutoGUI server...');
  server.kill('SIGTERM');
});
