import { addDays, eachDayOfInterval, endOfWeek, format, isAfter, isBefore, startOfWeek } from "date-fns";
import { CheckIn, Habit, Weekday } from "./types";
import { toLocalDateKey } from "./data";

export const weekdayNames = ["M", "T", "W", "T", "F", "S", "S"];

export function mondayIndex(date: Date): Weekday {
  return ((date.getDay() + 6) % 7) as Weekday;
}

export function weekDates(date: Date) {
  return eachDayOfInterval({
    start: startOfWeek(date, { weekStartsOn: 1 }),
    end: endOfWeek(date, { weekStartsOn: 1 }),
  });
}

export function isScheduled(habit: Habit, date: Date) {
  return habit.weekdays.includes(mondayIndex(date));
}

export function getValue(checkIns: CheckIn[], habitId: string, date: Date) {
  return checkIns.find((item) => item.habitId === habitId && item.date === toLocalDateKey(date))?.value ?? 0;
}

export function isComplete(habit: Habit, value: number) {
  return value >= habit.target;
}

export function formatOrdinalDate(date: Date) {
  const day = date.getDate();
  const suffix = day % 100 >= 11 && day % 100 <= 13 ? "th" : ({ 1: "st", 2: "nd", 3: "rd" } as Record<number, string>)[day % 10] ?? "th";
  return `${format(date, "MMMM")} ${day}${suffix}`;
}

export function streakFor(habit: Habit, checkIns: CheckIn[], selected: Date) {
  let cursor = new Date(selected);
  let streak = 0;
  for (let i = 0; i < 370; i += 1) {
    if (isBefore(cursor, new Date(habit.createdAt))) break;
    if (isScheduled(habit, cursor)) {
      if (!isComplete(habit, getValue(checkIns, habit.id, cursor))) break;
      streak += 1;
    }
    cursor = addDays(cursor, -1);
  }
  return streak;
}

export function showingUpDays(habits: Habit[], checkIns: CheckIn[]) {
  const ids = new Set(habits.map((habit) => habit.id));
  return new Set(checkIns.filter((item) => ids.has(item.habitId) && item.value > 0 && !isAfter(new Date(`${item.date}T23:59:59`), new Date())).map((item) => item.date)).size;
}
