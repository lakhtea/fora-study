import type { Task } from "../types";

interface TaskListProps {
  tasks: Task[];
  selectedId: number | null;
  onSelect: (id: number) => void;
  onComplete: (id: number) => void;
}

export function TaskList({ tasks, selectedId, onSelect, onComplete }: TaskListProps) {
  const open = tasks.filter((task) => !task.done);
  return (
    <div className="panel">
      <h2>Today ({open.length} open)</h2>
      {open.length === 0 ? (
        <p className="muted">All done.</p>
      ) : (
        <ul className="list" aria-label="Tasks">
          {open.map((task) => (
            <li key={task.id} className={task.id === selectedId ? "selected" : undefined}>
              <span>
                <button type="button" className="link" onClick={() => onSelect(task.id)} aria-label={`Open ${task.title}`}>
                  {task.title}
                </button>
                <div className="muted">
                  {task.client}, due {task.due}
                </div>
              </span>
              <button type="button" className="secondary" onClick={() => onComplete(task.id)} aria-label={`Done ${task.title}`}>
                Done
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
