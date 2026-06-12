// Animated calorie progress bar comparing today's logged calories to the daily goal

import { qs, getLocalStorage, STORAGE_KEYS, getMealsForDate, sumNutrition, todayISO } from "./utils.mjs";

const DEFAULT_GOAL = 2000;

export function renderCalorieTracker(parentElement) {
  const goal = getLocalStorage(STORAGE_KEYS.calorieGoal, DEFAULT_GOAL);
  const totals = sumNutrition(getMealsForDate(todayISO()));
  const consumed = Math.round(totals.calories);
  const remaining = goal - consumed;
  const percent = goal > 0 ? Math.min(100, Math.round((consumed / goal) * 100)) : 0;
  const isOver = consumed > goal;

  parentElement.innerHTML = `
    <div class="calorie-progress">
      <div class="progress-track">
        <div class="progress-fill${isOver ? " over" : ""}" style="width: 0%"></div>
      </div>
      <div class="progress-meta">
        <span>${consumed} / ${goal} kcal</span>
        <span>${isOver ? `${Math.abs(remaining)} kcal over goal` : `${remaining} kcal remaining`}</span>
      </div>
    </div>
  `;

  // Animate on next frame so the width transition in CSS actually runs
  requestAnimationFrame(() => {
    const fill = qs(".progress-fill", parentElement);
    if (fill) fill.style.width = `${percent}%`;
  });

  return { consumed, goal, remaining, percent, totals };
}
