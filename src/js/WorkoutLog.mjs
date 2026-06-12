// Workout session logging: build a session from picked exercises, then save/retrieve/delete sessions

import {
  qs,
  getLocalStorage,
  setLocalStorage,
  STORAGE_KEYS,
  generateId,
  todayISO,
  formatDateTime,
  recordActivityToday,
} from "./utils.mjs";
import { updateStreakBadge } from "./Header.mjs";

function getDraft() {
  return getLocalStorage(STORAGE_KEYS.workoutDraft, []);
}

function setDraft(draft) {
  setLocalStorage(STORAGE_KEYS.workoutDraft, draft);
}

function exerciseTemplate(exercise, index) {
  const sets = exercise.sets || [];
  const setRows = sets
    .map(
      (set, setIndex) => `
        <div class="set-row" data-set-index="${setIndex}">
          <span class="set-label">Set ${setIndex + 1}</span>
          <input type="number" min="0" placeholder="Reps" value="${set.reps ?? ""}" data-field="reps" />
          <input type="number" min="0" step="0.5" placeholder="Weight (lbs)" value="${set.weight ?? ""}" data-field="weight" />
          <button type="button" class="btn btn-danger btn-sm remove-set-btn" aria-label="Remove set">&times;</button>
        </div>`
    )
    .join("");

  return `
    <div class="workout-exercise" data-exercise-index="${index}">
      <div class="workout-exercise-header">
        <h3>${exercise.name}</h3>
        <button type="button" class="btn btn-danger btn-sm remove-exercise-btn">Remove</button>
      </div>
      <div class="tags">
        <span class="badge">${exercise.bodyPart}</span>
        <span class="badge">${exercise.equipment}</span>
      </div>
      <div class="set-rows">${setRows}</div>
      <button type="button" class="btn btn-secondary btn-sm add-set-btn">+ Add Set</button>
    </div>
  `;
}

export function initWorkoutLogger(container) {
  const dateInput = qs("#workout-date", container);
  const durationInput = qs("#workout-duration", container);
  const exercisesContainer = qs("#workout-exercises", container);
  const form = qs("#workout-form", container);
  const customInput = qs("#custom-exercise-name", container);
  const addCustomBtn = qs("#add-custom-exercise-btn", container);
  const errorMessage = qs("#workout-error", container);
  const savedMessage = qs("#workout-saved-message", container);

  dateInput.value = todayISO();

  function renderExercises() {
    const draft = getDraft();
    if (!draft.length) {
      exercisesContainer.innerHTML =
        '<p class="empty-message">No exercises added yet. <a href="/exercises.html">Browse the exercise library</a> or add a custom exercise below.</p>';
      return;
    }
    exercisesContainer.innerHTML = draft.map(exerciseTemplate).join("");
  }

  function addCustomExercise() {
    const name = customInput.value.trim();
    if (!name) return;
    const draft = getDraft();
    draft.push({ id: generateId(), name, bodyPart: "custom", equipment: "—", sets: [{ reps: "", weight: "" }] });
    setDraft(draft);
    customInput.value = "";
    renderExercises();
  }

  renderExercises();

  exercisesContainer.addEventListener("click", (event) => {
    const exerciseEl = event.target.closest(".workout-exercise");
    if (!exerciseEl) return;

    const exerciseIndex = Number(exerciseEl.dataset.exerciseIndex);
    const draft = getDraft();

    if (event.target.classList.contains("remove-exercise-btn")) {
      draft.splice(exerciseIndex, 1);
      setDraft(draft);
      renderExercises();
      return;
    }

    if (event.target.classList.contains("add-set-btn")) {
      draft[exerciseIndex].sets = draft[exerciseIndex].sets || [];
      draft[exerciseIndex].sets.push({ reps: "", weight: "" });
      setDraft(draft);
      renderExercises();
      return;
    }

    if (event.target.classList.contains("remove-set-btn")) {
      const setRow = event.target.closest(".set-row");
      const setIndex = Number(setRow.dataset.setIndex);
      draft[exerciseIndex].sets.splice(setIndex, 1);
      setDraft(draft);
      renderExercises();
    }
  });

  exercisesContainer.addEventListener("input", (event) => {
    const exerciseEl = event.target.closest(".workout-exercise");
    const setRow = event.target.closest(".set-row");
    if (!exerciseEl || !setRow || !event.target.dataset.field) return;

    const exerciseIndex = Number(exerciseEl.dataset.exerciseIndex);
    const setIndex = Number(setRow.dataset.setIndex);
    const draft = getDraft();
    draft[exerciseIndex].sets[setIndex][event.target.dataset.field] = event.target.value;
    setDraft(draft);
  });

  addCustomBtn.addEventListener("click", addCustomExercise);
  customInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      addCustomExercise();
    }
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    errorMessage.hidden = true;
    savedMessage.hidden = true;

    const draft = getDraft();
    if (!draft.length) {
      errorMessage.hidden = false;
      return;
    }

    const session = {
      id: generateId(),
      date: dateInput.value || todayISO(),
      durationMinutes: Number(durationInput.value) || 0,
      exercises: draft.map((exercise) => ({
        ...exercise,
        sets: (exercise.sets || []).map((set) => ({
          reps: Number(set.reps) || 0,
          weight: Number(set.weight) || 0,
        })),
      })),
    };

    const workouts = getLocalStorage(STORAGE_KEYS.workouts, []);
    workouts.push(session);
    setLocalStorage(STORAGE_KEYS.workouts, workouts);

    setDraft([]);
    recordActivityToday();
    updateStreakBadge();

    renderExercises();
    durationInput.value = "";
    savedMessage.hidden = false;
  });
}

