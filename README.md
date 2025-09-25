# AI Studio - Chat Platform

AI Studio is a modern AI chat interface built with Next.js 15, React 19, and Tailwind CSS. It focuses on fast multimodal conversations, local-first history, and transparent reasoning.

![Application screenshot](public/chat.png)

## Features
- Streaming conversations with reasoning traces from OpenRouter-compatible models
- Markdown rendering with code highlighting, KaTeX formulas, and inline copy buttons
- Image attachments with thumbnail preview and full-screen viewer
- Local conversation history stored in IndexedDB and accessible from the sidebar
- Message editing, regeneration, copying, and a mobile-friendly responsive layout
- Light/dark theme toggle via `next-themes`, persisted per device

## Tech Stack
- Next.js 15 App Router, React 19, and TypeScript
- Tailwind CSS 4 with theme-aware CSS variables
- Zustand stores for chat, sidebar, and responsive state
- IndexedDB persistence via the `idb` package
- Marked + highlight.js + KaTeX for rich content rendering
- OpenRouter API for chat completions and model metadata

## Getting Started

### Prerequisites
- Node.js 18 or newer
- pnpm (the project uses the pnpm workspace layout)
- An OpenRouter account and API key with access to the models you plan to use

### Installation
```bash
pnpm install
```

### Environment Variables
Create a `.env.local` file in the project root:

```bash
# Required for the chat completion proxy (see app/api/chat/route.ts)
API_KEY=your_openrouter_api_key

# Required for fetching the available model list (see app/api/models/route.ts)
OPENROUTER_API_KEY=your_openrouter_api_key

# Optional: forwarded as headers when requesting the model list
APP_URL=http://localhost:3000
APP_TITLE=AI Studio
```

### Development
```bash
pnpm dev
```
The app runs at http://localhost:3000.

### Production Build
```bash
pnpm build
pnpm start
```

## Project Layout
```
app/
  api/            -> Edge routes that proxy OpenRouter chat and model APIs
  components/     -> UI building blocks (chat surface, sidebar, preview, responsive)
  lib/            -> Zustand stores, hooks, IndexedDB services
  c/[id]/         -> Dynamic route for restored conversations
public/           -> Static assets and the default app icon
```

## Usage Notes
- Conversations are stored locally in the browser; clearing storage or switching devices removes history
- Image uploads are sent as base64 `image_url` parts—make sure the selected model supports vision input
- The model selector fetches the latest catalog from OpenRouter; adjust the default in `useChatStore` to change the initial model

## Roadmap
- Wire the model selector to update the active model
- Extend the uploader and viewer to cover additional file types
- Add conversation rename and delete actions directly inside the sidebar

---

# AI Studio - 智能对话平台

AI Studio 是一个基于 Next.js 15、React 19 和 Tailwind CSS 构建的现代化 AI 对话界面，聚焦于极速多模态交流、本地优先的历史记录以及透明的推理展示。

![应用截图](public/chat.png)

## 功能亮点
- 基于 OpenRouter 兼容模型的流式对话，实时展示推理链路
- 支持 Markdown 渲染、代码高亮、KaTeX 数学公式以及一键复制代码块
- 支持图片上传，并提供缩略图预览与全屏查看
- 通过 IndexedDB 在浏览器本地持久化会话历史，可在侧边栏快速切换
- 支持消息重新编辑、重新生成、复制等操作，并针对移动端优化布局与侧边栏交互
- 借助 `next-themes` 提供明暗主题切换，并在设备端保留个人偏好

## 技术栈
- Next.js 15 App Router、React 19、TypeScript
- Tailwind CSS 4 + 主题化 CSS 变量实现风格控制
- Zustand 管理聊天、侧边栏、响应式等状态
- 基于 `idb` 的 IndexedDB 服务在浏览器端存储数据
- Marked + highlight.js + KaTeX 提供富文本渲染能力
- OpenRouter API 用于获取模型信息与对话回复

## 快速开始

### 环境要求
- Node.js 18 或以上版本
- pnpm（项目使用 pnpm 工作区）
- OpenRouter 账号及对应 API Key，确保所选模型支持所需模态

### 安装
```bash
pnpm install
```

### 环境变量配置
在项目根目录创建 `.env.local`：

```bash
# 用于 chat 代理接口（见 app/api/chat/route.ts）
API_KEY=你的_openrouter_api_key

# 用于获取模型列表（见 app/api/models/route.ts）
OPENROUTER_API_KEY=你的_openrouter_api_key

# 可选：请求模型列表时作为 Header 传递
APP_URL=http://localhost:3000
APP_TITLE=AI Studio
```

### 开发模式
```bash
pnpm dev
```
默认访问地址：http://localhost:3000

### 生产部署
```bash
pnpm build
pnpm start
```

## 项目结构
```
app/
  api/            -> OpenRouter 聊天与模型列表的 Edge 代理
  components/     -> 聊天界面、侧边栏、预览、响应式等 UI 组件
  lib/            -> Zustand 状态、Hook、IndexedDB 服务
  c/[id]/         -> 已保存会话的动态路由页面
public/           -> 静态资源与应用图标
```

## 使用提示
- 会话记录保存在浏览器本地，清理存储或更换设备会丢失历史
- 图片会作为 base64 `image_url` 字段发送，请确认模型具备视觉理解能力
- 模型列表实时从 OpenRouter 获取，可在 `useChatStore` 中调整默认模型

## 开发计划
- 完善模型选择器，使其能够真正切换当前模型
- 扩展上传组件以支持更多文件类型
- 在侧边栏中提供会话重命名与删除操作
