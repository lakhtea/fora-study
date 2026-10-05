import type { Task } from "../types";

export function TaskPanel({ tasks, selectedId }: { tasks: Task[]; selectedId: number | null }) {
  if (selectedId === null) return <div className="panel empty">Open a task to see the details.</div>;
  const task = tasks.find((candidate) => candidate.id === selectedId && !candidate.done)!;
  return (
    <div className="panel" aria-label="Task panel">
      <h2>{task.title}</h2>
      <dl>
        <dt>Client</dt>
        <dd>{task.client}</dd>
        <dt>Due</dt>
        <dd>{task.due}</dd>
      </dl>
    </div>
  );
}
