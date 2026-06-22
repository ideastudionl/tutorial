import { randomUUID } from "node:crypto";

import type { Task } from "@/lib/types";

/** Een datum N dagen vanaf nu, als YYYY-MM-DD. */
function inDays(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

/**
 * Voorbeelddata zodat het dashboard meteen gevuld is. Zodra de echte
 * Akiflow-koppeling actief is, kunnen deze taken weg.
 */
export function seedTasks(): Task[] {
  const now = new Date().toISOString();
  const base = {
    source: "local",
    createdAt: now,
    updatedAt: now,
  };

  return [
    {
      id: randomUUID(),
      title: "Akiflow-koppeling uitwerken",
      description: "Bepalen via welke route (Zapier/Make of bron-tool) de taken binnenkomen.",
      status: "doing",
      priority: "high",
      dueDate: inDays(2),
      ...base,
    },
    {
      id: randomUUID(),
      title: "Wekelijkse planning maken",
      description: "Prioriteiten voor de week vastleggen.",
      status: "todo",
      priority: "medium",
      dueDate: inDays(1),
      ...base,
    },
    {
      id: randomUUID(),
      title: "Inbox legen",
      description: "Alle losse taken een status en deadline geven.",
      status: "todo",
      priority: "low",
      ...base,
    },
    {
      id: randomUUID(),
      title: "Project-kickoff voorbereiden",
      status: "todo",
      priority: "high",
      dueDate: inDays(5),
      ...base,
    },
    {
      id: randomUUID(),
      title: "Dashboard opzetten",
      description: "Basis Next.js-app met takenlijst en statusbeheer.",
      status: "done",
      priority: "medium",
      ...base,
    },
  ];
}
