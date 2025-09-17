import { PlaygroundSDK } from '@midscene/playground';
import {
  EnvConfig,
  Logo,
  UniversalPlayground,
  useEnvConfig,
} from '@midscene/visualizer';
import { useEffect, useMemo } from 'react';
import './index.less';

declare const __APP_VERSION__: string;

interface PlaygroundPanelProps {
  serverValid: boolean;
  configAlreadySet: boolean;
}

/**
 * Enhanced PlaygroundSDK that activates iPhone Mirroring app before execution
 */
class iOSPlaygroundSDK extends PlaygroundSDK {
  async executeAction(actionType: string, value: any, options: any): Promise<any> {
    try {
      // First, activate iPhone Mirroring app and re-detect window position
      console.log('🔍 Activating iPhone Mirroring app and detecting window position...');

      const response = await fetch('/activate-mirror', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        console.log('✅ iPhone Mirroring app activated and window position detected');
      } else {
        console.warn('⚠️ Failed to activate iPhone Mirroring app, continuing anyway...');
      }
    } catch (error) {
      console.warn('⚠️ Error activating iPhone Mirroring app:', error);
      // Continue with execution even if activation fails
    }

    // Proceed with the original action execution
    return super.executeAction(actionType, value, options);
  }
}

/**
 * Playground panel component for iOS Playground using Universal Playground
 * Replaces the left panel with form and results
 */
export default function PlaygroundPanel({ }: PlaygroundPanelProps) {
  // Get config from the global state
  const { config } = useEnvConfig();

  // Initialize enhanced PlaygroundSDK for remote execution
  const playgroundSDK = useMemo(() => {
    return new iOSPlaygroundSDK({
      type: 'remote-execution',
    });
  }, []);

  // Check server status on mount to initialize SDK ID
  useEffect(() => {
    const checkServer = async () => {
      try {
        const online = await playgroundSDK.checkStatus();
        console.log(
          '[DEBUG] iOS playground server status:',
          online,
          'ID:',
          playgroundSDK.id,
        );
      } catch (error) {
        console.error(
          'Failed to check iOS playground server status:',
          error,
        );
      }
    };

    checkServer();
  }, [playgroundSDK]);

  // Override SDK config when configuration changes
  useEffect(() => {
    if (playgroundSDK.overrideConfig && config) {
      playgroundSDK.overrideConfig(config).catch((error) => {
        console.error('Failed to override SDK config:', error);
      });
    }
  }, [playgroundSDK, config]);

  return (
    <div className="playground-panel">
      {/* Header with Logo and Config */}
      <div className="playground-panel-header">
        <div className="header-row">
          <Logo />
          <EnvConfig showTooltipWhenEmpty={false} showModelName={false} />
        </div>
      </div>

      {/* Main playground area */}
      <div className="playground-panel-content">
        <UniversalPlayground
          playgroundSDK={playgroundSDK}
          config={{
            showContextPreview: false,
            layout: 'vertical',
            showVersionInfo: true,
            enableScrollToBottom: true,
            serverMode: true,
            showEnvConfigReminder: true,
          }}
          branding={{
            title: 'iOS Playground',
            version: __APP_VERSION__,
          }}
          className="ios-universal-playground"
        />
      </div>
    </div>
  );
}