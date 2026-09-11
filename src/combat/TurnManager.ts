/**
 * Timeline-based turn order using action delay / SPEED.
 */

export interface TimelineEntry {
  id: string;
  name: string;
  isPlayer: boolean;
  nextActionAt: number;
  speed: number;
}

export class TurnManager {
  private timeline: TimelineEntry[] = [];
  private currentTime = 0;

  reset(combatants: Array<{ id: string; name: string; isPlayer: boolean; speed: number }>): void {
    this.currentTime = 0;
    this.timeline = combatants.map((c) => ({
      id: c.id,
      name: c.name,
      isPlayer: c.isPlayer,
      nextActionAt: 0,
      speed: c.speed,
    }));
    this.timeline.sort((a, b) => b.speed - a.speed);
    this.timeline.forEach((t, i) => {
      t.nextActionAt = i * 0.01;
    });
  }

  next(): TimelineEntry | null {
    if (this.timeline.length === 0) return null;
    this.timeline.sort((a, b) => a.nextActionAt - b.nextActionAt);
    const next = this.timeline[0];
    this.currentTime = next.nextActionAt;
    return next;
  }

  scheduleNext(id: string, actionDelay: number): void {
    const entry = this.timeline.find((t) => t.id === id);
    if (!entry) return;
    const delay = actionDelay / Math.max(1, entry.speed);
    entry.nextActionAt = this.currentTime + delay;
  }

  remove(id: string): void {
    this.timeline = this.timeline.filter((t) => t.id !== id);
  }

  updateSpeed(id: string, newSpeed: number): void {
    const entry = this.timeline.find((t) => t.id === id);
    if (entry) entry.speed = newSpeed;
  }

  getPreview(count = 5): TimelineEntry[] {
    const copy = this.timeline.map((t) => ({ ...t }));
    copy.sort((a, b) => a.nextActionAt - b.nextActionAt);
    return copy.slice(0, count);
  }

  getCurrentTime(): number {
    return this.currentTime;
  }
}
