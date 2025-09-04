# Midscene iOS

iOS automation SDK and playground for Midscene.js

## Packages

- **midscene-ios** - Core iOS automation SDK
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
import { agentFromPyAutoGUI } from 'midscene-ios';
import 'dotenv/config';

const main = async () => {
    // Create agent
    const agent = await agentFromPyAutoGUI();

    // Use AI-powered automation
    await agent.aiAction('tap the home button');

    // Extract data
    const apps = await agent.aiQuery('string[], get all app names on screen');
    console.log('Apps:', apps);
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
