import type { Project } from "../types";

interface ProjectListProps {
  projects: Project[];
  onVote: (projectId: number) => void;
}

export function ProjectList({ projects, onVote }: ProjectListProps) {
  if (projects.length === 0) return <div className="empty">No projects in this category.</div>;
  return (
    <ul className="list" aria-label="Projects">
      {projects.map((project) => (
        <li key={project.id} data-testid={`project-${project.id}`}>
          <span>
            <strong>{project.name}</strong> <span className="muted">{project.team}</span>
          </span>
          <span>
            <span aria-label={`Votes ${project.id}`}>{project.votes} votes</span>{" "}
            {project.voteState === "voted" ? (
              <span className="badge confirmed">Your vote</span>
            ) : project.voteState === "open" ? (
              <button type="button" className="link" onClick={() => onVote(project.id)} aria-label={`Vote ${project.name}`}>
                Vote
              </button>
            ) : null}
          </span>
        </li>
      ))}
    </ul>
  );
}
