# AI 聊天应用

这是一个基于 Next.js、React、TypeScript 和 Tailwind CSS 构建的现代化 AI 聊天应用。该应用允许用户与 AI 进行自然语言对话，并具有代码高亮显示、数学公式渲染等高级功能。

![应用截图](public/chat.png)

## 功能特点

- 💬 实时 AI 对话
- 🌓 明暗主题切换
- 📱 响应式设计，支持移动端和桌面端
- ✨ 支持 Markdown 和代码高亮显示
- 🧮 支持通过 KaTeX 渲染数学公式
- 📋 消息复制功能
- 🔄 重新发送消息功能
- 📚 对话历史管理

## 技术栈

- **前端框架**: Next.js 15 + React 19
- **语言**: TypeScript
- **样式**: Tailwind CSS
- **状态管理**: Zustand
- **AI 集成**: OpenAI API
- **包管理器**: pnpm
- **渲染**: marked + highlight.js + KaTeX

## 快速开始

### 前提条件

- Node.js (推荐 v18+)
- pnpm

### 安装

```bash
# 克隆仓库
git clone https://github.com/yourusername/chat.git
cd chat

# 安装依赖
pnpm install
```

### 配置

创建一个 `.env.local` 文件，添加你的 OpenAI API 密钥：

```
OPENAI_API_KEY=your_api_key_here
```

### 开发

```bash
pnpm dev
```

应用将在 http://localhost:3000 上运行。

### 构建生产版本

```bash
pnpm build
pnpm start
```

## 项目结构

```
chat/
  ├── app/                  # Next.js 应用代码
  │   ├── api/              # API 路由
  │   ├── components/       # React 组件
  │   ├── lib/              # 工具库、hooks 和服务
  │   └── ...
  ├── public/               # 静态资源
  └── ...
```

## 主要组件

- **Conversation**: 处理用户与 AI 之间的对话
- **Preview**: 渲染 Markdown、代码和数学公式
- **ThemeProvider**: 提供明暗主题切换功能
- **Sidebar**: 管理对话历史

## 贡献

欢迎提交 Issue 和 Pull Request！

## 许可证

MIT
