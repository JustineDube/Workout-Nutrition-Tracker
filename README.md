# FitTrack — Workout & Nutrition Tracker

A multi-page Vite + vanilla JavaScript web app for logging workouts, tracking
daily nutrition, and building healthy habits. Built for WDD 330 (BYU-Idaho)
as the final project.

## Features

- **Dashboard** — daily calorie progress bar, macro breakdown donut chart,
  calorie goal setting, and a summary of today's activity (streak, calories,
  meals logged, last workout).
- **Exercise Library** — search and filter exercises by name, body part, or
  equipment using the [ExerciseDB API](https://rapidapi.com/justin-WFnsXH_t6/api/exercisedb).
- **Exercise Detail** — full instructions, target muscles, equipment, and an
  animated demo GIF, with a one-click "Add to Workout" action.
- **Workout Logger** — build a session from exercises you've picked (or add
  your own custom exercise), log sets/reps/weight, date, and duration.
- **Workout History** — expandable list of past sessions with full set
  details and the ability to delete a session.
- **Nutrition** — search foods via the [Nutritionix API](https://developer.nutritionix.com/),
  add adjustable portions to your food diary, and view daily totals.
- **Streak tracker** — a badge in the header counts consecutive days with a
  logged workout or meal.

## Tech stack

- [Vite](https://vitejs.dev/) (multi-page app, vanilla JS / ES modules)
- Plain HTML & CSS — no UI framework
- `localStorage` for persistence (no backend/database)
- ExerciseDB (RapidAPI) and Nutritionix REST APIs

## Getting started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure API keys

Copy `.env.example` to `.env` and fill in your own keys:

```bash
cp .env.example .env
```

| Variable | Where to get it |
| --- | --- |
| `VITE_RAPIDAPI_KEY` | Subscribe to [ExerciseDB on RapidAPI](https://rapidapi.com/justin-WFnsXH_t6/api/exercisedb) and copy your RapidAPI key |
| `VITE_NUTRITIONIX_APP_ID` | Create a free app at the [Nutritionix Developer Portal](https://developer.nutritionix.com/) |
| `VITE_NUTRITIONIX_APP_KEY` | Found alongside your Nutritionix App ID |

If a key is missing, the related page shows a friendly message instead of
making API calls — the rest of the app (dashboard, workout logging, history)
still works fully offline using `localStorage`.

### 3. Run the dev server

```bash
npm run dev
```

### Other scripts

```bash
npm run build    # production build to dist/
npm run preview  # preview the production build locally
```

## Project structure

```
index.html              Dashboard
exercises.html          Exercise library (search/filter)
exercise-detail.html    Single exercise detail + "Add to Workout"
workout.html            Workout logger
history.html            Workout history
nutrition.html          Food search + daily diary

src/
  styles/
    style.css           Global styles, color scheme, typography, components
  js/
    utils.mjs           Shared helpers (storage, dates, fetch, streak logic)
    Header.mjs          Dynamic header/nav + streak badge
    main.js             Dashboard entry point
    CalorieTracker.mjs  Animated calorie progress bar
    GoalSetting.mjs     Calorie goal form
    MacroChart.mjs      SVG macro breakdown donut chart
    exerciseApi.mjs     ExerciseDB fetch helpers
    ExerciseSearch.mjs  Exercise search/filter + pagination
    ExerciseDetail.mjs  Exercise detail view
    WorkoutLog.mjs      Workout builder, save/retrieve/delete sessions
    nutritionApi.mjs    Nutritionix fetch helpers
    NutritionSearch.mjs Food search with adjustable portions
    MealLog.mjs         Food diary (add/retrieve/delete meals)
```

## Data model (localStorage)

| Key | Shape | Description |
| --- | --- | --- |
| `ft-workouts` | `Array<{ id, date, durationMinutes, exercises: [{ id, name, bodyPart, equipment, target, sets: [{ reps, weight }] }] }>` | Logged workout sessions |
| `ft-meals` | `Array<{ id, date, foodName, servingQty, servingUnit, calories, protein, carbs, fat }>` | Logged food entries |
| `ft-calorie-goal` | `number` | Daily calorie target |
| `ft-streak` | `number` | Current consecutive-day streak |
| `ft-last-log-date` | `string (YYYY-MM-DD)` | Last date a workout or meal was logged, used to calculate the streak |
| `ft-workout-draft` | `Array<{ id, name, bodyPart, equipment, target, gifUrl, sets }>` | Exercises picked from the library, pending save on the Log Workout page |

## Color & type system

| Role | Color |
| --- | --- |
| Primary (Deep Navy) | `#1a2b4a` |
| Accent (Electric Green) | `#39d353` |
| Background (Off White) | `#f5f7fa` |
| Surface (White) | `#ffffff` |
| Text (Dark Grey) | `#2d2d2d` |
| Alert (Coral) | `#e05c4b` |

- Headings: **Bebas Neue**
- Body text: **Inter**
