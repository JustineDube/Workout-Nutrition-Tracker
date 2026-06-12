// Exercise search & filtering (by name, body part, or equipment) with paginated results

import { qs, renderListWithTemplate, renderError, debounce } from "./utils.mjs";
import {
  hasApiKey,
  BODY_PARTS,
  EQUIPMENT_TYPES,
  searchExercisesByName,
  getExercisesByBodyPart,
  getExercisesByEquipment,
  getAllExercises,
} from "./exerciseApi.mjs";

const PAGE_SIZE = 12;

let allResults = [];
let currentPage = 1;

function exerciseCardTemplate(exercise) {
  return `
    <a class="exercise-card" href="/exercise-detail.html?id=${exercise.id}">
      <img src="${exercise.gifUrl}" alt="${exercise.name}" loading="lazy" />
      <div class="exercise-card-body">
        <h3>${exercise.name}</h3>
        <div class="tags">
          <span class="badge">${exercise.bodyPart}</span>
          <span class="badge">${exercise.equipment}</span>
        </div>
        <span class="btn btn-secondary btn-sm">View Details</span>
      </div>
    </a>
  `;
}

function renderPagination(paginationContainer, resultsContainer) {
  const totalPages = Math.max(1, Math.ceil(allResults.length / PAGE_SIZE));

  if (totalPages <= 1) {
    paginationContainer.innerHTML = "";
    return;
  }

  paginationContainer.innerHTML = `
    <button class="btn btn-secondary btn-sm" id="prev-page" ${currentPage === 1 ? "disabled" : ""}>Previous</button>
    <span>Page ${currentPage} of ${totalPages}</span>
    <button class="btn btn-secondary btn-sm" id="next-page" ${currentPage === totalPages ? "disabled" : ""}>Next</button>
  `;

  qs("#prev-page", paginationContainer).addEventListener("click", () => {
    currentPage -= 1;
    renderPage(resultsContainer, paginationContainer);
    resultsContainer.scrollIntoView({ behavior: "smooth" });
  });

  qs("#next-page", paginationContainer).addEventListener("click", () => {
    currentPage += 1;
    renderPage(resultsContainer, paginationContainer);
    resultsContainer.scrollIntoView({ behavior: "smooth" });
  });
}

function renderPage(resultsContainer, paginationContainer) {
  const start = (currentPage - 1) * PAGE_SIZE;
  const pageItems = allResults.slice(start, start + PAGE_SIZE);

  if (!pageItems.length) {
    resultsContainer.innerHTML = '<p class="empty-message">No exercises found. Try a different search or filter.</p>';
  } else {
    renderListWithTemplate(exerciseCardTemplate, resultsContainer, pageItems);
  }

  renderPagination(paginationContainer, resultsContainer);
}

async function runSearch(resultsContainer, paginationContainer, { name, bodyPart, equipment }) {
  resultsContainer.innerHTML = '<p class="loading">Loading exercises…</p>';
  paginationContainer.innerHTML = "";

  try {
    let results;

    if (name) {
      results = await searchExercisesByName(name);
      if (bodyPart !== "all") results = results.filter((ex) => ex.bodyPart === bodyPart);
      if (equipment !== "all") results = results.filter((ex) => ex.equipment === equipment);
    } else if (bodyPart !== "all") {
      results = await getExercisesByBodyPart(bodyPart);
      if (equipment !== "all") results = results.filter((ex) => ex.equipment === equipment);
    } else if (equipment !== "all") {
      results = await getExercisesByEquipment(equipment);
    } else {
      results = await getAllExercises(50);
    }

    allResults = results;
    currentPage = 1;
    renderPage(resultsContainer, paginationContainer);
  } catch (err) {
    renderError(resultsContainer, "Unable to load exercises right now. Check your connection or API key and try again.");
    paginationContainer.innerHTML = "";
  }
}

export function initExerciseSearch(container) {
  const nameInput = qs("#exercise-search-input", container);
  const bodyPartSelect = qs("#bodypart-filter", container);
  const equipmentSelect = qs("#equipment-filter", container);
  const resultsContainer = qs("#exercise-results", container);
  const paginationContainer = qs("#exercise-pagination", container);

  bodyPartSelect.innerHTML =
    '<option value="all">All Body Parts</option>' +
    BODY_PARTS.map((bp) => `<option value="${bp}">${bp}</option>`).join("");

  equipmentSelect.innerHTML =
    '<option value="all">All Equipment</option>' +
    EQUIPMENT_TYPES.map((eq) => `<option value="${eq}">${eq}</option>`).join("");

  if (!hasApiKey()) {
    renderError(
      resultsContainer,
      "No ExerciseDB API key configured. Add VITE_RAPIDAPI_KEY to your .env file to enable exercise search."
    );
    return;
  }

  const triggerSearch = () =>
    runSearch(resultsContainer, paginationContainer, {
      name: nameInput.value.trim(),
      bodyPart: bodyPartSelect.value,
      equipment: equipmentSelect.value,
    });

  nameInput.addEventListener("input", debounce(triggerSearch, 500));
  bodyPartSelect.addEventListener("change", triggerSearch);
  equipmentSelect.addEventListener("change", triggerSearch);

  runSearch(resultsContainer, paginationContainer, { name: "", bodyPart: "all", equipment: "all" });
}
