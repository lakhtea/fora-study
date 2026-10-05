export const events: { name: string; at: number }[] = [];

export interface TrackedEvent {
  name: string;
  at: number;
}

export function trackClick(name: string): TrackedEvent {
  const event = { name, at: Date.now() };
  events.push(event);
  return event;
}
