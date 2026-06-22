import type { CreateTaskInput, Task, UpdateTaskInput } from "@/lib/types";

/**
 * TaskSource is de abstractie waar het hele dashboard tegenaan praat.
 *
 * Op dit moment is er één implementatie: de LocalTaskSource (file-backed).
 * Een latere Akiflow-koppeling implementeert exact dezelfde interface
 * (zie sources/akiflow.ts), waarna je hem in sources/index.ts inschakelt.
 * De rest van de app hoeft dan niets te veranderen.
 */
export interface TaskSource {
  /** Korte naam, komt terecht in Task.source (bijv. "local", "akiflow"). */
  readonly name: string;

  /** Alle taken ophalen, gesorteerd zoals de bron dat wil. */
  list(): Promise<Task[]>;

  /** Eén taak ophalen op id, of null als die niet bestaat. */
  get(id: string): Promise<Task | null>;

  /** Een nieuwe taak aanmaken. */
  create(input: CreateTaskInput): Promise<Task>;

  /** Een bestaande taak bijwerken, of null als die niet bestaat. */
  update(id: string, input: UpdateTaskInput): Promise<Task | null>;

  /** Een taak verwijderen. Geeft true terug als er iets verwijderd is. */
  remove(id: string): Promise<boolean>;
}
