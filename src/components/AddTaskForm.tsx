"use client";

import { useState } from "react";

import type { TaskPriority } from "@/lib/types";

interface Props {
  onCreate: (input: {
    title: string;
    priority: TaskPriority;
    dueDate?: string;
  }) => Promise<void>;
}

export default function AddTaskForm({ onCreate }: Props) {
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [dueDate, setDueDate] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed || submitting) return;

    setSubmitting(true);
    try {
      await onCreate({
        title: trimmed,
        priority,
        dueDate: dueDate || undefined,
      });
      setTitle("");
      setPriority("medium");
      setDueDate("");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="add-form" onSubmit={handleSubmit}>
      <input
        type="text"
        name="title"
        placeholder="Nieuwe taak…"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        autoComplete="off"
      />
      <select
        value={priority}
        onChange={(e) => setPriority(e.target.value as TaskPriority)}
        aria-label="Prioriteit"
      >
        <option value="low">Laag</option>
        <option value="medium">Middel</option>
        <option value="high">Hoog</option>
      </select>
      <input
        type="date"
        value={dueDate}
        onChange={(e) => setDueDate(e.target.value)}
        aria-label="Deadline"
      />
      <button type="submit" className="primary" disabled={!title.trim() || submitting}>
        {submitting ? "Bezig…" : "Toevoegen"}
      </button>
    </form>
  );
}
