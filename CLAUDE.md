# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AI Studio is a Next.js 15 chat application with OpenRouter API integration, featuring local-first conversation history, streaming responses with reasoning traces, and multimodal support (text + images).

**Tech Stack**: Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS 4, Zustand, IndexedDB

## Development Commands

```bash
# Install dependencies
pnpm install

# Development server (uses Turbopack)
pnpm dev

# Production build
pnpm build
pnpm start

# Code quality
pnpm lint
pnpm type-check
```

## Environment Setup

Create `.env.local`:

```bash
# Required for API proxying (app/api/chat/route.ts and app/api/models/route.ts)
OPENROUTER_API_KEY=your_openrouter_api_key

# Optional headers for model list requests
APP_URL=http://localhost:3000
APP_TITLE=AI Studio
```

## Architecture

### State Management (Zustand)

The app uses 4 Zustand stores in `app/lib/store/`:

- **`useChatStore`**: Core chat state (messages, streaming, model, system prompt)
  - Messages have structure: `{ role: 'user' | 'assistant' | 'system', content: Content[] }`
  - Content types: `text`, `thinking` (reasoning trace), `image_url`
  - Handles conversation persistence to IndexedDB automatically
  - Default model: `'x-ai/grok-4-fast:free'`

- **`useSidebarState`**: Sidebar open/closed state
- **`useResponsiveStore`**: Mobile/desktop responsive state
- **`useImageViewer`**: Image preview/fullscreen state

### Data Persistence

- **Service**: `app/lib/services/indexedDBService.ts`
- **Storage**: Browser IndexedDB (database: `ChatAppDB`, store: `conversations`)
- **Schema**: `{ id, title, messages, updatedAt, model, systemPrompt }`
- **Auto-save**: Conversations save before/after streaming in `useChatStore.sendMessage()`

### API Proxy Pattern

Both API routes are edge functions that proxy to OpenRouter:

- **`app/api/chat/route.ts`**: Proxies streaming chat completions
  - Forwards request body directly to OpenRouter
  - Returns SSE stream unchanged

- **`app/api/models/route.ts`**: Fetches available models catalog
  - Adds `HTTP-Referer` and `X-Title` headers from env vars

### Routing & Navigation

- **`/`**: Main page - starts new conversation or shows existing if `currentConversationId` is set
- **`/c/[id]`**: Loads specific conversation by ID from IndexedDB
  - Uses `useParams()` to get ID, calls `loadConversation(id)` in `useEffect`

### Message Flow

1. User sends message via `ChatInput` component
2. If new conversation: Generate UUID, set as `currentConversationId`, navigate to `/c/{id}`
3. Save conversation to IndexedDB with first message
4. POST to `/api/chat` with `{ model, messages, stream: true, reasoning: { effort: 'high' } }`
5. Stream response via SSE, parse `data:` lines with JSON chunks
6. Extract `delta.reasoning` (thinking) and `delta.content` (answer) from chunks
7. Append to last assistant message's content array
8. When thinking → answer transition: Record elapsed time in `thinking.time` field
9. On completion: Update IndexedDB with final messages

### Content Rendering

- **Component**: `app/components/Preview/Preview.tsx`
- **Text content**: Rendered with `react-markdown` + `remark-gfm` + `rehype-katex` for math
- **Thinking blocks**: Expandable with "Thought for X s" button, shows streaming animation during generation
- **Images**: Displayed via `ImageViewer` component with base64 data URLs

### Image Upload

- **Hook**: `app/lib/hooks/useFileUpload.ts`
- **Process**: File → `FileReader.readAsDataURL()` → base64 string → `{ type: 'image_url', image_url: { url: base64 } }`
- **Storage**: Images stored inline in message content (IndexedDB stores base64)

## Key Implementation Details

- **Message structure is NOT simple strings**: Each message has `content: Content[]` where each item is `{ type, text/image_url/... }`
- **Thinking blocks**: `type: 'thinking'` content shows AI reasoning before answer. Has `id`, `text`, `time` (seconds)
- **Conversation titles**: Generated from first 10 chars of first user message
- **Streaming state**: `useChatStore.status` is `'ready'` or `'streaming'`
- **AbortController**: Stored in chat store for stopping in-progress requests
- **Auto-resize textarea**: `useAutoResizeTextarea` hook limits to 5 lines (mobile) or 7 lines (desktop)
- **System prompt**: Stored per-conversation in IndexedDB, sent as first message in API calls

## Component Structure

```
app/
├── api/
│   ├── chat/route.ts          # Streaming chat proxy
│   └── models/route.ts        # Model list fetcher
├── components/
│   ├── Conversation/
│   │   ├── ChatInput.tsx      # Message input with file upload
│   │   ├── MessageList.tsx    # Renders message history
│   │   └── Conversation.tsx   # Container combining above
│   ├── Header/                # Model selector, system prompt
│   ├── Sidebar/               # Conversation history from IndexedDB
│   ├── Preview/               # Markdown rendering with thinking blocks
│   └── Theme/                 # next-themes provider
├── lib/
│   ├── store/                 # Zustand stores
│   ├── services/              # IndexedDB operations
│   └── hooks/                 # Custom React hooks
└── c/[id]/page.tsx           # Dynamic conversation route
```

## Common Patterns

### Adding a new Content type

1. Add type to `Content` union in `app/lib/store/useChatStore.ts`
2. Handle in streaming parser in `useChatStore.sendMessage()`
3. Add rendering logic in `app/components/Preview/Preview.tsx`

### Modifying message handling

- Core logic is in `useChatStore.sendMessage()` - look for the SSE parsing while loop
- Message persistence happens before streaming starts and after it completes
- The `controller` abort signal allows canceling in-progress requests

### Working with IndexedDB

- Use functions from `app/lib/services/indexedDBService.ts`
- Schema changes require incrementing `DB_VERSION` and adding migration in `openDatabase()` upgrade handler


# 请用朴实、平静、耐心的语言回答我的问题，就像一个有经验的朋友在认真地帮我理解一个话题。语气要温和、鼓励，让人感到你愿意花时间把事情讲清楚。不要使用夸张的形容词和营销式的表达，比如"非常棒"、"超级强大"这类词，而是具体说明实际情况就好。

# 回答时请关注底层原理和运作机制，不只是停留在表面现象。重点说明"为什么"和"怎么做到的"，而不只是"是什么"。涉及具体机制时，说明内部是如何运作的、各个环节如何衔接、过程中发生了什么变化。

# 在解释复杂概念时，请从最基础的部分讲起，一步步引导到深层内容。如果某个概念需要先理解一些背景知识或相关话题，可以稍微展开解释一下，确保理解的连贯性。把整个话题拆分成容易消化的小步骤，让人能跟上思路。

# 请主动预见可能产生歧义或困惑的地方，在讲到这些点时停下来做个说明。比如某个术语有多种含义，或者某个步骤容易被误解，就提前澄清。用具体例子和场景来说明抽象概念，指出新手常见的误区和容易忽略的细节。可以适当使用类比，但要确保类比准确，不要为了简化而丢失关键信息。
