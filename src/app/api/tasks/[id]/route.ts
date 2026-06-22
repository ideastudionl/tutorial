import { NextResponse } from "next/server";

import { getTaskSource } from "@/lib/sources";
import type { TaskPriority, TaskStatus, UpdateTaskInput } from "@/lib/types";

const STATUSES: TaskStatus[] = ["todo", "doing", "done"];
const PRIORITIES: TaskPriority[] = ["low", "medium", "high"];

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

// GET /api/tasks/:id
export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;
  const task = await getTaskSource().get(id);
  if (!task) {
    return NextResponse.json({ error: "Taak niet gevonden." }, { status: 404 });
  }
  return NextResponse.json({ task });
}

// PATCH /api/tasks/:id -> velden bijwerken
export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Ongeldige JSON." }, { status: 400 });
  }

  const data = body as Record<string, unknown>;
  const input: UpdateTaskInput = {};

  if (typeof data.title === "string") {
    if (!data.title.trim()) {
      return NextResponse.json({ error: "Titel mag niet leeg zijn." }, { status: 400 });
    }
    input.title = data.title;
  }
  if (typeof data.description === "string") input.description = data.description;
  if (data.status !== undefined) {
    if (!STATUSES.includes(data.status as TaskStatus)) {
      return NextResponse.json({ error: "Ongeldige status." }, { status: 400 });
    }
    input.status = data.status as TaskStatus;
  }
  if (data.priority !== undefined) {
    if (!PRIORITIES.includes(data.priority as TaskPriority)) {
      return NextResponse.json({ error: "Ongeldige prioriteit." }, { status: 400 });
    }
    input.priority = data.priority as TaskPriority;
  }
  if (typeof data.dueDate === "string") input.dueDate = data.dueDate;

  const task = await getTaskSource().update(id, input);
  if (!task) {
    return NextResponse.json({ error: "Taak niet gevonden." }, { status: 404 });
  }
  return NextResponse.json({ task });
}

// DELETE /api/tasks/:id
export async function DELETE(_request: Request, { params }: Params) {
  const { id } = await params;
  const removed = await getTaskSource().remove(id);
  if (!removed) {
    return NextResponse.json({ error: "Taak niet gevonden." }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
