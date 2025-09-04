# Midscene iOS

iOS automation SDK and playground for Midscene.js

## Packages

- **@midscene-ios** - Core iOS automation SDK
- **midscene-ios-playground** - Interactive playground for iOS automation

## Quick Start

### Install dependencies

```bash
pnpm install
```

### Build packages

```bash
pnpm run build
```

### Run iOS Playground

```bash
npx midscene-ios-playground
```

## Development

### Build in watch mode

```bash
pnpm run dev
```

### Run tests

```bash
pnpm test
```

## Usage

### Basic iOS Automation

```typescript
import { IOSAgent, IOSDevice, getConnectedDevices } from '@midscene-ios';

const main = async () => {
  // Get connected devices
  const devices = await getConnectedDevices();
  const device = new IOSDevice(devices[0].udid);
  
  // Create agent
  const agent = new IOSAgent(device);
  
  // Connect to device
  await device.connect();
  
  // Use AI-powered automation
  await agent.aiAction('tap the home button');
  await agent.aiInput('Hello World', 'search field');
  
  // Extract data
  const apps = await agent.aiQuery('string[], get all app names on screen');
  console.log('Apps:', apps);
  
  // Disconnect
  await device.disconnect();
};

main();
```

### Using the Playground

The iOS Playground provides a web interface for interactive testing:

```bash
npx midscene-ios-playground
```

This will:

1. Start a local server
2. Open your browser to the playground interface
3. Allow you to control iOS devices through a web UI

## Requirements

- Node.js 18+
- iOS device with screen mirroring support
- Midscene AI model configuration

## License

MIT
