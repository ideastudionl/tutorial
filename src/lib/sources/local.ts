import { promises as fs } from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";

import type { CreateTaskInput, Task, UpdateTaskInput } from "@/lib/types";
import type { TaskSource } from "@/lib/sources/types";
import { seedTasks } from "@/lib/seed";

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "tasks.json");

/**
 * Lokale takenbron met file-backed opslag in data/tasks.json.
 *
 * - Bij de eerste keer worden de voorbeeldtaken weggeschreven.
 * - Schrijven naar schijf is best-effort: op een read-only filesystem
 *   (bijv. serverless) blijft alles in het geheugen werken binnen de
 *   levensduur van het proces.
 */
export class LocalTaskSource implements TaskSource {
  readonly name = "local";

  private tasks: Task[] | null = null;
  private canPersist = true;

  private async load(): Promise<Task[]> {
    if (this.tasks) return this.tasks;

    try {
      const raw = await fs.readFile(DATA_FILE, "utf8");
      this.tasks = JSON.parse(raw) as Task[];
    } catch {
      // Bestand bestaat nog niet -> seed met voorbeelddata.
      this.tasks = seedTasks();
      await this.persist();
    }

    return this.tasks;
  }

  private async persist(): Promise<void> {
    if (!this.canPersist || !this.tasks) return;
    try {
      await fs.mkdir(DATA_DIR, { recursive: true });
      await fs.writeFile(DATA_FILE, JSON.stringify(this.tasks, null, 2), "utf8");
    } catch {
      // Read-only filesystem: vanaf nu alleen in-memory verder.
      this.canPersist = false;
    }
  }

  async list(): Promise<Task[]> {
    const tasks = await this.load();
    // Open taken eerst, daarna op aanmaakdatum (nieuwste boven).
    const order: Record<string, number> = { doing: 0, todo: 1, done: 2 };
    return [...tasks].sort((a, b) => {
      if (order[a.status] !== order[b.status]) {
        return order[a.status] - order[b.status];
      }
      return b.createdAt.localeCompare(a.createdAt);
    });
  }

  async get(id: string): Promise<Task | null> {
    const tasks = await this.load();
    return tasks.find((t) => t.id === id) ?? null;
  }

  async create(input: CreateTaskInput): Promise<Task> {
    const tasks = await this.load();
    const now = new Date().toISOString();
    const task: Task = {
      id: randomUUID(),
      title: input.title.trim(),
      description: input.description?.trim() || undefined,
      status: input.status ?? "todo",
      priority: input.priority ?? "medium",
      dueDate: input.dueDate || undefined,
      source: this.name,
      createdAt: now,
      updatedAt: now,
    };
    tasks.push(task);
    await this.persist();
    return task;
  }

  async update(id: string, input: UpdateTaskInput): Promise<Task | null> {
    const tasks = await this.load();
    const task = tasks.find((t) => t.id === id);
    if (!task) return null;

    if (input.title !== undefined) task.title = input.title.trim();
    if (input.description !== undefined) {
      task.description = input.description.trim() || undefined;
    }
    if (input.status !== undefined) task.status = input.status;
    if (input.priority !== undefined) task.priority = input.priority;
    if (input.dueDate !== undefined) task.dueDate = input.dueDate || undefined;
    task.updatedAt = new Date().toISOString();

    await this.persist();
    return task;
  }

  async remove(id: string): Promise<boolean> {
    const tasks = await this.load();
    const index = tasks.findIndex((t) => t.id === id);
    if (index === -1) return false;
    tasks.splice(index, 1);
    await this.persist();
    return true;
  }
}
