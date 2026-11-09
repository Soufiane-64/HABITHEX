export type TrackingType = "boolean" | "numeric";
export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;
export type HabitIcon = "book" | "gym" | "sleep" | "water" | "walk" | "study";

export type Habit = {
  id: string;
  name: string;
  icon: HabitIcon;
  trackingType: TrackingType;
  target: number;
  unit: string;
  weekdays: Weekday[];
  createdAt: string;
};

export type CheckIn = {
  habitId: string;
  date: string;
  value: number;
};

export type AppData = {
  version: 1;
  habits: Habit[];
  checkIns: CheckIn[];
};
