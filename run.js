/**
 * Runner script to launch both backend and frontend concurrently with a single command.
 * Standard library only — no external dependencies needed.
 */
const { spawn } = require('child_process');
const path = require('path');

const isWin = process.platform === 'win32';
const shellCmd = isWin ? 'cmd.exe' : 'sh';
const shellArgs = (cmd) => (isWin ? ['/c', cmd] : ['-c', cmd]);

console.log('====================================================');
console.log('📚 Starting Study Assistant Backend & Frontend...');
console.log('   - Backend:  http://localhost:3001');
console.log('   - Frontend: http://localhost:5173');
console.log('====================================================\n');

const backend = spawn(shellCmd, shellArgs('npm run dev'), {
  cwd: path.join(__dirname, 'backend'),
  stdio: 'inherit',
});

const frontend = spawn(shellCmd, shellArgs('npm run dev'), {
  cwd: path.join(__dirname, 'frontend'),
  stdio: 'inherit',
});

function shutdown() {
  console.log('\n🛑 Shutting down Study Assistant...');
  try {
    if (isWin) {
      if (backend.pid) spawn('taskkill', ['/pid', backend.pid, '/f', '/t']);
      if (frontend.pid) spawn('taskkill', ['/pid', frontend.pid, '/f', '/t']);
    } else {
      backend.kill('SIGTERM');
      frontend.kill('SIGTERM');
    }
  } catch {
    // ignore cleanup errors
  }
  process.exit();
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
