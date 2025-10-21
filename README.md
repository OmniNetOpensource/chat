# AI Studio - Chat Platform

AI Studio is a modern AI chat interface built with Next.js 15, React 19, and Tailwind CSS. It focuses on fast multimodal conversations, local-first history, and transparent reasoning powered by Google Gemini models.

![Application screenshot](public/chat.png)

## Features
- Streaming conversations with reasoning traces from Google Gemini models
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
- Google Generative AI (Gemini) for chat completions and model metadata

## Getting Started

### Prerequisites
- Node.js 18 or newer
- pnpm (the project uses the pnpm workspace layout)
- A Google Generative AI API key with access to the Gemini models you plan to use

### Installation
```bash
pnpm install
```

### Environment Variables
Create a `.env.local` file in the project root:

```bash
# Required for Google Generative AI access (see app/api/chat/route.ts)
GOOGLE_GENERATIVE_AI_API_KEY=your_google_api_key
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
  api/            -> Edge routes that stream Gemini responses and serve the model catalog
  components/     -> UI building blocks (chat surface, sidebar, preview, responsive)
  lib/            -> Zustand stores, hooks, IndexedDB services
  c/[id]/         -> Dynamic route for restored conversations
public/           -> Static assets and the default app icon
```

## Usage Notes
- Conversations are stored locally in the browser; clearing storage or switching devices removes history
- Image uploads are sent as base64 `image_url` parts—make sure the selected model supports vision input
- The model selector reads from the curated Gemini catalog exposed by `/api/models`; adjust the default in `useChatStore` to change the initial model

## Roadmap
- Wire the model selector to update the active model
- Extend the uploader and viewer to cover additional file types
- Add conversation rename and delete actions directly inside the sidebar

---

# AI Studio - 智能对话平台

AI Studio 是一个基于 Next.js 15、React 19 和 Tailwind CSS 构建的现代化 AI 对话界面，聚焦于极速多模态交流、本地优先的历史记录以及透明的推理展示。

![应用截图](public/chat.png)

## 功能亮点
- 基于 Google Gemini 模型的流式对话，实时展示推理链路
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
- Google Generative AI (Gemini) 用于获取模型信息与对话回复

## 快速开始

### 环境要求
- Node.js 18 或以上版本
- pnpm（项目使用 pnpm 工作区）
- Google Generative AI 账号及对应 API Key，确保所选模型支持所需模态

### 安装
```bash
pnpm install
```

### 环境变量配置
在项目根目录创建 `.env.local`：

```bash
# 用于访问 Google Generative AI（见 app/api/chat/route.ts）
GOOGLE_GENERATIVE_AI_API_KEY=你的_google_api_key
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
  api/            -> 提供 Gemini 流式回复及模型目录的 Edge 接口
  components/     -> 聊天界面、侧边栏、预览、响应式等 UI 组件
  lib/            -> Zustand 状态、Hook、IndexedDB 服务
  c/[id]/         -> 已保存会话的动态路由页面
public/           -> 静态资源与应用图标
```

## 使用提示
- 会话记录保存在浏览器本地，清理存储或更换设备会丢失历史
- 图片会作为 base64 `image_url` 字段发送，请确认模型具备视觉理解能力
- 模型列表来自 `/api/models` 暴露的 Gemini 目录，可在 `useChatStore` 中调整默认模型

## 开发计划
- 完善模型选择器，使其能够真正切换当前模型
- 扩展上传组件以支持更多文件类型
- 在侧边栏中提供会话重命名与删除操作
