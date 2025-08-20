# AI Studio - 智能对话平台

这是一个基于 Next.js 15、React 19、TypeScript 和 Tailwind CSS 构建的现代化 AI 聊天应用。该应用提供强大的 AI 对话功能，支持多模态交互、用户认证、对话历史管理等企业级功能。

![应用截图](public/chat.png)

## ✨ 功能特点

- 💬 **智能对话**: 基于先进的大语言模型（Gemini 2.5 Pro）进行自然语言对话
- 🧠 **思维链显示**: 支持显示 AI 的思考过程，提供更透明的推理体验
- 🔐 **用户认证**: 集成 Google OAuth 登录，安全可靠
- 📚 **对话历史**: 持久化存储用户对话记录，支持历史回顾
- 🌓 **主题切换**: 支持明暗主题无缝切换
- 📱 **响应式设计**: 完美适配移动端和桌面端
- ✨ **富文本渲染**: 
  - Markdown 格式支持
  - 代码语法高亮显示
  - 数学公式渲染（KaTeX）
- 📋 **交互功能**: 
  - 消息复制
  - 重新生成回答
  - 实时流式输出
- 🎨 **现代 UI**: 基于 Tailwind CSS 的精美界面设计

## 🛠 技术栈

- **前端框架**: Next.js 15 + React 19
- **开发语言**: TypeScript
- **样式方案**: Tailwind CSS 4.x
- **状态管理**: Zustand
- **数据库**: PostgreSQL + Prisma ORM
- **用户认证**: NextAuth.js v5 + Google OAuth
- **AI 服务**: OpenRouter API（支持多种模型）
- **包管理器**: pnpm
- **富文本渲染**: marked + highlight.js + KaTeX
- **部署平台**: 支持 Vercel、Railway 等

## 🚀 快速开始

### 📋 前提条件

- Node.js (推荐 v18+)
- pnpm
- PostgreSQL 数据库
- Google OAuth 应用（用于认证）
- OpenRouter API 密钥

### 📦 安装

```bash
# 克隆仓库
git clone https://github.com/yourusername/chat.git
cd chat

# 安装依赖
pnpm install
```

### ⚙️ 环境配置

创建 `.env.local` 文件，配置以下环境变量：

```bash
# 数据库配置
DATABASE_URL="postgresql://username:password@localhost:5432/chat_db"
DIRECT_URL="postgresql://username:password@localhost:5432/chat_db"

# AI API 配置
API_KEY="your_openrouter_api_key"

# 认证配置
NEXTAUTH_SECRET="your_nextauth_secret_key"
NEXTAUTH_URL="http://localhost:3000"

# Google OAuth 配置
GOOGLE_CLIENT_ID="your_google_client_id"
GOOGLE_CLIENT_SECRET="your_google_client_secret"
```

参考 `.env.example` 文件获取完整的环境变量配置说明。

### 🗄️ 数据库设置

```bash
# 生成 Prisma 客户端
npx prisma generate

# 运行数据库迁移
npx prisma db push

# (可选) 查看数据库
npx prisma studio
```

### 🔧 开发环境

```bash
# 启动开发服务器
pnpm dev
```

应用将在 http://localhost:3000 上运行。

### 🏗️ 生产构建

```bash
# 构建生产版本
pnpm build

# 启动生产服务器
pnpm start
```

## 📁 项目结构

```
chat/
├── app/                           # Next.js 15 App Router
│   ├── api/                       # API 路由
│   │   ├── auth/[...nextauth]/    # NextAuth.js 认证
│   │   ├── chat/                  # AI 对话 API
│   │   └── chat-history/          # 对话历史 API
│   ├── c/[id]/                    # 动态聊天页面
│   ├── components/                # React 组件
│   │   ├── Auth/                  # 认证相关组件
│   │   ├── Conversation/          # 对话组件
│   │   ├── Sidebar/               # 侧边栏组件
│   │   ├── Preview/               # 消息渲染组件
│   │   └── ...
│   ├── lib/                       # 工具库和服务
│   │   ├── store/                 # Zustand 状态管理
│   │   ├── hooks/                 # 自定义 Hooks
│   │   └── types/                 # TypeScript 类型定义
│   └── login/                     # 登录页面
├── prisma/                        # 数据库配置
│   ├── schema.prisma              # 数据库模式
│   └── migrations/                # 数据库迁移文件
├── public/                        # 静态资源
└── ...
```

## 🧩 核心组件

