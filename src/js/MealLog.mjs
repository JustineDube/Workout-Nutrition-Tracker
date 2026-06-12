// Food diary: add/retrieve/delete logged meals for a given date

import { getLocalStorage, setLocalStorage, STORAGE_KEYS, getMealsForDate, sumNutrition, todayISO, formatDate } from "./utils.mjs";

function diaryRowTemplate(meal) {
  return `
    <tr data-id="${meal.id}">
      <td>${meal.foodName}</td>
      <td>${meal.servingQty ?? ""} ${meal.servingUnit ?? ""}</td>
      <td>${Math.round(meal.calories)}</td>
      <td>${Math.round(meal.protein)}g</td>
      <td>${Math.round(meal.carbs)}g</td>
      <td>${Math.round(meal.fat)}g</td>
      <td><button type="button" class="btn btn-danger btn-sm delete-meal-btn" aria-label="Delete meal">&times;</button></td>
    </tr>
  `;
}

export function initFoodDiary(container) {
  let currentDate = todayISO();

  function render() {
    const meals = getMealsForDate(currentDate);

    if (!meals.length) {
      container.innerHTML = `<p class="empty-message">No meals logged for ${formatDate(currentDate)} yet.</p>`;
      return;
    }

    const totals = sumNutrition(meals);

    container.innerHTML = `
      <table class="diary-table">
        <thead>
          <tr><th>Food</th><th>Serving</th><th>Cal</th><th>Protein</th><th>Carbs</th><th>Fat</th><th></th></tr>
        </thead>
        <tbody>${meals.map(diaryRowTemplate).join("")}</tbody>
        <tfoot>
          <tr>
            <td colspan="2">Total</td>
            <td>${Math.round(totals.calories)}</td>
            <td>${Math.round(totals.protein)}g</td>
            <td>${Math.round(totals.carbs)}g</td>
            <td>${Math.round(totals.fat)}g</td>
            <td></td>
          </tr>
        </tfoot>
      </table>
    `;
  }

  render();

  container.addEventListener("click", (event) => {
    if (!event.target.classList.contains("delete-meal-btn")) return;
    const id = event.target.closest("tr").dataset.id;
    const meals = getLocalStorage(STORAGE_KEYS.meals, []).filter((meal) => meal.id !== id);
    setLocalStorage(STORAGE_KEYS.meals, meals);
    render();
  });

  return {
    setDate(dateISO) {
      currentDate = dateISO;
      render();
    },
    refresh: render,
  };
}
