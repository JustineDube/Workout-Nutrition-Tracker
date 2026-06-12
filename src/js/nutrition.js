// Nutrition page entry point

import { loadHeader } from "./Header.mjs";
import { initNutritionSearch } from "./NutritionSearch.mjs";
import { initFoodDiary } from "./MealLog.mjs";
import { qs, todayISO } from "./utils.mjs";

loadHeader();

const dateInput = qs("#diary-date");
dateInput.value = todayISO();

const diary = initFoodDiary(qs("#food-diary"));

dateInput.addEventListener("change", () => {
  diary.setDate(dateInput.value || todayISO());
});

initNutritionSearch(qs("main"), () => {
  dateInput.value = todayISO();
  diary.setDate(todayISO());
});
