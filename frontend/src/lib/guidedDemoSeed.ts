import { improveMemory, rememberMemory } from "@/lib/api";
import { novaTechMemoriesToSeed } from "@/lib/novaTechDemo";

const SESSION_KEY = "chronicle.novatech.seeded";

let activeSeedPromise: Promise<void> | null = null;

async function importNovaTechMemories(): Promise<void> {
  for (const memory of novaTechMemoriesToSeed) {
    await rememberMemory(memory.memoryText);
  }
  try {
    await improveMemory("main_dataset");
  } catch {
    // Improve is best-effort for demo seeding.
  }
}

export function isNovaTechSeededInSession(): boolean {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem(SESSION_KEY) === "1";
}

export function markNovaTechSeededInSession(): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(SESSION_KEY, "1");
}

/** Import NovaTech demo memories at most once per browser session. */
export function ensureNovaTechSeededOnce(): Promise<void> {
  if (isNovaTechSeededInSession()) {
    return Promise.resolve();
  }

  if (!activeSeedPromise) {
    activeSeedPromise = importNovaTechMemories()
      .then(() => {
        markNovaTechSeededInSession();
      })
      .catch((error) => {
        activeSeedPromise = null;
        throw error;
      });
  }

  return activeSeedPromise;
}
