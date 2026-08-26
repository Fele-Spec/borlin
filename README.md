# SignBridge

一款跨平台手语翻译应用程序，旨在为聋哑人士和健听人士之间搭建沟通桥梁。通过虚拟人物形象展示手语动作，并利用摄像头实时识别手语，实现汉语和英语与手语之间的双向互译。

## 功能模块

1. **虚拟人物形象创建系统**
   - 自定义虚拟人物形象
   - 调整外观特征、服装和基本姿态

2. **语言到手语转换模块**
   - 支持中文和英语语音输入
   - 支持中文和英语文本输入
   - 将输入内容转换为手语动作序列
   - 控制虚拟人物演示手语

3. **手语到语言转换模块**
   - 调用电脑摄像头捕捉手语动作
   - 实时识别手语并转换为文本
   - 文本转语音朗读翻译结果

4. **用户交互界面**
   - 直观的输入区域、虚拟人物显示区域和视频互动窗口
   - 支持语言到手语和手语到语言两种模式切换
   - 响应式设计与暗色/亮色主题

## 技术栈

- **前端框架**: React 18 + TypeScript + Vite 6
- **UI 样式**: TailwindCSS 3
- **3D 渲染**: Three.js + @react-three/fiber + @react-three/drei
- **状态管理**: Zustand
- **语音识别**: Web Speech API
- **文本转语音**: Web Speech API
- **手势识别**: MediaPipe Hands

## 在线预览

项目部署于 GitHub Pages：
https://fele-spec.github.io/borlin/

## 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 类型检查
npm run check
```

## 项目结构

```
src/
├── components/          # React 组件
├── data/                # 手语词典数据
├── hooks/               # 自定义 React Hooks
├── lib/                 # 工具函数
├── pages/               # 页面组件
├── store/               # Zustand 状态管理
├── types/               # TypeScript 类型定义
├── utils/               # 业务逻辑工具
├── App.tsx              # 应用入口
├── main.tsx             # 渲染入口
└── index.css            # 全局样式
```

## 部署说明

本项目使用 GitHub Actions 自动部署到 GitHub Pages。推送代码到 `main` 分支后，工作流会自动构建并部署。

## 分支保护规则

建议为 `main` 分支配置以下保护规则：
- 要求 Pull Request 审查通过后才能合并
- 要求状态检查通过（如 TypeScript 检查）
- 禁止强制推送
- 禁止直接删除 `main` 分支
