# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AI Studio is a Next.js 15 chat application that streams responses from Google Generative AI (Gemini). It features local-first conversation history, reasoning traces, and multimodal support (text + images).

**Tech Stack**: Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS 4, Zustand, IndexedDB, AI SDK

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
# Required for streaming Gemini responses (app/api/chat/route.ts)
GOOGLE_GENERATIVE_AI_API_KEY=your_google_api_key
```

## Architecture

### State Management (Zustand)

The app uses 4 Zustand stores in `app/lib/store/`:

- **`useChatStore`**: Core chat state (messages, streaming, model, system prompt)
  - Messages follow `{ role: 'user' | 'assistant' | 'system', content: Content[] }`
  - Content types: `text`, `thinking` (reasoning trace), `image`, `file`
  - Handles conversation persistence to IndexedDB automatically
  - Default model: `'google/gemini-2.5-flash'`

- **`useSidebarState`**: Sidebar open/closed state
- **`useResponsiveStore`**: Mobile/desktop responsive state
- **`useImageViewer`**: Image preview/fullscreen state

### Data Persistence

- **Service**: `app/lib/services/indexedDBService.ts`
- **Storage**: Browser IndexedDB (database: `ChatAppDB`, store: `conversations`)
- **Schema**: `{ id, title, messages, updatedAt, model, systemPrompt }`
- **Auto-save**: Conversations save before streaming starts and after it completes

### AI Integration

Both API routes run as Edge functions:

- **`app/api/chat/route.ts`**: Calls `streamText` with the Google Gemini provider
  - Converts UI messages to model messages via `convertToModelMessages`
  - Emits SSE chunks in the `{ choices: [{ delta }] }` shape expected by the client

- **`app/api/models/route.ts`**: Returns a curated list of Gemini model IDs

### Routing & Navigation

- **`/`**: Main page – starts a new conversation or resumes the active one
- **`/c/[id]`**: Loads a specific conversation by ID from IndexedDB
  - Uses `useParams()` to obtain the ID, then calls `loadConversation(id)`

### Message Flow

1. User sends a message via `ChatInput`
2. For a new conversation: generate UUID, set as `currentConversationId`, navigate to `/c/{id}`
3. Persist the draft conversation to IndexedDB
4. POST to `/api/chat` with `{ model, messages }` where messages include system prompt + UI content blocks
5. Stream the SSE response, parsing each `data:` line into JSON
6. Extract `delta.reasoning` (thinking) and `delta.content` (answer) from chunks
7. Append to the last assistant message's content array, updating thinking durations when the answer begins
8. After streaming completes, persist the final conversation back to IndexedDB

### Content Rendering

- **Component**: `app/components/Preview/Preview.tsx`
- **Text content**: Rendered with `react-markdown` + `remark-gfm` + `rehype-katex`
- **Thinking blocks**: Collapsible sections showing reasoning traces with elapsed time
- **Images**: Displayed via `ImageViewer` with base64 data URLs

### Image Upload

- **Hook**: `app/lib/hooks/useFileUpload.ts`
- **Process**: File → `FileReader.readAsDataURL()` → base64 → `{ type: 'image', base64 }` or `{ type: 'file', base64 }`
- **Storage**: Images/files stored inline in message content (IndexedDB keeps the base64 strings)

## Key Implementation Details

- Messages are arrays of structured content blocks, not plain strings
- Thinking blocks (`type: 'thinking'`) store `id`, `text`, and `time` in seconds
- Conversation titles derive from the first user message
- Streaming state is tracked via `useChatStore.status` (`'ready' | 'streaming'`)
- AbortController is stored to support canceling in-progress requests
- Auto-resize textarea logic limits the number of visible lines per device
- System prompts are saved per conversation and sent as the first message

## Component Structure

```
app/
├── api/
│   ├── chat/route.ts          # Streams Gemini responses
│   └── models/route.ts        # Returns Gemini model catalog
├── components/
│   ├── Conversation/
│   │   ├── ChatInput.tsx      # Message input with file upload
│   │   ├── MessageList.tsx    # Renders message history
│   │   └── Conversation.tsx   # Container combining input and list
│   ├── Header/                # Model selector, system prompt
│   ├── Sidebar/               # Conversation history from IndexedDB
│   ├── Preview/               # Markdown rendering with thinking blocks
│   └── Theme/                 # next-themes provider
├── lib/
│   ├── store/                 # Zustand stores
│   ├── services/              # IndexedDB operations
│   └── hooks/                 # Custom React hooks
└── c/[id]/page.tsx            # Dynamic conversation route
```

## Common Patterns

### Adding a new content type

1. Extend the unions in `app/lib/types/index.ts`
2. Update the serialization logic in `useChatStore.sendMessage()`
3. Add rendering support inside `app/components/Preview/Preview.tsx`

### Modifying message handling

- Core streaming logic lives in `useChatStore.sendMessage()` inside the SSE parsing loop
- Data persistence happens before streaming starts and after it finishes
- Abort in-flight requests via `useChatStore.stop()` which calls `AbortController.abort()`

### Working with IndexedDB

- Use helpers from `app/lib/services/indexedDBService.ts`
- Schema changes require a `DB_VERSION` bump and upgrade logic in `openDatabase()`

---

请用朴实、平静、耐心的语言回答我的问题，就像一个有经验的朋友在认真地帮我理解一个话题。语气要温和、鼓励，让人感到你愿意花时间把事情讲清楚。不要使用夸张的形容词和营销式的表达，而是具体说明实际情况即可。