function historyItemTemplate(session) {
  const totalSets = session.exercises.reduce((sum, exercise) => sum + (exercise.sets?.length || 0), 0);

  const exerciseRows = session.exercises
    .map((exercise) => {
      const setsText = (exercise.sets || [])
        .map((set, i) => `Set ${i + 1}: ${set.reps} reps @ ${set.weight} lbs`)
        .join("<br>");
      return `
        <tr>
          <td>${exercise.name}</td>
          <td>${setsText || "—"}</td>
        </tr>`;
    })
    .join("");

  return `
    <div class="history-item" data-id="${session.id}">
      <button type="button" class="history-summary">
        <span>
          <strong>${formatDateTime(session.date)}</strong>
          &mdash; ${session.exercises.length} exercise${session.exercises.length === 1 ? "" : "s"},
          ${totalSets} set${totalSets === 1 ? "" : "s"}${session.durationMinutes ? `, ${session.durationMinutes} min` : ""}
        </span>
        <span class="chevron" aria-hidden="true">&#9662;</span>
      </button>
      <div class="history-details">
        <table>
          <thead><tr><th>Exercise</th><th>Sets</th></tr></thead>
          <tbody>${exerciseRows}</tbody>
        </table>
        <button type="button" class="btn btn-danger btn-sm mt-1 delete-workout-btn">Delete Workout</button>
      </div>
    </div>
  `;
}

export function renderWorkoutHistory(container) {
  function render() {
    const workouts = getLocalStorage(STORAGE_KEYS.workouts, []);
    const sorted = [...workouts].sort((a, b) => (a.date < b.date ? 1 : -1));

    if (!sorted.length) {
      container.innerHTML =
        '<p class="empty-message">No workouts logged yet. <a href="/workout.html">Log your first workout</a>.</p>';
      return;
    }

    container.innerHTML = sorted.map(historyItemTemplate).join("");
  }

  render();

  container.addEventListener("click", (event) => {
    const item = event.target.closest(".history-item");
    if (!item) return;

    if (event.target.classList.contains("delete-workout-btn")) {
      const remaining = getLocalStorage(STORAGE_KEYS.workouts, []).filter((w) => w.id !== item.dataset.id);
      setLocalStorage(STORAGE_KEYS.workouts, remaining);
      render();
      return;
    }

    if (event.target.closest(".history-summary")) {
      item.classList.toggle("open");
    }
  });
}
