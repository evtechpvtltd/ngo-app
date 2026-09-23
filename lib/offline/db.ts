import { openDB, type DBSchema, type IDBPDatabase } from "idb";
import type { QueuedMutation, DraftRecord } from "./schemas";

interface OfflineDbSchema extends DBSchema {
  mutation_queue: {
    key: string;
    value: QueuedMutation;
    indexes: { "by-status": string };
  };
  drafts: {
    key: string;
    value: DraftRecord;
  };
  app_metadata: {
    key: string;
    value: { key: string; value: unknown };
  };
  sync_state: {
    key: string;
    value: { key: string; value: unknown };
  };
}

const DB_NAME = "bsa-offline";
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<OfflineDbSchema>> | null = null;

/**
 * Lazily opens (and upgrades) the offline IndexedDB database. Shared by
 * foreground code and the service worker's background-sync handler — both
 * read the same `mutation_queue` store (app.md #14, #21).
 */
export function openOfflineDb(): Promise<IDBPDatabase<OfflineDbSchema>> {
  if (!dbPromise) {
    dbPromise = openDB<OfflineDbSchema>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains("mutation_queue")) {
          const store = db.createObjectStore("mutation_queue", { keyPath: "id" });
          store.createIndex("by-status", "status");
        }
        if (!db.objectStoreNames.contains("drafts")) {
          db.createObjectStore("drafts", { keyPath: "id" });
        }
        if (!db.objectStoreNames.contains("app_metadata")) {
          db.createObjectStore("app_metadata", { keyPath: "key" });
        }
        if (!db.objectStoreNames.contains("sync_state")) {
          db.createObjectStore("sync_state", { keyPath: "key" });
        }
      },
    });
  }

  return dbPromise;
}

export type { OfflineDbSchema };
