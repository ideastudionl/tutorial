"use client";

import type { Task, TaskStatus, UpdateTaskInput } from "@/lib/types";

interface Props {
  task: Task;
  onUpdate: (id: string, input: UpdateTaskInput) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

const STATUS_LABELS: Record<TaskStatus, string> = {
  todo: "Te doen",
  doing: "Bezig",
  done: "Klaar",
};

const PRIORITY_LABELS: Record<Task["priority"], string> = {
  low: "Laag",
  medium: "Middel",
  high: "Hoog",
};

function formatDue(dueDate?: string): { label: string; overdue: boolean } | null {
  if (!dueDate) return null;
  const due = new Date(dueDate + "T00:00:00");
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const overdue = due < today;
  const label = due.toLocaleDateString("nl-NL", {
    day: "numeric",
    month: "short",
  });
  return { label, overdue };
}

export default function TaskItem({ task, onUpdate, onDelete }: Props) {
  const due = formatDue(task.dueDate);

  function toggleDone() {
    onUpdate(task.id, { status: task.status === "done" ? "todo" : "done" });
  }

  return (
    <li className={`task ${task.status === "done" ? "done" : ""}`}>
      <input
        type="checkbox"
        className="task-check"
        checked={task.status === "done"}
        onChange={toggleDone}
        aria-label="Taak afronden"
      />

      <div className="task-main">
        <div className="task-title">{task.title}</div>
        {task.description && <div className="task-desc">{task.description}</div>}
        <div className="task-meta">
          <span className={`badge status-${task.status}`}>
            {STATUS_LABELS[task.status]}
          </span>
          <span className={`badge prio-${task.priority}`}>
            {PRIORITY_LABELS[task.priority]}
          </span>
          {due && (
            <span className={`task-due ${due.overdue ? "overdue" : ""}`}>
              📅 {due.label}
              {due.overdue ? " (verlopen)" : ""}
            </span>
          )}
        </div>
      </div>

      <div className="task-actions">
        <select
          value={task.status}
          onChange={(e) =>
            onUpdate(task.id, { status: e.target.value as TaskStatus })
          }
          aria-label="Status wijzigen"
        >
          <option value="todo">Te doen</option>
          <option value="doing">Bezig</option>
          <option value="done">Klaar</option>
        </select>
        <button
          className="icon-btn danger"
          onClick={() => onDelete(task.id)}
          aria-label="Verwijderen"
          title="Verwijderen"
        >
          ✕
        </button>
      </div>
    </li>
  );
}
