// Shared helpers: localStorage get/set, fetch wrapper, date formatting, streak tracking

export const STORAGE_KEYS = {
  workouts: "ft-workouts",
  meals: "ft-meals",
  calorieGoal: "ft-calorie-goal",
  streak: "ft-streak",
  lastLogDate: "ft-last-log-date",
  workoutDraft: "ft-workout-draft",
};

export function qs(selector, parent = document) {
  return parent.querySelector(selector);
}

export function qsa(selector, parent = document) {
  return [...parent.querySelectorAll(selector)];
}

export function getLocalStorage(key, fallback = null) {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : fallback;
}

export function setLocalStorage(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

export function generateId() {
  return `${Date.now()}-${Math.floor(Math.random() * 100000)}`;
}

// Date helpers
export function todayISO() {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  return new Date(now.getTime() - offset * 60000).toISOString().slice(0, 10);
}

export function formatDate(isoDate, options) {
  const date = new Date(`${isoDate}T00:00:00`);
  return date.toLocaleDateString(
    "en-US",
    options ?? { year: "numeric", month: "short", day: "numeric" }
  );
}

export function formatDateTime(isoDate) {
  return formatDate(isoDate, {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

// Fetch wrapper with consistent error handling
export async function fetchJSON(url, options = {}) {
  const response = await fetch(url, options);
  if (!response.ok) {
    const err = new Error(`Request failed: ${response.status} ${response.statusText}`);
    err.status = response.status;
    throw err;
  }
  return response.json();
}

// Render an array of items into a parent element using a template function
export function renderListWithTemplate(templateFn, parentElement, list, position = "afterbegin", clear = true) {
  if (clear) parentElement.innerHTML = "";
  const htmlStrings = list.map(templateFn);
  parentElement.insertAdjacentHTML(position, htmlStrings.join(""));
}

// Display a friendly error message inside a container
export function renderError(parentElement, message = "Something went wrong. Please try again.") {
  parentElement.innerHTML = `<p class="error-message">${message}</p>`;
}

export function debounce(fn, delay = 350) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

// Streak tracking — call recordActivityToday() any time a workout or meal is logged
export function recordActivityToday() {
  const today = todayISO();
  const lastDate = getLocalStorage(STORAGE_KEYS.lastLogDate, null);

  if (lastDate === today) {
    return getLocalStorage(STORAGE_KEYS.streak, 1);
  }

  let streak = getLocalStorage(STORAGE_KEYS.streak, 0);
  if (lastDate) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayISO = yesterday.toISOString().slice(0, 10);
    streak = lastDate === yesterdayISO ? streak + 1 : 1;
  } else {
    streak = 1;
  }

  setLocalStorage(STORAGE_KEYS.streak, streak);
  setLocalStorage(STORAGE_KEYS.lastLogDate, today);
  return streak;
}

// Read-only streak value for display — returns 0 if the streak has lapsed
export function getCurrentStreak() {
  const lastDate = getLocalStorage(STORAGE_KEYS.lastLogDate, null);
  if (!lastDate) return 0;

  const today = todayISO();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayISO = yesterday.toISOString().slice(0, 10);

  if (lastDate !== today && lastDate !== yesterdayISO) return 0;
  return getLocalStorage(STORAGE_KEYS.streak, 0);
}

// Meal/nutrition helpers shared by the dashboard and nutrition page
export function getMealsForDate(dateISO) {
  const meals = getLocalStorage(STORAGE_KEYS.meals, []);
  return meals.filter((meal) => meal.date === dateISO);
}

export function sumNutrition(meals) {
  return meals.reduce(
    (totals, meal) => {
      totals.calories += meal.calories || 0;
      totals.protein += meal.protein || 0;
      totals.carbs += meal.carbs || 0;
      totals.fat += meal.fat || 0;
      return totals;
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );
}

// Workout helpers shared by the dashboard and history page
export function getLastWorkout() {
  const workouts = getLocalStorage(STORAGE_KEYS.workouts, []);
  if (!workouts.length) return null;
  return [...workouts].sort((a, b) => (a.date < b.date ? 1 : -1))[0];
}
