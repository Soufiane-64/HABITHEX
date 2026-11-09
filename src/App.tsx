import { useEffect, useRef, useState } from "react";
import { addDays, format, isAfter, isSameDay, isToday } from "date-fns";
import { BedDouble, BookOpen, Check, ChevronLeft, ChevronRight, Dumbbell, Footprints, GraduationCap, Pencil, Plus, Trash2, Waves, X } from "lucide-react";
import { readAppData, saveAppData, toLocalDateKey } from "./data";
import { AppData, Habit, HabitIcon, Weekday } from "./types";
import { formatOrdinalDate, getValue, isComplete, isScheduled, mondayIndex, showingUpDays, streakFor, weekDates, weekdayNames } from "./utils";

const iconMap = { book: BookOpen, gym: Dumbbell, sleep: BedDouble, water: Waves, walk: Footprints, study: GraduationCap } as const;
const iconOptions: { value: HabitIcon; label: string }[] = [
  { value: "book", label: "Book" }, { value: "gym", label: "Gym" }, { value: "sleep", label: "Sleep" },
  { value: "water", label: "Water" }, { value: "walk", label: "Walk" }, { value: "study", label: "Study" },
];

type Modal = { type: "habit"; habit?: Habit } | { type: "numeric"; habit: Habit } | null;
type Toast = { message: string; undo?: () => void } | null;

function App() {
  const [data, setData] = useState<AppData>(() => readAppData());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [modal, setModal] = useState<Modal>(null);
  const [toast, setToast] = useState<Toast>(null);
  const toastTimer = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (!modal) return;
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape") setModal(null); };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [modal]);

  const updateData = (next: AppData) => { setData(next); saveAppData(next); };
  const selectedKey = toLocalDateKey(selectedDate);
  const scheduled = data.habits.filter((habit) => isScheduled(habit, selectedDate));
  const completed = scheduled.filter((habit) => isComplete(habit, getValue(data.checkIns, habit.id, selectedDate)));
  const percentage = scheduled.length ? Math.round((completed.length / scheduled.length) * 100) : 0;
  function announce(message: string, undo?: () => void) {
    window.clearTimeout(toastTimer.current);
    setToast({ message, undo });
    toastTimer.current = window.setTimeout(() => setToast(null), 4200);
  }

  function setCheckIn(habit: Habit, value: number) {
    const previous = data.checkIns.find((item) => item.habitId === habit.id && item.date === selectedKey);
    const checkIns = data.checkIns.filter((item) => !(item.habitId === habit.id && item.date === selectedKey));
    if (value > 0) checkIns.push({ habitId: habit.id, date: selectedKey, value });
    updateData({ ...data, checkIns });
    announce(`${habit.name} ${value > 0 ? "marked complete" : "marked incomplete"}`, () => {
      const restored = data.checkIns.filter((item) => !(item.habitId === habit.id && item.date === selectedKey));
      if (previous) restored.push(previous);
      updateData({ ...data, checkIns: restored });
      setToast(null);
    });
  }

  function deleteHabit(habit: Habit) {
    if (!window.confirm(`Delete ${habit.name}? Its history will also be removed.`)) return;
    updateData({ ...data, habits: data.habits.filter((item) => item.id !== habit.id), checkIns: data.checkIns.filter((item) => item.habitId !== habit.id) });
  }

  return (
    <main className="app-shell">
      <section className="dashboard">
        <header>
          <div className="topline">
            <div className="brand"><span className="brand-mark" aria-hidden="true" />HabitHex</div>
            <div className="top-actions">
              <span className="mends">showing up · {showingUpDays(data.habits, data.checkIns)}</span>
              <button className="edit-button" aria-label="Add a new habit" onClick={() => setModal({ type: "habit" })}>Edit</button>
              <button className="icon-button add-button" aria-label="Add habit" onClick={() => setModal({ type: "habit" })}><Plus size={22} /></button>
            </div>
          </div>
          <div className="date-nav">
            <button aria-label="Previous day" onClick={() => setSelectedDate((date) => addDays(date, -1))}><ChevronLeft size={20} /></button>
            <span className="nav-center">{format(selectedDate, "EEEE").toUpperCase()} · <span>{showingUpDays(data.habits, data.checkIns)} days</span></span>
            <button aria-label="Next day" disabled={isToday(selectedDate)} onClick={() => setSelectedDate((date) => addDays(date, 1))}><ChevronRight size={20} /></button>
          </div>
          {!isToday(selectedDate) && <button className="today-button" onClick={() => setSelectedDate(new Date())}>Back to today</button>}
          <h1 className="date-heading">{formatOrdinalDate(selectedDate)}</h1>
          <p className="status">{scheduled.length === 0 ? "rest day" : percentage === 100 ? "all kept" : `${completed.length} of ${scheduled.length} kept`}</p>
          <div className="progress-row">
            <div className="progress-track" aria-label={`${percentage}% complete`}><div className="progress-fill" style={{ width: `${percentage}%` }} /></div>
            <span className="progress-number">{percentage}%</span>
          </div>
        </header>

        {data.habits.length === 0 ? (
          <div className="empty"><h2>A clean slate.</h2><p>Add your first habit and start showing up.</p><button className="primary" onClick={() => setModal({ type: "habit" })}>Add a habit</button></div>
        ) : (
          <div className="habit-list">
            {data.habits.map((habit) => (
              <HabitCard key={habit.id} habit={habit} selectedDate={selectedDate} checkIns={data.checkIns}
                onToggle={() => habit.trackingType === "numeric" ? setModal({ type: "numeric", habit }) : setCheckIn(habit, getValue(data.checkIns, habit.id, selectedDate) ? 0 : 1)}
                onEdit={() => setModal({ type: "habit", habit })} onDelete={() => deleteHabit(habit)} />
            ))}
          </div>
        )}
      </section>
      {modal?.type === "habit" && <HabitForm habit={modal.habit} onClose={() => setModal(null)} onSave={(habit) => {
        const habits = modal.habit ? data.habits.map((item) => item.id === habit.id ? habit : item) : [...data.habits, habit];
        updateData({ ...data, habits }); setModal(null); announce(modal.habit ? `${habit.name} updated` : `${habit.name} added`);
      }} />}
      {modal?.type === "numeric" && <NumericForm habit={modal.habit} currentValue={getValue(data.checkIns, modal.habit.id, selectedDate)} onClose={() => setModal(null)} onSave={(value) => { setCheckIn(modal.habit, value); setModal(null); }} />}
      <footer className="app-footer">{isToday(selectedDate) ? "Today" : "Looking back"} · your progress stays on this device</footer>
      {toast && <div className="toast" role="status" aria-live="polite"><span>{toast.message}</span>{toast.undo && <button onClick={toast.undo}>Undo</button>}</div>}
    </main>
  );
}

