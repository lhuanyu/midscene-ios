# Midscene iOS

iOS automation SDK and playground for Midscene.js

## Showcases

| Instruction  | Video |
| :---:  | :---: |
| Open Apple Music, search for music by Coldplay, and play it.   | <video src="https://github.com/user-attachments/assets/0d4bda00-d52f-4b2e-8ab6-d366fc5ac75e" height="300" />        |

## Packages

- **midscene-ios** - Core iOS automation SDK
- **midscene-ios-playground** - Interactive playground for iOS automation

## Quick Start

### 1. Install dependencies

```bash
pnpm install
```

### 2. Install Python dependencies

This project requires Python 3 and several Python packages for iOS device automation:

```bash
# Install required Python packages
pip3 install flask pyautogui pillow requests
```

Or run the automated setup script:

```bash
cd packages/ios
./setup.sh
```

### 3. Configure system permissions

#### macOS Accessibility Permissions

For automation to work, you need to grant accessibility permissions:

1. Open **System Preferences** → **Security & Privacy** → **Privacy**
2. Select **Accessibility** from the left sidebar
3. Add your **Terminal** application to the list
4. If using VS Code or other IDEs, add them as well

#### Screen Recording Permissions

For screenshot functionality, you also need screen recording permissions:

1. In the same **Privacy** panel, select **Screen Recording**
2. Add your **Terminal** application and any IDEs you're using
3. Restart the applications after granting permissions

### 4. Build packages

```bash
pnpm run build
```

### 5. Run iOS Playground

```bash
npx midscene-ios-playground
```

## Requirements

- **Node.js 18+**
- **Python 3** with pip
- **macOS** (required for iOS device mirroring)
- **iOS device** with screen mirroring support
- **System permissions**: Accessibility and Screen Recording permissions for your terminal/IDE
- **Midscene AI model configuration**

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

## Troubleshooting

### Permission Issues

If you encounter permission errors:

1. **Verify Accessibility Permissions**:
   - Check that your terminal/IDE is listed in System Preferences → Security & Privacy → Privacy → Accessibility
   - Try removing and re-adding the application
   - Restart the application after granting permissions

2. **Verify Screen Recording Permissions**:
   - Check that your terminal/IDE is listed in System Preferences → Security & Privacy → Privacy → Screen Recording
   - Screenshots and screen mirroring require these permissions

### Python Dependencies

If Python package installation fails:

```bash
# Update pip first
pip3 install --upgrade pip

# Install packages with user flag if needed
pip3 install --user flask pyautogui pillow requests

# On some systems, you might need to use python instead of python3
python -m pip install flask pyautogui pillow requests
```

### macOS Security Warnings

If you see security warnings about Python or terminal access:

1. Click "Open Anyway" in System Preferences → Security & Privacy → General
2. Or temporarily disable Gatekeeper: `sudo spctl --master-disable` (remember to re-enable it later)

### Port Already in Use

If the default port is occupied:

```typescript
// Use a different port
const agent = await agentFromPyAutoGUI({ serverPort: 1413 });
```

## License

MIT
