import { type Message } from '../store/useChatStore';
import { openDB, type IDBPDatabase } from 'idb';

const DB_NAME = 'ChatAppDB';
const DB_VERSION = 1;

const CONVERSATION_STORE = 'conversations';

export interface ConversationRecord {
  id: string;
  title: string;
  messages: Message[];
  updatedAt: number;
  systemPrompt:string;
  model:string;
}

async function openDatabase(): Promise<IDBPDatabase> {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(CONVERSATION_STORE)) {
        db.createObjectStore(CONVERSATION_STORE, { keyPath: 'id' });
      }
    },
  });
}

export async function saveConversation(conversation: ConversationRecord) {
  const db = await openDatabase();
  const tx = db.transaction(CONVERSATION_STORE, 'readwrite');
  await tx.store.put(conversation);
  await tx.done;
}

export async function getConversation(id: string | null | undefined) {
  if (!id) {
    return null;
  }
  const db = await openDatabase();
  return db.get(CONVERSATION_STORE, id);
}

export async function getAllConversations(): Promise<ConversationRecord[]> {
  const db = await openDatabase();
  const conversations = await db.getAll(CONVERSATION_STORE);
  return conversations.sort((a, b) => b.updatedAt - a.updatedAt);
}

export async function deleteConversation(id: string) {
  const db = await openDatabase();
  const tx = db.transaction(CONVERSATION_STORE, 'readwrite');

  await tx.store.delete(id);
  await tx.done;
}
