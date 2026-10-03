const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting MediFind Full-Stack Development Environment...');

const isWindows = process.platform === 'win32';
const npmCmd = isWindows ? 'npm.cmd' : 'npm';

function startProcess(name, dir) {
  const proc = spawn(npmCmd, ['run', 'dev'], {
    cwd: path.join(__dirname, dir),
    shell: true,
    env: { ...process.env, FORCE_COLOR: '1' }
  });

  proc.stdout?.on('data', (data) => {
    process.stdout.write(`[${name}] ${data}`);
  });

  proc.stderr?.on('data', (data) => {
    process.stderr.write(`[${name}] ${data}`);
  });

  proc.on('close', (code) => {
    if (code !== null && code !== 0) {
      console.log(`[${name}] exited with code ${code}`);
    }
  });

  return proc;
}

const server = startProcess('SERVER', 'server');
const client = startProcess('CLIENT', 'client');

function cleanup() {
  console.log('\n🛑 Shutting down MediFind servers...');
  try {
    if (isWindows) {
      // Kill child process trees cleanly on Windows
      if (server.pid) spawn('taskkill', ['/pid', server.pid.toString(), '/f', '/t']);
      if (client.pid) spawn('taskkill', ['/pid', client.pid.toString(), '/f', '/t']);
    } else {
      server.kill();
      client.kill();
    }
  } catch (e) {}
  process.exit();
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
