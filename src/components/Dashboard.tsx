"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import type { Task, TaskStatus, UpdateTaskInput } from "@/lib/types";
import AddTaskForm from "@/components/AddTaskForm";
import TaskItem from "@/components/TaskItem";

type Filter = "all" | TaskStatus;

const FILTERS: { value: Filter; label: string }[] = [
  { value: "all", label: "Alle" },
  { value: "todo", label: "Te doen" },
  { value: "doing", label: "Bezig" },
  { value: "done", label: "Klaar" },
];

export default function Dashboard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("all");

  const loadTasks = useCallback(async () => {
    try {
      const res = await fetch("/api/tasks");
      if (!res.ok) throw new Error("Taken laden mislukt.");
      const data = (await res.json()) as { tasks: Task[] };
      setTasks(data.tasks);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Onbekende fout.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const handleCreate = useCallback(
    async (input: { title: string; priority: string; dueDate?: string }) => {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Aanmaken mislukt.");
      }
      const { task } = (await res.json()) as { task: Task };
      setTasks((prev) => [task, ...prev]);
    },
    []
  );

  const handleUpdate = useCallback(
    async (id: string, input: UpdateTaskInput) => {
      // Optimistische update.
      setTasks((prev) =>
        prev.map((t) => (t.id === id ? { ...t, ...input } : t))
      );
      const res = await fetch(`/api/tasks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      if (!res.ok) {
        setError("Bijwerken mislukt, taken worden opnieuw geladen.");
        loadTasks();
        return;
      }
      const { task } = (await res.json()) as { task: Task };
      setTasks((prev) => prev.map((t) => (t.id === id ? task : t)));
    },
    [loadTasks]
  );

  const handleDelete = useCallback(async (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    const res = await fetch(`/api/tasks/${id}`, { method: "DELETE" });
    if (!res.ok) {
      setError("Verwijderen mislukt, taken worden opnieuw geladen.");
      loadTasks();
    }
  }, [loadTasks]);

  const stats = useMemo(() => {
    return {
      total: tasks.length,
      todo: tasks.filter((t) => t.status === "todo").length,
      doing: tasks.filter((t) => t.status === "doing").length,
      done: tasks.filter((t) => t.status === "done").length,
    };
  }, [tasks]);

  const visibleTasks = useMemo(() => {
    if (filter === "all") return tasks;
    return tasks.filter((t) => t.status === filter);
  }, [tasks, filter]);

  return (
    <>
      <section className="stats">
        <div className="stat">
          <div className="num">{stats.total}</div>
          <div className="label">Totaal</div>
        </div>
        <div className="stat">
          <div className="num">{stats.todo}</div>
          <div className="label">Te doen</div>
        </div>
        <div className="stat">
          <div className="num">{stats.doing}</div>
          <div className="label">Bezig</div>
        </div>
        <div className="stat">
          <div className="num">{stats.done}</div>
          <div className="label">Klaar</div>
        </div>
      </section>

      <AddTaskForm onCreate={handleCreate} />

      {error && <div className="error">{error}</div>}

      <div className="filters">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            className={filter === f.value ? "active" : ""}
            onClick={() => setFilter(f.value)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="loading">Laden…</div>
      ) : visibleTasks.length === 0 ? (
        <div className="empty">Geen taken in deze weergave.</div>
      ) : (
        <ul className="task-list">
          {visibleTasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
            />
          ))}
        </ul>
      )}
    </>
  );
}
