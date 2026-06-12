// Daily calorie goal form — persists the user's target to localStorage

import { qs, getLocalStorage, setLocalStorage, STORAGE_KEYS } from "./utils.mjs";

const DEFAULT_GOAL = 2000;

export function renderGoalForm(parentElement, onSave) {
  const goal = getLocalStorage(STORAGE_KEYS.calorieGoal, DEFAULT_GOAL);

  parentElement.innerHTML = `
    <form class="goal-form" id="goal-form">
      <div class="field">
        <label for="calorie-goal">Daily calorie goal</label>
        <input type="number" id="calorie-goal" name="calorie-goal" min="500" max="10000" step="50" value="${goal}" required />
      </div>
      <button type="submit" class="btn btn-primary">Save Goal</button>
    </form>
  `;

  const form = qs("#goal-form", parentElement);
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const value = Number(qs("#calorie-goal", form).value);
    if (!value || value <= 0) return;
    setLocalStorage(STORAGE_KEYS.calorieGoal, value);
    if (typeof onSave === "function") onSave(value);
  });
}
