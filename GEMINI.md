# GEMINI Project: AI Studio Chat

## Project Overview

This is a modern AI chat application built with Next.js 15, React 19, and Tailwind CSS. It's designed for fast, multimodal conversations with a focus on local-first history and transparent reasoning. The application uses OpenRouter-compatible models for chat completions and displays reasoning traces.

**Key Technologies:**

*   **Framework:** Next.js 15 (App Router)
*   **UI Library:** React 19
*   **Styling:** Tailwind CSS 4
*   **State Management:** Zustand
*   **AI SDK:** @ai-sdk/react
*   **Language:** TypeScript
*   **Package Manager:** pnpm

**Architecture:**

*   The application proxies requests to the OpenRouter API for chat completions and model metadata through its own API routes in `app/api`.
*   Conversation history is stored locally in the browser's IndexedDB using the `idb` package.
*   The UI is composed of several key components, including a `Sidebar` for conversation history and a `Main` view for the chat interface.
*   The application supports both light and dark themes.

## Building and Running

### Prerequisites

*   Node.js 18 or newer
*   pnpm
*   An OpenRouter account and API key

### Installation

```bash
pnpm install
```

### Environment Variables

Create a `.env.local` file in the project root with the following content:

```
API_KEY=your_openrouter_api_key
OPENROUTER_API_KEY=your_openrouter_api_key
APP_URL=http://localhost:3000
APP_TITLE=AI Studio
```

### Development

To run the development server:

```bash
pnpm dev
```

The application will be available at [http://localhost:3000](http://localhost:3000).

### Production

To build and run the application in production:

```bash
pnpm build
pnpm start
```

## Development Conventions

*   **Linting:** The project uses ESLint with the `next` and `prettier` configurations. Run `pnpm lint` to check for linting errors.
*   **Type Checking:** The project uses TypeScript. Run `pnpm type-check` to check for type errors.
*   **Styling:** The project uses Tailwind CSS for styling.
*   **State Management:** Zustand is used for global state management.
*   **API Routes:** API routes are located in the `app/api` directory and are used to proxy requests to the OpenRouter API.



# GEMINI 必须遵守的规则

- 先浏览完整个项目之后才允许开始回答问题
- 说中文
- 除了告诉我，还要教会我
- 讲解详细一点
