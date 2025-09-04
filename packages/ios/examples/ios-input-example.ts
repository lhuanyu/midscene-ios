import { agentFromPyAutoGUI } from '../src/agent';
import 'dotenv/config';

Promise.resolve(
  (async () => {
    const agent = await agentFromPyAutoGUI();

    // 👀 run YAML with agent
    const { result } = await agent.runYaml(`
tasks:
  - name: Open music app and search Coldplay
    flow:
      - sleep: 5000
      - aiAction: "打开音乐应用"
      - sleep: 2000
      - aiTap: "搜索图标"
      - sleep: 3000
      - aiInput: "Coldplay"
        locate: "底部Search input field"
      - sleep: 2000
      - aiKeyboardPress: "底部Search input field"
        keyName: 'Enter'
      - sleep: 3000
      - aiWaitFor: "Search results are displayed"
      - aiAction: "播放第一首歌曲"
      - sleep: 3000
      - aiAction: "返回Home"
`);

    console.log(result);
  })(),
);