function HabitCard({ habit, selectedDate, checkIns, onToggle, onEdit, onDelete }: { habit: Habit; selectedDate: Date; checkIns: AppData["checkIns"]; onToggle: () => void; onEdit: () => void; onDelete: () => void }) {
  const Icon = iconMap[habit.icon];
  const value = getValue(checkIns, habit.id, selectedDate);
  const complete = isComplete(habit, value);
  const days = weekDates(selectedDate);
  const streak = streakFor(habit, checkIns, selectedDate);
  return <article className="habit-card">
    <div className="card-top">
      <div className="habit-icon"><Icon size={22} strokeWidth={1.6} /></div>
      <div className="habit-copy"><h2>{habit.name}</h2><p>{habit.target} {habit.unit} · {habit.trackingType === "numeric" ? "daily target" : "session"}</p></div>
      <button className={`check-button ${complete ? "complete" : ""}`} aria-label={`${complete ? "Uncomplete" : "Complete"} ${habit.name}`} aria-pressed={complete} onClick={onToggle}>{complete && <Check size={23} strokeWidth={2.5} />}</button>
    </div>
    <div className="week-strip" aria-label={`${habit.name} weekly history`}>
      {days.map((day) => {
        const dayValue = getValue(checkIns, habit.id, day);
        const done = isScheduled(habit, day) && isComplete(habit, dayValue);
        const future = isAfter(day, new Date()) && !isSameDay(day, new Date());
        return <div className="week-day" key={day.toISOString()} title={`${format(day, "EEEE")}: ${done ? "complete" : isScheduled(habit, day) ? "not complete" : "rest day"}`}><span className={`hex ${done ? "done" : ""} ${isSameDay(day, selectedDate) ? "selected" : ""} ${future ? "future" : ""}`} /><span>{weekdayNames[mondayIndex(day)].toLowerCase()}</span></div>;
      })}
    </div>
    <div className="card-footer">
      <span className="tally" aria-hidden="true">╱╱╱</span>
      <span className="streak"><strong>{streak}</strong><span>day{streak === 1 ? "" : "s"} streak</span></span>
      <div className="card-actions"><button aria-label={`Edit ${habit.name}`} onClick={onEdit}><Pencil size={15} /></button><button className="danger" aria-label={`Delete ${habit.name}`} onClick={onDelete}><Trash2 size={15} /></button></div>
    </div>
  </article>;
}

