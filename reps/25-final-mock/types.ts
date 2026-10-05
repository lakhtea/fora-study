export interface Task {
  id: number;
  title: string;
  client: string;
  due: string;
  done: boolean;
}

export interface Client {
  id: number;
  name: string;
  phone: string;
  email: string;
  city: string;
}

export interface Spotlight {
  clientId: number;
  name: string;
  departs: string;
  status: "booked" | "proposal";
  total: number;
}

export interface Dashboard {
  advisorName: string;
  nextCallInSeconds: number;
  nextCallWith: string;
  tasks: Task[];
  client: Client;
  spotlight: Spotlight;
}
