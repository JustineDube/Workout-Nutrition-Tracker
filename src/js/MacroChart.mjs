// SVG donut chart breaking down today's logged macronutrients

import { getMealsForDate, sumNutrition, todayISO } from "./utils.mjs";

const MACROS = [
  { key: "protein", label: "Protein", caloriesPerGram: 4, color: "#1a2b4a" },
  { key: "carbs", label: "Carbs", caloriesPerGram: 4, color: "#39d353" },
  { key: "fat", label: "Fat", caloriesPerGram: 9, color: "#e05c4b" },
];

const RADIUS = 60;
const STROKE = 22;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function renderMacroChart(parentElement) {
  const totals = sumNutrition(getMealsForDate(todayISO()));
  const macros = MACROS.map((macro) => ({
    ...macro,
    grams: Math.round(totals[macro.key] || 0),
    calories: (totals[macro.key] || 0) * macro.caloriesPerGram,
  }));
  const totalCalories = macros.reduce((sum, macro) => sum + macro.calories, 0);

  let circles;
  if (totalCalories > 0) {
    let offset = 0;
    circles = macros
      .map((macro) => {
        const dash = (macro.calories / totalCalories) * CIRCUMFERENCE;
        const circle = `<circle cx="80" cy="80" r="${RADIUS}" fill="none" stroke="${macro.color}" stroke-width="${STROKE}" stroke-dasharray="${dash} ${CIRCUMFERENCE - dash}" stroke-dashoffset="${-offset}" transform="rotate(-90 80 80)" />`;
        offset += dash;
        return circle;
      })
      .join("");
  } else {
    circles = `<circle cx="80" cy="80" r="${RADIUS}" fill="none" stroke="#e2e6ec" stroke-width="${STROKE}" />`;
  }

  const legend = macros
    .map(
      (macro) => `
        <li><span class="macro-swatch" style="background-color: ${macro.color}"></span>${macro.label}: ${macro.grams}g</li>`
    )
    .join("");

  parentElement.innerHTML = `
    <div class="macro-chart-wrap">
      <svg class="macro-chart" viewBox="0 0 160 160" role="img" aria-label="Macronutrient breakdown for today">
        ${circles}
      </svg>
      <ul class="macro-legend">
        ${legend}
        ${totalCalories === 0 ? '<li class="empty-message">Log a meal to see your macros</li>' : ""}
      </ul>
    </div>
  `;
}
