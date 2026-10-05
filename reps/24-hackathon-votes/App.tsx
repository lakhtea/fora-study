import { useEffect, useState } from "react";
import { castVote, fetchProjects } from "./api/client";
import { ProjectList } from "./components/ProjectList";
import type { Category, Project } from "./types";

const CATEGORIES: { value: Category; label: string }[] = [
  { value: "advisor-tools", label: "Advisor tools" },
  { value: "client-experience", label: "Client experience" },
  { value: "internal", label: "Internal" },
];

export default function App() {
  const [category, setCategory] = useState<Category>("internal");
  const [projects, setProjects] = useState<Project[]>([]);
  const [polls, setPolls] = useState(0);

  useEffect(() => {
    const load = () => {
      setPolls((n) => n + 1);
      fetchProjects(category).then((rows) => setProjects(rows));
    };
    load();
    setInterval(load, 1500);
  }, [category]);

  const handleVote = async (projectId: number) => {
    const updated = await castVote(projectId);
    setProjects((current) => current.map((p) => (p.id === updated.id ? updated : p.voteState === "Voted" ? { ...p, voteState: "Open", votes: p.votes - 1 } : p)));
  };

  const label = CATEGORIES.find((c) => c.value === category)?.label ?? category;

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1>Hackathon votes</h1>
          <div className="muted">One vote per advisor; voting again moves it. Counts refresh every 1.5 seconds.</div>
        </div>
        <span className="muted counter" aria-label="Polls">
          Polls: {polls}
        </span>
      </header>
      <div className="steps" aria-label="Categories">
        {CATEGORIES.map((c) => (
          <button key={c.value} type="button" className={c.value === category ? "active" : undefined} style={{ border: 0, cursor: "pointer", font: "inherit" }} onClick={() => setCategory(c.value)} aria-pressed={c.value === category}>
            {c.label}
          </button>
        ))}
      </div>
      <h2 aria-label="Category heading">{label}</h2>
      <ProjectList projects={projects} onVote={handleVote} />
    </div>
  );
}
