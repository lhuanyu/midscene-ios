const path = require('node:path');
const { spawn } = require('node:child_process');
const { iOSDevice, iOSAgent } = require('midscene-ios');
const { PLAYGROUND_SERVER_PORT } = require('@midscene/shared/constants');
const { PlaygroundServer } = require('@midscene/playground');

// Enable all debug logs for iOS and related modules
// Users can set VERBOSE=true for even more detailed logs
const debugPatterns = ['ios:*', 'midscene:*', 'playground:*'];
const excludePatterns = ['-express:*']; // Exclude noisy express router logs

if (process.env.VERBOSE === 'true') {
  debugPatterns.push('*');
  console.log('🔍 Verbose logging enabled - all debug output will be shown');
}

// Combine include and exclude patterns
const allPatterns = [...debugPatterns, ...excludePatterns];
process.env.DEBUG = process.env.DEBUG || allPatterns.join(',');
// Import enableDebug and enable it
const { enableDebug } = require('@midscene/shared/logger');
enableDebug();

const staticDir = path.join(__dirname, '..', 'static');
const playgroundServer = new PlaygroundServer(iOSDevice, iOSAgent, staticDir);

// Auto server management
let autoServerProcess = null;
const AUTO_SERVER_PORT = 1412;

/**
 * Check if auto server is running on the specified port
 */
const checkAutoServerRunning = async (port = AUTO_SERVER_PORT) => {
  return new Promise((resolve) => {
    const net = require('node:net');
    const client = new net.Socket();

    client.setTimeout(1000);

    client.on('connect', () => {
      client.destroy();
      resolve(true);
    });

    client.on('timeout', () => {
      client.destroy();
      resolve(false);
    });

    client.on('error', () => {
      resolve(false);
    });

    client.connect(port, 'localhost');
  });
};

/**
 * Start the auto server if it's not running
 */
const startAutoServer = async () => {
  try {
    const isRunning = await checkAutoServerRunning();

    if (isRunning) {
      console.log(
        `✅ PyAutoGUI server is already running on port ${AUTO_SERVER_PORT}`,
      );
      return true;
    }

    console.log(`🚀 Starting PyAutoGUI server on port ${AUTO_SERVER_PORT}...`);

    // Find the auto server script path from midscene-ios package
    const autoServerPath = require.resolve('midscene-ios/bin/server.js');

    // Start the auto server process
    autoServerProcess = spawn('node', [autoServerPath, AUTO_SERVER_PORT], {
      stdio: 'pipe',
      env: {
        ...process.env,
        NODE_ENV: 'production',
        DEBUG: process.env.DEBUG, // Ensure debug environment is passed to child process
      },
    });

    // Handle auto server output
    autoServerProcess.stdout.on('data', (data) => {
      const output = data.toString().trim();
      if (!output) return;
      console.log(`[PyAutoGUI Server] ${output}`);
    });

    autoServerProcess.stderr.on('data', (data) => {
      const output = data.toString().trim();
      if (!output) return;
      // Surface all output for debugging
      console.log(`[PyAutoGUI Server Error] ${output}`);
    });

    autoServerProcess.on('error', (error) => {
      console.error('❌ Failed to start PyAutoGUI server:', error);
    });

    autoServerProcess.on('close', (code) => {
      if (code !== 0) {
        console.error(`❌ PyAutoGUI server exited with code ${code}`);
      } else {
        console.log('✅ PyAutoGUI server closed cleanly');
      }
      autoServerProcess = null;
    });

    // Wait a bit for the server to start
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Verify it's running
    const isNowRunning = await checkAutoServerRunning();
    if (isNowRunning) {
      console.log(
        `✅ PyAutoGUI server started successfully on port ${AUTO_SERVER_PORT}`,
      );
      return true;
    } else {
      console.error(
        `❌ Failed to start PyAutoGUI server on port ${AUTO_SERVER_PORT}`,
      );
      lastStartFailed = true;
      return false;
    }
  } catch (error) {
    console.error('❌ Error starting auto server:', error);
    lastStartFailed = true;
    return false;
  }
};

/**
 * Monitor server health and log status
 */
const monitorServerHealth = () => {
  const interval = setInterval(async () => {
    const isRunning = await checkAutoServerRunning();
    if (!isRunning && autoServerProcess) {
      console.warn(
        '⚠️  PyAutoGUI server appears to be down, attempting restart...',
      );
      await startAutoServer();
    }
  }, 30000); // Check every 30 seconds

  // Clean up interval on shutdown
  process.on('exit', () => clearInterval(interval));
  process.on('SIGTERM', () => clearInterval(interval));
  process.on('SIGINT', () => clearInterval(interval));
};

const main = async () => {
  try {
    console.log('🚀 Starting Midscene iOS Playground...');
    console.log(`📋 Debug mode enabled: ${process.env.DEBUG}`);

    // Start auto server first
    await startAutoServer();

    // Start server health monitoring
    monitorServerHealth();

    await playgroundServer.launch(PLAYGROUND_SERVER_PORT);
    console.log(
      `✅ Midscene iOS Playground server is running on http://localhost:${playgroundServer.port}`,
    );

    // Test iOS device debug logging to show it's working
    if (process.env.DEBUG?.includes('ios:')) {
      console.log(
        '🔍 Debug mode detected - will show iOS device logs when operations are performed',
      );
    }

    // Automatically open browser
    if (process.env.NODE_ENV !== 'test') {
      try {
        const { default: open } = await import('open');
        await open(`http://localhost:${playgroundServer.port}`);
        console.log('🌐 Browser opened automatically');
      } catch (error) {
        console.log(
          '⚠️  Could not open browser automatically. Please visit the URL manually.',
        );
      }
    }
  } catch (error) {
    console.error('❌ Failed to start iOS playground server:', error);
    process.exit(1);
  }
}; // Handle graceful shutdown
const cleanup = () => {
  console.log('🔄 Shutting down gracefully...');

  if (playgroundServer) {
    console.log('🛑 Closing playground server...');
    playgroundServer.close();
  }

  if (autoServerProcess) {
    console.log('🛑 Stopping PyAutoGUI server...');
    autoServerProcess.kill('SIGTERM');
    autoServerProcess = null;
  }

  console.log('✅ Cleanup completed');
  process.exit(0);
};

process.on('SIGTERM', cleanup);
process.on('SIGINT', cleanup);

main();
