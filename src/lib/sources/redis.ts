import { randomUUID } from "node:crypto";
import type { Redis } from "@upstash/redis";

import type { CreateTaskInput, Task, UpdateTaskInput } from "@/lib/types";
import type { TaskSource } from "@/lib/sources/types";
import { seedTasks } from "@/lib/seed";

const KEY = "tasks";

/**
 * Takenbron met opslag in Redis (Upstash). Geschikt voor de cloud, want
 * de data overleeft herstarts van serverless functies.
 *
 * Alle taken staan in één hash onder de sleutel "tasks": veld = task-id,
 * waarde = het Task-object. Bij een lege store wordt eenmalig geseed.
 */
export class RedisTaskSource implements TaskSource {
  readonly name = "redis";

  constructor(private readonly redis: Redis) {}

  private async ensureSeeded(): Promise<void> {
    const count = await this.redis.hlen(KEY);
    if (count > 0) return;
    const tasks = seedTasks();
    const entries: Record<string, Task> = {};
    for (const task of tasks) entries[task.id] = task;
    await this.redis.hset(KEY, entries);
  }

  async list(): Promise<Task[]> {
    await this.ensureSeeded();
    const all = (await this.redis.hgetall<Record<string, Task>>(KEY)) ?? {};
    const tasks = Object.values(all);
    const order: Record<string, number> = { doing: 0, todo: 1, done: 2 };
    return tasks.sort((a, b) => {
      if (order[a.status] !== order[b.status]) {
        return order[a.status] - order[b.status];
      }
      return b.createdAt.localeCompare(a.createdAt);
    });
  }

  async get(id: string): Promise<Task | null> {
    const task = await this.redis.hget<Task>(KEY, id);
    return task ?? null;
  }

  async create(input: CreateTaskInput): Promise<Task> {
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
    await this.redis.hset(KEY, { [task.id]: task });
    return task;
  }

  async update(id: string, input: UpdateTaskInput): Promise<Task | null> {
    const task = await this.get(id);
    if (!task) return null;

    if (input.title !== undefined) task.title = input.title.trim();
    if (input.description !== undefined) {
      task.description = input.description.trim() || undefined;
    }
    if (input.status !== undefined) task.status = input.status;
    if (input.priority !== undefined) task.priority = input.priority;
    if (input.dueDate !== undefined) task.dueDate = input.dueDate || undefined;
    task.updatedAt = new Date().toISOString();

    await this.redis.hset(KEY, { [id]: task });
    return task;
  }

  async remove(id: string): Promise<boolean> {
    const removed = await this.redis.hdel(KEY, id);
    return removed > 0;
  }
}
