// Nutritionix food search with adjustable portions, adding results to the meal log

import { qs, renderError, debounce, getLocalStorage, setLocalStorage, STORAGE_KEYS, generateId, todayISO, recordActivityToday } from "./utils.mjs";
import { hasApiKeys, searchFoods, getNutrients } from "./nutritionApi.mjs";
import { updateStreakBadge } from "./Header.mjs";

function foodResultTemplate(food, index) {
  const photo = food.photo?.thumb;
  return `
    <div class="food-result" data-index="${index}">
      ${photo ? `<img class="food-thumb" src="${photo}" alt="${food.food_name}" />` : ""}
      <div class="food-info">
        <h3>${food.food_name}</h3>
        <p class="food-macros">Tap Add to look up full nutrition info</p>
      </div>
      <div class="food-actions">
        <input type="number" class="portion-input" min="0.25" step="0.25" value="1" aria-label="Quantity" />
        <button type="button" class="btn btn-primary btn-sm add-food-btn">Add</button>
      </div>
    </div>
  `;
}

export function initNutritionSearch(container, onMealAdded) {
  const input = qs("#food-search-input", container);
  const resultsContainer = qs("#food-results", container);

  if (!hasApiKeys()) {
    renderError(
      resultsContainer,
      "No Nutritionix API credentials configured. Add VITE_NUTRITIONIX_APP_ID and VITE_NUTRITIONIX_APP_KEY to your .env file to enable food search."
    );
    return;
  }

  let currentResults = [];

  const runSearch = async () => {
    const query = input.value.trim();
    if (!query) {
      resultsContainer.innerHTML = "";
      return;
    }

    resultsContainer.innerHTML = '<p class="loading">Searching…</p>';

    try {
      const data = await searchFoods(query);
      currentResults = (data.common || []).slice(0, 10);

      if (!currentResults.length) {
        resultsContainer.innerHTML = '<p class="empty-message">No foods found. Try a different search.</p>';
        return;
      }

      resultsContainer.innerHTML = currentResults.map(foodResultTemplate).join("");
    } catch (err) {
      renderError(resultsContainer, "Unable to search foods right now. Check your connection or API key and try again.");
    }
  };

  input.addEventListener("input", debounce(runSearch, 500));

  resultsContainer.addEventListener("click", async (event) => {
    if (!event.target.classList.contains("add-food-btn")) return;

    const card = event.target.closest(".food-result");
    const food = currentResults[Number(card.dataset.index)];
    const portionInput = qs(".portion-input", card);
    const qty = Number(portionInput.value) || 1;
    const button = event.target;

    button.disabled = true;
    button.textContent = "Adding…";

    try {
      const nutrients = await getNutrients(`${qty} ${food.food_name}`);
      const item = nutrients.foods?.[0];
      if (!item) throw new Error("No nutrition data returned");

      const meal = {
        id: generateId(),
        date: todayISO(),
        foodName: item.food_name,
        servingQty: item.serving_qty,
        servingUnit: item.serving_unit,
        calories: item.nf_calories || 0,
        protein: item.nf_protein || 0,
        carbs: item.nf_total_carbohydrate || 0,
        fat: item.nf_total_fat || 0,
      };

      const meals = getLocalStorage(STORAGE_KEYS.meals, []);
      meals.push(meal);
      setLocalStorage(STORAGE_KEYS.meals, meals);
      recordActivityToday();
      updateStreakBadge();

      if (typeof onMealAdded === "function") onMealAdded();

      button.textContent = "Added!";
      setTimeout(() => {
        button.disabled = false;
        button.textContent = "Add";
      }, 1200);
    } catch (err) {
      button.disabled = false;
      button.textContent = "Add";
      renderError(resultsContainer, "Unable to add this food right now. Please try again.");
    }
  });
}
