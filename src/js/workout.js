// Log Workout page entry point

import { loadHeader } from "./Header.mjs";
import { initWorkoutLogger } from "./WorkoutLog.mjs";
import { qs } from "./utils.mjs";

loadHeader();
initWorkoutLogger(qs("main"));
