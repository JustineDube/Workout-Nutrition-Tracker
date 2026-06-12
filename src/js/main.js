// Dashboard page entry point

import { loadHeader } from "./Header.mjs";
import { renderCalorieTracker } from "./CalorieTracker.mjs";
import { renderGoalForm } from "./GoalSetting.mjs";
import { renderMacroChart } from "./MacroChart.mjs";
import { qs, getCurrentStreak, getLastWorkout, getMealsForDate, todayISO, formatDate } from "./utils.mjs";

loadHeader();

function renderSummary(calorieResult) {
  const lastWorkout = getLastWorkout();
  const todaysMeals = getMealsForDate(todayISO());

  qs("#stat-streak").textContent = getCurrentStreak();
  qs("#stat-calories").textContent = calorieResult.consumed;
  qs("#stat-meals").textContent = todaysMeals.length;
  qs("#stat-last-workout").textContent = lastWorkout ? formatDate(lastWorkout.date) : "—";
}

function refreshDashboard() {
  const calorieResult = renderCalorieTracker(qs("#calorie-tracker"));
  renderMacroChart(qs("#macro-chart"));
  renderSummary(calorieResult);
}

renderGoalForm(qs("#goal-form-container"), refreshDashboard);
refreshDashboard();
