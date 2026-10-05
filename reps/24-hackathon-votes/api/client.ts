import type { Category, Project } from "../types";
import { apiFetch } from "./server";

async function requireOk(res: Response, what: string): Promise<Response> {
  if (!res.ok) throw new Error(`${what} failed (${res.status})`);
  return res;
}

export async function fetchProjects(category: Category): Promise<Project[]> {
  const res = await requireOk(await apiFetch(`/api/hackathon/projects?category=${category}`), "Loading projects");
  return res.json();
}

export async function castVote(projectId: number): Promise<Project> {
  const res = await requireOk(await apiFetch("/api/hackathon/vote", { method: "POST", body: JSON.stringify({ projectId }) }), "Voting");
  return res.json();
}
