import type { CreateTaskInput, Task, UpdateTaskInput } from "@/lib/types";
import type { TaskSource } from "@/lib/sources/types";

/**
 * Placeholder voor de toekomstige Akiflow-koppeling.
 *
 * Akiflow heeft (nog) geen publieke API om taken op te halen. Zodra je
 * een koppelmethode kiest, vul je deze klasse in. Voorbeelden:
 *
 *  1) Zapier/Make webhook  -> Akiflow stuurt taken naar een API-route van
 *     dit dashboard. Sla ze op en map ze hieronder naar `Task`.
 *  2) Bron-tool (Todoist / Google Tasks / Google Calendar) -> praat met
 *     die API en map het resultaat naar `Task`.
 *
 * Om te activeren: zet AKIFLOW als bron in sources/index.ts.
 */
export class AkiflowTaskSource implements TaskSource {
  readonly name = "akiflow";

  constructor(private readonly apiToken?: string) {}

  private notConfigured(): never {
    throw new Error(
      "Akiflow-koppeling is nog niet geconfigureerd. Zie src/lib/sources/akiflow.ts."
    );
  }

  /**
   * Map een ruwe Akiflow/Zapier-payload naar het interne Task-model.
   * Pas dit aan zodra het echte payload-formaat bekend is.
   */
  static fromAkiflow(raw: Record<string, unknown>): Partial<Task> {
    return {
      title: String(raw.title ?? raw.name ?? ""),
      description: raw.notes ? String(raw.notes) : undefined,
      status: raw.done ? "done" : "todo",
      sourceId: raw.id ? String(raw.id) : undefined,
      source: "akiflow",
    };
  }

  async list(): Promise<Task[]> {
    this.notConfigured();
  }
  async get(_id: string): Promise<Task | null> {
    this.notConfigured();
  }
  async create(_input: CreateTaskInput): Promise<Task> {
    this.notConfigured();
  }
  async update(_id: string, _input: UpdateTaskInput): Promise<Task | null> {
    this.notConfigured();
  }
  async remove(_id: string): Promise<boolean> {
    this.notConfigured();
  }
}