- **Main**: 主应用界面容器
- **Conversation**: 处理用户与 AI 之间的对话逻辑
- **MessageList**: 消息列表展示和管理
- **ChatInput**: 用户输入组件
- **Preview**: Markdown、代码和数学公式渲染
- **Sidebar**: 对话历史管理和导航
- **AuthProvider**: 用户认证状态管理
- **ThemeProvider**: 主题切换功能

## 🚀 部署

### Vercel 部署

1. Fork 本仓库到你的 GitHub 账号
2. 在 [Vercel](https://vercel.com) 中导入项目
3. 配置环境变量（参考上面的环境配置）
4. 部署完成

### Docker 部署

```bash
# 构建镜像
docker build -t chat-app .

# 运行容器
docker run -p 3000:3000 --env-file .env.local chat-app
```

## 📖 API 文档

### 对话接口
- `POST /api/chat` - 发送消息到 AI
- `GET /api/chat-history` - 获取用户对话历史
- `POST /api/chat-history` - 保存对话记录
- `DELETE /api/chat-history/[id]` - 删除指定对话

### 认证接口
- `GET /api/auth/signin` - 登录页面
- `POST /api/auth/callback/google` - Google OAuth 回调

## 🤝 贡献指南

我们欢迎所有形式的贡献！请遵循以下步骤：

1. Fork 本仓库
2. 创建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 开启 Pull Request

## 📝 许可证

本项目基于 MIT 许可证开源 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🗓️ 开发计划

### 第一阶段 - 核心功能增强 (2-3周)

#### 🎯 优先级：高
- [ ] **多模态支持**
  - 图片上传和识别功能
  - 文档上传和解析 (PDF, Word, TXT)
  - 音频输入支持
- [ ] **对话管理优化**
  - 对话标题自动生成
  - 对话搜索功能
  - 对话导出功能 (Markdown, PDF)
- [ ] **用户体验提升**
  - 消息编辑功能
  - 消息删除功能
  - 快捷键支持

#### 🔧 优先级：中
- [ ] **性能优化**
  - 虚拟滚动优化长对话
  - 图片懒加载
  - 代码块性能优化
- [ ] **界面改进**
  - 消息气泡样式优化
  - 加载动画改进
  - 移动端交互优化

### 第二阶段 - 高级功能 (3-4周)

#### 🚀 新功能开发
- [ ] **AI 助手定制**
  - 自定义 AI 角色和提示词
  - 多个 AI 模型切换
  - 温度和其他参数调节
- [ ] **协作功能**
  - 对话分享功能
  - 团队工作空间
  - 权限管理系统
- [ ] **插件系统**
  - 第三方服务集成 (GitHub, Notion)
  - 自定义工具调用
  - API 扩展接口

#### 🔐 安全和稳定性
- [ ] **用户管理**
  - 用户配置文件
  - 使用统计和限额
  - 数据备份和恢复
- [ ] **安全增强**
  - API 速率限制
  - 内容过滤和审核
  - 数据加密存储

### 第三阶段 - 企业级功能 (4-5周)

#### 💼 企业特性
- [ ] **管理后台**
  - 用户管理界面
  - 系统监控面板
  - 使用统计分析
- [ ] **部署和运维**
  - Docker 容器化完善
  - CI/CD 流水线
  - 监控和日志系统
- [ ] **国际化**
  - 多语言支持
  - 本地化界面
  - 时区处理

#### 🎨 用户界面进化
- [ ] **主题系统**
  - 自定义主题创建
  - 主题商店
  - 动态主题切换
- [ ] **移动应用**
  - PWA 完善
  - 原生移动应用开发
  - 推送通知支持

### 💡 未来规划

- **AI 工作流**: 支持复杂的多步骤 AI 任务自动化
- **知识库集成**: 支持向量数据库和 RAG 功能
- **API 开放平台**: 为开发者提供完整的 API 生态
- **社区功能**: 用户交流、模板分享、插件市场

---

> 📅 **更新周期**: 每两周进行一次版本发布  
> 🐛 **Bug 修复**: 持续进行，重要问题24小时内响应  
> 💬 **反馈渠道**: 欢迎在 [Issues](https://github.com/yourusername/chat/issues) 中提供建议

## 🙏 致谢

- [Next.js](https://nextjs.org/) - 强大的 React 框架
- [OpenRouter](https://openrouter.ai/) - AI 模型 API 服务
- [Prisma](https://prisma.io/) - 现代数据库工具包
- [Tailwind CSS](https://tailwindcss.com/) - 实用优先的 CSS 框架
