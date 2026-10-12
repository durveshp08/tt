import { DAYS, SLOTS, makeTimetable, timetableAsText, validateSubjects } from "./scheduler.js";

const STORAGE_KEY = "faculty-timetable-helper-v1";
const elements = {
  theoryList: document.querySelector("#theory-list"),
  labList: document.querySelector("#lab-list"),
  rowTemplate: document.querySelector("#subject-row-template"),
  result: document.querySelector("#result-section"),
  warnings: document.querySelector("#warnings"),
  table: document.querySelector("#timetable-table"),
  summary: document.querySelector("#result-summary")
};

let version = 0;
let latestResult = null;

function addSubject(type, subject = { name: "", frequency: 1 }) {
  const row = elements.rowTemplate.content.firstElementChild.cloneNode(true);
  row.dataset.type = type;
  row.querySelector(".subject-name").value = subject.name;
  row.querySelector(".subject-frequency").value = subject.frequency;
  row.querySelector(".remove-button").addEventListener("click", () => {
    row.remove();
    saveForm();
  });
  row.querySelectorAll("input").forEach((input) => input.addEventListener("input", saveForm));
  (type === "theory" ? elements.theoryList : elements.labList).append(row);
}

function readSubjects(type) {
  const list = type === "theory" ? elements.theoryList : elements.labList;
  return [...list.querySelectorAll(".subject-row")].map((row) => ({
    name: row.querySelector(".subject-name").value.trim(),
    frequency: Number(row.querySelector(".subject-frequency").value)
  }));
}

function formData() {
  return { theorySubjects: readSubjects("theory"), labSubjects: readSubjects("lab") };
}

function saveForm() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(formData()));
}

function restoreForm() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (saved && Array.isArray(saved.theorySubjects) && Array.isArray(saved.labSubjects)) {
      saved.theorySubjects.forEach((subject) => addSubject("theory", subject));
      saved.labSubjects.forEach((subject) => addSubject("lab", subject));
      return;
    }
  } catch { /* A damaged saved form simply starts fresh. */ }
  addSubject("theory");
  addSubject("lab");
}

function showMessages(messages, error = false) {
  elements.warnings.replaceChildren();
  messages.forEach((message) => {
    const note = document.createElement("p");
    note.className = `notice${error ? " error" : ""}`;
    note.textContent = message;
    elements.warnings.append(note);
  });
}

function cellClass(value) {
  if (value.startsWith("LAB-")) return "lab";
  if (value === "BREAK" || value === "RECESS") return "pause";
  if (value === "FREE") return "free";
  return "theory";
}

function displayTable(table) {
  const head = document.createElement("thead");
  const headRow = document.createElement("tr");
  ["Time / type", ...DAYS].forEach((label) => {
    const cell = document.createElement("th");
    cell.scope = "col";
    cell.textContent = label;
    headRow.append(cell);
  });
  head.append(headRow);

  const body = document.createElement("tbody");
  SLOTS.forEach((slot, index) => {
    const row = document.createElement("tr");
    const time = document.createElement("th");
    time.scope = "row";
    time.textContent = `${slot.time} · ${slot.label}`;
    row.append(time);
    DAYS.forEach((day) => {
      const cell = document.createElement("td");
      cell.className = cellClass(table[day][index]);
      cell.textContent = table[day][index];
      row.append(cell);
    });
    body.append(row);
  });
  elements.table.replaceChildren(head, body);
}

function generate(isRefresh = false) {
  const data = formData();
  const errors = [...validateSubjects(data.theorySubjects, "Theory"), ...validateSubjects(data.labSubjects, "Lab")];
  elements.result.hidden = false;
  if (errors.length) {
    latestResult = null;
    elements.table.replaceChildren();
    elements.summary.textContent = "Please correct the subject details below.";
    showMessages(errors, true);
    elements.result.scrollIntoView({ behavior: "smooth", block: "start" });
    return;
  }
  if (!isRefresh) version = 0;
  latestResult = makeTimetable({ ...data, version });
  displayTable(latestResult.table);
  const theoryText = `${latestResult.placedTheory} of ${latestResult.requestedTheory} theory session(s)`;
  elements.summary.textContent = `${theoryText} and ${latestResult.requestedLabs} lab session(s) requested. Arrangement ${version + 1}.`;
  showMessages(latestResult.warnings);
  saveForm();
  elements.result.scrollIntoView({ behavior: "smooth", block: "start" });
}

document.querySelector("#add-theory").addEventListener("click", () => addSubject("theory"));
document.querySelector("#add-lab").addEventListener("click", () => addSubject("lab"));
document.querySelector("#generate").addEventListener("click", () => generate());
document.querySelector("#refresh").addEventListener("click", () => {
  if (latestResult) { version += 1; generate(true); }
});
document.querySelector("#load-example").addEventListener("click", () => {
  elements.theoryList.replaceChildren();
  elements.labList.replaceChildren();
  [{ name: "AI", frequency: 3 }, { name: "Machine Learning", frequency: 3 }, { name: "DBMS", frequency: 2 }].forEach((subject) => addSubject("theory", subject));
  [{ name: "AIL", frequency: 2 }, { name: "DBMS", frequency: 1 }].forEach((subject) => addSubject("lab", subject));
  saveForm();
});
document.querySelector("#copy").addEventListener("click", async (event) => {
  if (!latestResult) return;
  const button = event.currentTarget;
  try {
    await navigator.clipboard.writeText(timetableAsText(latestResult.table));
    button.textContent = "Copied";
    setTimeout(() => { button.textContent = "Copy timetable"; }, 1800);
  } catch {
    showMessages(["Copy is not available in this browser. Use Save / print instead."], false);
  }
});
document.querySelector("#print").addEventListener("click", () => window.print());

restoreForm();
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => navigator.serviceWorker.register("./sw.js"));
}
