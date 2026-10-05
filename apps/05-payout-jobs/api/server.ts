import type { ReportJob } from "../types";
import { json, wait } from "../../../shared/format";

const JOBS = new Map<number, ReportJob & { startedAt: number; failAt?: number }>();
let nextId = 1;
let transientFailures = 0;

export async function apiFetch(url: string, init?: RequestInit): Promise<Response> {
  const { pathname } = new URL(url, "http://advisor.local");

  if (pathname === "/api/reports" && init?.method === "POST") {
    await wait(150, 250);
    const body = JSON.parse(String(init.body)) as { kind: ReportJob["kind"]; month: string };
    const id = nextId++;
    const job: ReportJob & { startedAt: number; failAt?: number } = { id, kind: body.kind, month: body.month, status: "queued", progress: 0, startedAt: Date.now() };
    if (body.month === "2026-02") job.failAt = 60;
    JOBS.set(id, job);
    return json({ id, status: "queued" }, 202);
  }

  if (pathname === "/api/reports" && (!init?.method || init.method === "GET")) {
    await wait(80, 150);
    return json(Array.from(JOBS.values()).map(tick));
  }

  const match = pathname.match(/^\/api\/reports\/(\d+)$/);
  if (match) {
    const job = JOBS.get(Number(match[1]));
    if (!job) return json({ message: "Not found" }, 404);
    if (init?.method === "DELETE") {
      await wait(100, 150);
      JOBS.delete(job.id);
      return new Response(null, { status: 204 });
    }
    await wait(80, 150);
    if (job.status === "running" && transientFailures < 2 && job.progress > 20 && job.progress < 40) {
      transientFailures++;
      return json({ message: "Status service hiccup, retry" }, 503);
    }
    return json(tick(job));
  }

  return json({ message: "Not found" }, 404);
}

function tick(job: ReportJob & { startedAt: number; failAt?: number }): ReportJob {
  if (job.status === "done" || job.status === "failed") return job;
  const elapsed = Date.now() - job.startedAt;
  const progress = Math.min(100, Math.floor(elapsed / 25));
  job.status = progress >= 100 ? "done" : "running";
  job.progress = progress;
  if (job.failAt !== undefined && progress >= job.failAt) {
    job.status = "failed";
    job.error = "February payouts are locked until the audit closes";
  }
  if (job.status === "done") job.downloadUrl = `/downloads/${job.kind}-${job.month}.csv`;
  return job;
}

export function resetServer() {
  JOBS.clear();
  nextId = 1;
  transientFailures = 0;
}
