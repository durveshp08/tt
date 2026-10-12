import test from "node:test";
import assert from "node:assert/strict";
import { DAYS, SLOTS, makeTimetable, validateSubjects } from "./scheduler.js";

test("creates the fixed weekly grid with break and recess", () => {
  const { table } = makeTimetable({});
  assert.equal(Object.keys(table).length, 5);
  assert.equal(table.Monday.length, SLOTS.length);
  assert.equal(table.Monday[2], "RECESS");
  assert.equal(table.Friday[5], "BREAK");
});

test("places each lab in a consecutive two-slot block", () => {
  const { table } = makeTimetable({ labSubjects: [{ name: "AIL", frequency: 2 }] });
  const cells = DAYS.flatMap((day) => table[day]);
  assert.equal(cells.filter((cell) => cell === "LAB-AIL [1/2]").length, 2);
  assert.equal(cells.filter((cell) => cell === "LAB-AIL [2/2]").length, 2);
});

test("places requested theory sessions when capacity exists", () => {
  const { table, warnings } = makeTimetable({ theorySubjects: [{ name: "AI", frequency: 3 }, { name: "ML", frequency: 3 }] });
  const cells = DAYS.flatMap((day) => table[day]);
  assert.equal(cells.filter((cell) => cell === "AI").length, 3);
  assert.equal(cells.filter((cell) => cell === "ML").length, 3);
  assert.equal(warnings.length, 0);
});

test("reports invalid subject input", () => {
  assert.equal(validateSubjects([{ name: "", frequency: 0 }], "Theory").length, 2);
});
