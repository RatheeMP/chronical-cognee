import { rememberMemory } from "@/lib/api";
import type { MemoryItem } from "@/types/memory";

export async function rememberTexts(texts: string[]): Promise<{
  items: MemoryItem[];
  failures: string[];
}> {
  const items: MemoryItem[] = [];
  const failures: string[] = [];

  for (const text of texts) {
    try {
      const response = await rememberMemory(text);
      if (response.status !== "completed") {
        failures.push(`Cognee status: ${response.status}`);
        continue;
      }
      const dataId = response.items?.[response.items.length - 1]?.id;
      if (!dataId) {
        failures.push("Missing memory id from response");
        continue;
      }
      items.push({
        id: response.pipeline_run_id ?? crypto.randomUUID(),
        dataId,
        datasetName: response.dataset_name ?? "main_dataset",
        timestamp: new Date(),
        text,
        status: response.status,
      });
    } catch (err) {
      failures.push(err instanceof Error ? err.message : "Import failed");
    }
  }

  return { items, failures };
}

export async function importMemoryTexts(
  texts: string[],
  onProgress?: (current: number, total: number) => void,
): Promise<{ items: MemoryItem[]; failures: string[] }> {
  const allItems: MemoryItem[] = [];
  const allFailures: string[] = [];

  for (let i = 0; i < texts.length; i += 1) {
    onProgress?.(i + 1, texts.length);
    const { items, failures } = await rememberTexts([texts[i]]);
    allItems.push(...items);
    allFailures.push(...failures);
  }

  return { items: allItems, failures: allFailures };
}

export function splitMemoryStack(raw: string): string[] {
  return raw
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter((block) => block.length > 20);
}
