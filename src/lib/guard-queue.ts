/** Cola local (IndexedDB) para movimientos de caseta cuando falla la red. */

const DB_NAME = "nauka-guard-queue";
const STORE = "pending_movements";
const DB_VERSION = 1;

export type GuardQueuedMovement = {
  id: string;
  token: string;
  tipoEvento: "entrada" | "salida";
  /** Rutas en bucket `evidencias_salida` (salida: al menos 1 si se pudo subir antes de encolar). */
  evidenciaStoragePaths: string[];
  createdAt: number;
};

/** Normaliza filas antiguas que solo guardaban `evidenciaStoragePath`. */
function normalizeStoredRow(raw: Record<string, unknown>): GuardQueuedMovement {
  const fromArr = Array.isArray(raw.evidenciaStoragePaths)
    ? (raw.evidenciaStoragePaths as unknown[]).filter((p): p is string => typeof p === "string" && p.trim().length > 0)
    : [];
  const legacy =
    typeof raw.evidenciaStoragePath === "string" && raw.evidenciaStoragePath.trim()
      ? [raw.evidenciaStoragePath.trim()]
      : [];
  const paths = (fromArr.length ? fromArr : legacy).slice(0, 3);
  return {
    id: String(raw.id),
    token: String(raw.token),
    tipoEvento: raw.tipoEvento === "salida" ? "salida" : "entrada",
    evidenciaStoragePaths: paths,
    createdAt: Number(raw.createdAt)
  };
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: "id" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error ?? new Error("IndexedDB error"));
  });
}

export async function countPendingGuardMovements(): Promise<number> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readonly");
    const store = tx.objectStore(STORE);
    const req = store.count();
    req.onsuccess = () => resolve(Number(req.result ?? 0));
    req.onerror = () => reject(req.error ?? new Error("count failed"));
    tx.oncomplete = () => db.close();
  });
}

export async function enqueueGuardMovement(
  item: Omit<GuardQueuedMovement, "id" | "createdAt"> & {
    id?: string;
    /** Compat: un solo path (migraciones antiguas en memoria). */
    evidenciaStoragePath?: string | null;
  }
): Promise<void> {
  const fromPaths = item.evidenciaStoragePaths?.filter((p) => p.trim()).slice(0, 3) ?? [];
  const legacy = item.evidenciaStoragePath?.trim() ? [item.evidenciaStoragePath.trim()] : [];
  const evidenciaStoragePaths = (fromPaths.length ? fromPaths : legacy).slice(0, 3);

  const db = await openDb();
  const row: GuardQueuedMovement = {
    id: item.id ?? crypto.randomUUID(),
    token: item.token,
    tipoEvento: item.tipoEvento,
    evidenciaStoragePaths,
    createdAt: Date.now()
  };
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).put(row);
    tx.oncomplete = () => {
      db.close();
      resolve();
    };
    tx.onerror = () => reject(tx.error ?? new Error("enqueue failed"));
  });
}

async function listAllOrdered(): Promise<GuardQueuedMovement[]> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readonly");
    const store = tx.objectStore(STORE);
    const req = store.getAll();
    req.onsuccess = () => {
      const rawRows = (req.result as Record<string, unknown>[]) ?? [];
      const rows = rawRows.map((r) => normalizeStoredRow(r));
      rows.sort((a, b) => a.createdAt - b.createdAt);
      resolve(rows);
    };
    req.onerror = () => reject(req.error ?? new Error("list failed"));
    tx.oncomplete = () => db.close();
  });
}

async function removeById(id: string): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).delete(id);
    tx.oncomplete = () => {
      db.close();
      resolve();
    };
    tx.onerror = () => reject(tx.error ?? new Error("delete failed"));
  });
}

export async function flushGuardMovementQueue(onProgress?: (remaining: number) => void): Promise<{ synced: number; failed: number }> {
  let synced = 0;
  let failed = 0;
  const pending = await listAllOrdered();
  for (const row of pending) {
    try {
      const body: Record<string, unknown> = {
        token: row.token,
        tipoEvento: row.tipoEvento
      };
      if (row.tipoEvento === "salida" && row.evidenciaStoragePaths.length > 0) {
        body.evidenciaStoragePaths = row.evidenciaStoragePaths;
      }
      const response = await fetch("/api/guardia/registrar-movimiento", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      if (response.ok) {
        await removeById(row.id);
        synced += 1;
      } else {
        failed += 1;
        break;
      }
    } catch {
      failed += 1;
      break;
    }
    onProgress?.(await countPendingGuardMovements());
  }
  return { synced, failed };
}
