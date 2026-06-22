import { LocalTaskSource } from "@/lib/sources/local";
import type { TaskSource } from "@/lib/sources/types";

/**
 * Centrale plek waar de actieve takenbron wordt gekozen.
 *
 * Nu: LocalTaskSource (voorbeelddata + lokale opslag).
 * Later: vervang dit door de AkiflowTaskSource zodra de koppeling klaar is,
 *        of combineer meerdere bronnen. De rest van de app gebruikt alleen
 *        getTaskSource() en hoeft niet te weten welke bron actief is.
 */
let instance: TaskSource | null = null;

export function getTaskSource(): TaskSource {
  if (!instance) {
    instance = new LocalTaskSource();
  }
  return instance;
}

export type { TaskSource } from "@/lib/sources/types";
