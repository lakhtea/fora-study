export type JobStatus = "queued" | "running" | "done" | "failed";

export interface ReportJob {
  id: number;
  kind: "payouts" | "commissions";
  month: string;
  status: JobStatus;
  progress: number;
  downloadUrl?: string;
  error?: string;
}
