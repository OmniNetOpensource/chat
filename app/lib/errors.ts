type ChatErrorKind = 'network' | 'database' | 'parsing';

export class ChatStoreError extends Error {
  constructor(readonly kind: ChatErrorKind, message: string, readonly cause?: unknown) {
    super(message);
    this.name = `${kind[0].toUpperCase()}${kind.slice(1)}Error`;
  }
}

export class NetworkError extends ChatStoreError {
  constructor(message: string = 'Network request failed', cause?: unknown) {
    super('network', message, cause);
  }
}

export class DatabaseError extends ChatStoreError {
  constructor(message: string = 'Failed to access local data store', cause?: unknown) {
    super('database', message, cause);
  }
}

export class ParsingError extends ChatStoreError {
  constructor(message: string = 'Unable to parse server response', cause?: unknown) {
    super('parsing', message, cause);
  }
}

export const isRetryable = (error: unknown): boolean => {
  if (error instanceof ChatStoreError) {
    return error.kind !== 'parsing';
  }
  if (error instanceof Error && error.name === 'AbortError') {
    return false;
  }
  return true;
};

interface RetryOptions {
  retries?: number;
  baseDelayMs?: number;
  maxDelayMs?: number;
}

export const withExponentialBackoff = async <T>(
  job: () => Promise<T>,
  { retries = 3, baseDelayMs = 250, maxDelayMs = 4000 }: RetryOptions = {},
): Promise<T> => {
  let attempt = 0;

  while (true) {
    try {
      return await job();
    } catch (error) {
      attempt += 1;

      if (attempt > retries || !isRetryable(error)) {
        throw error;
      }

      const jitter = Math.random() * baseDelayMs;
      const delay = Math.min(baseDelayMs * 2 ** (attempt - 1) + jitter, maxDelayMs);

      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
};

export const toUserErrorMessage = (error: unknown): string => {
  if (error instanceof ChatStoreError) {
    switch (error.kind) {
      case 'network':
        return '网络连接出现问题，请检查后再试。';
      case 'database':
        return '本地会话缓存暂时不可用，稍后重试。';
      case 'parsing':
        return '收到的响应格式不对，已通知服务端，请稍后再试。';
    }
  }

  if (error instanceof Error) {
    return error.message || '出现未知错误，请稍后再试。';
  }

  return '出现未知错误，请稍后再试。';
};

export type { ChatErrorKind, RetryOptions };
