// Gedeelde types voor het taken-dashboard.

/** Status van een taak. Eenvoudige workflow: te doen -> bezig -> klaar. */
export type TaskStatus = "todo" | "doing" | "done";

/** Prioriteit van een taak. Sluit aan op Akiflow's prioriteiten. */
export type TaskPriority = "low" | "medium" | "high";

/**
 * Een taak. Het model is bewust iets ruimer dan de UI nu toont, zodat
 * een latere Akiflow-koppeling (priority, due, source) er naadloos op past.
 */
export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  /** ISO-datum (YYYY-MM-DD) of undefined als er geen deadline is. */
  dueDate?: string;
  /** Waar de taak vandaan komt: "local" nu, later bijv. "akiflow". */
  source: string;
  /** Het id van de taak in de bron-tool (voor sync/deduplicatie). */
  sourceId?: string;
  createdAt: string;
  updatedAt: string;
}

/** Velden die een client mag meesturen bij het aanmaken van een taak. */
export interface CreateTaskInput {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: string;
}

/** Velden die bij een update mogen worden aangepast (alles optioneel). */
export type UpdateTaskInput = Partial<
  Pick<Task, "title" | "description" | "status" | "priority" | "dueDate">
>;