function HabitForm({ habit, onClose, onSave }: { habit?: Habit; onClose: () => void; onSave: (habit: Habit) => void }) {
  const [name, setName] = useState(habit?.name ?? "");
  const [target, setTarget] = useState(String(habit?.target ?? 1));
  const [unit, setUnit] = useState(habit?.unit ?? "times");
  const [icon, setIcon] = useState<HabitIcon>(habit?.icon ?? "book");
  const [trackingType, setTrackingType] = useState(habit?.trackingType ?? "boolean");
  const [weekdays, setWeekdays] = useState<Weekday[]>(habit?.weekdays ?? [0, 1, 2, 3, 4, 5, 6]);
  const toggleDay = (day: Weekday) => setWeekdays((days) => days.includes(day) ? days.filter((item) => item !== day) : [...days, day].sort());
  return <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.currentTarget === event.target) onClose(); }}><div className="modal" role="dialog" aria-modal="true" aria-labelledby="habit-form-title" onMouseDown={(event) => event.stopPropagation()}><div className="modal-title-row"><h2 id="habit-form-title">{habit ? "Edit habit" : "New habit"}</h2><button className="close-button" aria-label="Close" onClick={onClose}><X size={20} /></button></div>
    <form className="form-grid" onSubmit={(event) => { event.preventDefault(); if (!name.trim() || !weekdays.length || Number(target) <= 0) return; onSave({ id: habit?.id ?? crypto.randomUUID(), name: name.trim(), icon, trackingType, target: Number(target), unit: unit.trim() || "times", weekdays, createdAt: habit?.createdAt ?? toLocalDateKey(new Date()) }); }}>
      <label className="field">Name<input required value={name} onChange={(event) => setName(event.target.value)} placeholder="Meditate" /></label>
      <div className="form-row"><label className="field">Target<input required min="1" type="number" value={target} onChange={(event) => setTarget(event.target.value)} /></label><label className="field">Unit<input required value={unit} onChange={(event) => setUnit(event.target.value)} placeholder="minutes" /></label></div>
      <div className="form-row"><label className="field">Icon<select value={icon} onChange={(event) => setIcon(event.target.value as HabitIcon)}>{iconOptions.map((option) => <option value={option.value} key={option.value}>{option.label}</option>)}</select></label><label className="field">Tracking<select value={trackingType} onChange={(event) => setTrackingType(event.target.value as "boolean" | "numeric")}><option value="boolean">Complete / incomplete</option><option value="numeric">Enter an amount</option></select></label></div>
      <div className="field">Schedule<div className="weekday-picker">{weekdayNames.map((day, index) => <label key={`${day}-${index}`}><input type="checkbox" checked={weekdays.includes(index as Weekday)} onChange={() => toggleDay(index as Weekday)} />{day}</label>)}</div></div>
      <div className="modal-actions"><button type="button" className="secondary" onClick={onClose}>Cancel</button><button className="primary" type="submit">{habit ? "Save changes" : "Add habit"}</button></div>
    </form>
  </div></div>;
}

function NumericForm({ habit, currentValue, onClose, onSave }: { habit: Habit; currentValue: number; onClose: () => void; onSave: (value: number) => void }) {
  const [value, setValue] = useState(String(currentValue || habit.target));
  return <div className="modal-backdrop" onMouseDown={(event) => { if (event.currentTarget === event.target) onClose(); }}><div className="modal" role="dialog" aria-modal="true" aria-labelledby="numeric-form-title" onMouseDown={(event) => event.stopPropagation()}><div className="modal-title-row"><h2 id="numeric-form-title">{habit.name}</h2><button className="close-button" aria-label="Close" onClick={onClose}><X size={20} /></button></div><p className="modal-description">How much did you do today?</p><form onSubmit={(event) => { event.preventDefault(); onSave(Math.max(0, Number(value))); }}><label className="field"><span>Amount ({habit.unit})</span><input autoFocus min="0" step="any" type="number" value={value} onChange={(event) => setValue(event.target.value)} /></label><div className="modal-actions"><button type="button" className="secondary" onClick={() => onSave(0)}>Clear</button><button className="primary" type="submit">Save check-in</button></div></form></div></div>;
}

export default App;
