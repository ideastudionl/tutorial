import { NextResponse } from "next/server";

import { getTaskSource } from "@/lib/sources";
import type { CreateTaskInput, TaskPriority, TaskStatus } from "@/lib/types";

const STATUSES: TaskStatus[] = ["todo", "doing", "done"];
const PRIORITIES: TaskPriority[] = ["low", "medium", "high"];

export const dynamic = "force-dynamic";

// GET /api/tasks -> alle taken
export async function GET() {
  const tasks = await getTaskSource().list();
  return NextResponse.json({ tasks });
}

// POST /api/tasks -> nieuwe taak
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Ongeldige JSON." }, { status: 400 });
  }

  const data = body as Record<string, unknown>;
  const title = typeof data.title === "string" ? data.title.trim() : "";
  if (!title) {
    return NextResponse.json({ error: "Titel is verplicht." }, { status: 400 });
  }

  const input: CreateTaskInput = { title };

  if (typeof data.description === "string") input.description = data.description;
  if (STATUSES.includes(data.status as TaskStatus)) {
    input.status = data.status as TaskStatus;
  }
  if (PRIORITIES.includes(data.priority as TaskPriority)) {
    input.priority = data.priority as TaskPriority;
  }
  if (typeof data.dueDate === "string") input.dueDate = data.dueDate;

  const task = await getTaskSource().create(input);
  return NextResponse.json({ task }, { status: 201 });
}
