/**
 * Transparent rule-based timetable engine.
 *
 * This JavaScript module implements the same scheduling rules as the supplied
 * Python console program. The original tt_schedule.py remains untouched.
 */
export const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

export const SLOTS = [
  { time: "9:00–10:00", kind: "L", label: "Lecture" },
  { time: "10:00–11:00", kind: "L", label: "Lecture" },
  { time: "11:00–11:40", kind: "R", label: "Recess" },
  { time: "11:40–12:40", kind: "L", label: "Lecture" },
  { time: "12:40–1:40", kind: "L", label: "Lecture" },
  { time: "1:40–2:00", kind: "B", label: "Break" },
  { time: "2:00–3:00", kind: "L", label: "Lecture" },
  { time: "3:00–4:00", kind: "L", label: "Lecture" }
];

function rotate(items, step) {
  if (items.length === 0) return [];
  const offset = ((step % items.length) + items.length) % items.length;
  return [...items.slice(offset), ...items.slice(0, offset)];
}

function expandedSubjects(subjects, prefix = "") {
  return subjects.flatMap(({ name, frequency }) =>
    Array.from({ length: frequency }, () => `${prefix}${name.trim().toUpperCase()}`)
  );
}

export function validateSubjects(subjects, type) {
  const errors = [];
  subjects.forEach((subject, index) => {
    const number = index + 1;
    if (!subject.name || !subject.name.trim()) errors.push(`${type} subject ${number} needs a name.`);
    if (!Number.isInteger(subject.frequency) || subject.frequency < 1) {
      errors.push(`${type} subject ${number} needs a whole number of sessions greater than 0.`);
    }
  });
  return errors;
}

/** Returns the generated timetable and a capacity warning, if needed. */
export function makeTimetable({ theorySubjects = [], labSubjects = [], version = 0 }) {
  const theory = expandedSubjects(theorySubjects);
  const labs = expandedSubjects(labSubjects, "LAB-");
  const table = Object.fromEntries(
    DAYS.map((day) => [
      day,
      SLOTS.map((slot) => (slot.kind === "L" ? "FREE" : slot.kind === "B" ? "BREAK" : "RECESS"))
    ])
  );

  let pairs = [];
  [0, 3, 6].forEach((slot) => DAYS.forEach((_, day) => pairs.push([day, slot])));
  pairs = rotate(pairs, version * 2);

  rotate(labs, version)
    .slice(0, pairs.length)
    .forEach((lab, index) => {
      const [dayIndex, slotIndex] = pairs[index];
      table[DAYS[dayIndex]][slotIndex] = `${lab} [1/2]`;
      table[DAYS[dayIndex]][slotIndex + 1] = `${lab} [2/2]`;
    });

  const remainingTheory = rotate(theory, version);
  DAYS.forEach((day) => {
    const usedToday = [];
    SLOTS.forEach((slot, index) => {
      if (slot.kind !== "L" || table[day][index] !== "FREE" || remainingTheory.length === 0) return;
      const alternative = remainingTheory.findIndex((subject) => !usedToday.includes(subject));
      const subjectIndex = alternative === -1 ? 0 : alternative;
      const [subject] = remainingTheory.splice(subjectIndex, 1);
      table[day][index] = subject;
      usedToday.push(subject);
    });
  });

  const warnings = [];
  if (labs.length > 15 || theory.length + 2 * labs.length > 30) {
    warnings.push("The requested load is greater than this timetable can hold. Some requested sessions may not appear.");
  }
  if (remainingTheory.length > 0) {
    warnings.push(`${remainingTheory.length} theory session(s) could not be placed.`);
  }
  if (labs.length > 15) {
    warnings.push(`${labs.length - 15} lab session(s) could not be placed.`);
  }

  return { table, warnings, placedTheory: theory.length - remainingTheory.length, requestedTheory: theory.length, requestedLabs: labs.length };
}

export function timetableAsText(table, title = "WEEKLY TIMETABLE") {
  const lines = [title, ""];
  SLOTS.forEach((slot, index) => {
    lines.push(`${slot.time} (${slot.label}): ${DAYS.map((day) => `${day} – ${table[day][index]}`).join(" | ")}`);
  });
  return lines.join("\n");
}
