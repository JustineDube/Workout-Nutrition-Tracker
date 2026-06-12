// Workout History page entry point

import { loadHeader } from "./Header.mjs";
import { renderWorkoutHistory } from "./WorkoutLog.mjs";
import { qs } from "./utils.mjs";

loadHeader();
renderWorkoutHistory(qs("#workout-history"));
