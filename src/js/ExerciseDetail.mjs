// Exercise detail view: instructions, target muscles, equipment, GIF, and add-to-workout

import { qs, getLocalStorage, setLocalStorage, STORAGE_KEYS, renderError } from "./utils.mjs";
import { hasApiKey, getExerciseById } from "./exerciseApi.mjs";

export async function renderExerciseDetail(container) {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  if (!id) {
    renderError(container, "No exercise selected. Go back to the exercise library and pick one.");
    return;
  }

  if (!hasApiKey()) {
    renderError(
      container,
      "No ExerciseDB API key configured. Add VITE_RAPIDAPI_KEY to your .env file to view exercise details."
    );
    return;
  }

  container.innerHTML = '<p class="loading">Loading exercise…</p>';

  try {
    const exercise = await getExerciseById(id);

    container.innerHTML = `
      <div class="exercise-detail">
        <img src="${exercise.gifUrl}" alt="${exercise.name}" />
        <div>
          <h1>${exercise.name}</h1>
          <div class="tags">
            <span class="badge">Body Part: ${exercise.bodyPart}</span>
            <span class="badge">Target: ${exercise.target}</span>
            <span class="badge">Equipment: ${exercise.equipment}</span>
          </div>
          <h3>Instructions</h3>
          <ol>
            ${exercise.instructions.map((step) => `<li>${step}</li>`).join("")}
          </ol>
          <button class="btn btn-primary" id="add-to-workout-btn">Add to Workout</button>
          <p class="empty-message" id="add-confirmation" hidden>
            Added! Head to <a href="/workout.html">Log Workout</a> to record your sets.
          </p>
        </div>
      </div>
    `;

    qs("#add-to-workout-btn", container).addEventListener("click", () => {
      const draft = getLocalStorage(STORAGE_KEYS.workoutDraft, []);
      if (!draft.some((ex) => ex.id === exercise.id)) {
        draft.push({
          id: exercise.id,
          name: exercise.name,
          bodyPart: exercise.bodyPart,
          equipment: exercise.equipment,
          target: exercise.target,
          gifUrl: exercise.gifUrl,
        });
        setLocalStorage(STORAGE_KEYS.workoutDraft, draft);
      }
      qs("#add-confirmation", container).hidden = false;
    });
  } catch (err) {
    renderError(container, "Unable to load this exercise. Please try again later.");
  }
}
