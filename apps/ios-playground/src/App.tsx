import './App.less';
import { overrideAIConfig } from '@midscene/shared/env';
import {
  globalThemeConfig,
  useEnvConfig,
  useServerValid,
} from '@midscene/visualizer';
import { ConfigProvider, Layout } from 'antd';
import { useEffect, useRef } from 'react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import IOSPlayer, { type IOSPlayerRefMethods } from './ios-player';
import PlaygroundPanel from './components/playground-panel';

const { Content } = Layout;

export default function App() {
  // Configuration state
  const { config } = useEnvConfig();
  const configAlreadySet = Object.keys(config || {}).length >= 1;
  const serverValid = useServerValid(true);

  // Override AI configuration when config changes
  useEffect(() => {
    overrideAIConfig(config);
  }, [config]);

  // iOS Player ref
  const iosPlayerRef = useRef<IOSPlayerRefMethods>(null);

  return (
    <ConfigProvider theme={globalThemeConfig()}>
      <Layout className="app-container playground-container vertical-mode">
        <Content className="app-content">
          <PanelGroup
            autoSaveId="ios-playground-layout"
            direction="horizontal"
          >
            {/* left panel: PlaygroundPanel with Universal Playground */}
            <Panel
              defaultSize={32}
              maxSize={60}
              minSize={20}
              className="app-panel left-panel"
            >
              <div className="panel-content left-panel-content">
                <PlaygroundPanel
                  serverValid={serverValid}
                  configAlreadySet={configAlreadySet}
                />
              </div>
            </Panel>

            <PanelResizeHandle className="panel-resize-handle" />

            {/* right panel: IOSPlayer */}
            <Panel className="app-panel right-panel">
              <div className="panel-content right-panel-content">
                <IOSPlayer
                  ref={iosPlayerRef}
                  serverUrl="http://localhost:1412"
                  autoConnect={true}
                />
              </div>
            </Panel>
          </PanelGroup>
        </Content>
      </Layout>
    </ConfigProvider>
  );
}
