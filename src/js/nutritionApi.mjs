// Shared Nutritionix configuration and fetch helpers

import { fetchJSON } from "./utils.mjs";

const BASE_URL = "https://trackapi.nutritionix.com/v2";
const APP_ID = import.meta.env.VITE_NUTRITIONIX_APP_ID;
const APP_KEY = import.meta.env.VITE_NUTRITIONIX_APP_KEY;

const HEADERS = {
  "x-app-id": APP_ID,
  "x-app-key": APP_KEY,
  "Content-Type": "application/json",
};

export function hasApiKeys() {
  return Boolean(APP_ID && APP_KEY);
}

export function searchFoods(query) {
  return fetchJSON(`${BASE_URL}/search/instant?query=${encodeURIComponent(query)}`, {
    headers: HEADERS,
  });
}

export function getNutrients(query) {
  return fetchJSON(`${BASE_URL}/natural/nutrients`, {
    method: "POST",
    headers: HEADERS,
    body: JSON.stringify({ query }),
  });
}
