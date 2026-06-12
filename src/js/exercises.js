// Exercise library page entry point

import { loadHeader } from "./Header.mjs";
import { initExerciseSearch } from "./ExerciseSearch.mjs";
import { qs } from "./utils.mjs";

loadHeader();
initExerciseSearch(qs("main"));
