export type Category = "advisor-tools" | "client-experience" | "internal";
export type VoteState = "Open" | "Voted";

export interface Project {
  id: number;
  name: string;
  team: string;
  category: Category;
  votes: number;
  voteState: VoteState;
}
