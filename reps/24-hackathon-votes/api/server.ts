import { json, wait } from "../../../shared/format";

interface ProjectRecord {
  id: number;
  name: string;
  team: string;
  category: "advisor-tools" | "client-experience" | "internal";
  votes: number;
}

const PROJECTS: ProjectRecord[] = [
  { id: 1, name: "Via voice notes", team: "Advisor Enablement", category: "advisor-tools", votes: 14 },
  { id: 2, name: "Itinerary diff view", team: "Advisor Enablement", category: "advisor-tools", votes: 11 },
  { id: 3, name: "Supplier autofill", team: "Booking Platform", category: "advisor-tools", votes: 9 },
  { id: 4, name: "Commission forecaster", team: "Finance", category: "advisor-tools", votes: 7 },
  { id: 5, name: "Room block planner", team: "Booking Platform", category: "advisor-tools", votes: 6 },
  { id: 6, name: "Passport expiry nudges", team: "Membership", category: "advisor-tools", votes: 4 },
  { id: 7, name: "Trip co-creation comments", team: "Client Experience", category: "client-experience", votes: 12 },
  { id: 8, name: "Share link previews", team: "Web", category: "client-experience", votes: 8 },
  { id: 9, name: "Price drop push", team: "Client Experience", category: "client-experience", votes: 5 },
  { id: 10, name: "Flaky test tracker", team: "Platform", category: "internal", votes: 10 },
  { id: 11, name: "Deploy preview bot", team: "Platform", category: "internal", votes: 3 },
];

let myVote: number | null = null;
export let pollsServed = 0;

export async function apiFetch(url: string, init?: RequestInit): Promise<Response> {
  const { pathname, searchParams } = new URL(url, "http://advisor.local");
  if (pathname === "/api/hackathon/projects") {
    const category = searchParams.get("category");
    const rows = PROJECTS.filter((p) => !category || p.category === category);
    pollsServed++;
    await wait(80 + rows.length * 100);
    return json(rows.map((p) => ({ ...p, voteState: myVote === p.id ? "voted" : "open" })));
  }
  if (pathname === "/api/hackathon/vote" && init?.method === "POST") {
    await wait(100, 200);
    const { projectId } = JSON.parse(String(init.body)) as { projectId: number };
    const target = PROJECTS.find((p) => p.id === projectId);
    if (!target) return json({ message: "Not found" }, 404);
    if (myVote !== null) {
      const previous = PROJECTS.find((p) => p.id === myVote);
      if (previous) previous.votes -= 1;
    }
    myVote = projectId;
    target.votes += 1;
    return json({ ...target, voteState: "voted" });
  }
  return json({ message: "Not found" }, 404);
}

export function resetServer() {
  if (myVote !== null) {
    const previous = PROJECTS.find((p) => p.id === myVote);
    if (previous) previous.votes -= 1;
  }
  myVote = null;
  pollsServed = 0;
}
