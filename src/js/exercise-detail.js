// Exercise detail page entry point

import { loadHeader } from "./Header.mjs";
import { renderExerciseDetail } from "./ExerciseDetail.mjs";
import { qs } from "./utils.mjs";

loadHeader();
renderExerciseDetail(qs("#exercise-detail-container"));
