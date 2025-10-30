import type { Content, MessageType, Message } from '../types';
import { openDB, type IDBPDatabase } from 'idb';

const DB_NAME = 'ChatAppDB';
const DB_VERSION = 2;

const CONVERSATION_STORE = 'conversations';

export interface ConversationRecord {
  id: string;
  title: string;
  messages: MessageType[];
  updatedAt: number;
  systemPrompt: string;
  model: string;
}

async function openDatabase(): Promise<IDBPDatabase> {
  return openDB(DB_NAME, DB_VERSION, {
    async upgrade(db, oldVersion, newVersion, tx) {
      if (oldVersion < 1) {
        if (!db.objectStoreNames.contains(CONVERSATION_STORE)) {
          db.createObjectStore(CONVERSATION_STORE, { keyPath: 'id' });
        }
      }
      if (oldVersion < 2) {
        console.log('Upgrading database from version 1 to 2');
        const store = tx.objectStore(CONVERSATION_STORE);
        const conversations = await store.getAll();

        for (const conv of conversations) {
          const newMessages = conv.messages.map((message: Message) => {
            const newContent = message.content.map((block: Content) => {
              switch (block.type) {
                case 'image_url':
                  return {
                    id: crypto.randomUUID(),
                    type: 'image',
                    base64: block.image_url?.url || '',
                  };

                case 'thinking':
                  return {
                    id: block.id || crypto.randomUUID(),
                    type: 'thinking',
                    text: block.text || '',
                    time: block.time || 0,
                    finished: true,
                  };

                case 'text':
                  return {
                    id: crypto.randomUUID(),
                    type: 'text',
                    text: block.text || '',
                  };

                default:
                  return block;
              }
            });

            return {
              role: message.role,
              content: newContent,
            };
          });

          await store.put({ ...conv, messages: newMessages });
        }
        console.log('Database upgrade complete: migrated Content[] to MessageBlock[]');
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
