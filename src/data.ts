import { format } from "date-fns";
import { AppData, Habit } from "./types";

export const STORAGE_KEY = "habithex:v1";

export const starterHabits = (today: string): Habit[] => [
  { id: crypto.randomUUID(), name: "Reading", icon: "book", trackingType: "numeric", target: 20, unit: "pages", weekdays: [0, 1, 2, 3, 4, 5, 6], createdAt: today },
  { id: crypto.randomUUID(), name: "Gym", icon: "gym", trackingType: "boolean", target: 1, unit: "workout", weekdays: [0, 1, 3, 5], createdAt: today },
  { id: crypto.randomUUID(), name: "Sleep", icon: "sleep", trackingType: "numeric", target: 7, unit: "hours", weekdays: [0, 1, 2, 3, 4, 5, 6], createdAt: today },
];

export function toLocalDateKey(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

export function readAppData(): AppData {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return { version: 1, habits: starterHabits(toLocalDateKey(new Date())), checkIns: [] };
  try {
    const parsed = JSON.parse(raw) as AppData;
    if (parsed?.version !== 1 || !Array.isArray(parsed.habits) || !Array.isArray(parsed.checkIns)) throw new Error("Invalid saved data");
    return parsed;
  } catch {
    return { version: 1, habits: starterHabits(toLocalDateKey(new Date())), checkIns: [] };
  }
}

export function saveAppData(data: AppData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}
