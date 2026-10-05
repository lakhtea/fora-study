export const events: { name: string; at: number }[] = [];

export function trackClick(name: string): any {
  const event = { name, at: Date.now() };
  events.push(event);
  return event;
}
