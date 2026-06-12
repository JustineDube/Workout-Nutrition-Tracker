// Shared ExerciseDB (RapidAPI) configuration and fetch helpers

import { fetchJSON } from "./utils.mjs";

const BASE_URL = "https://exercisedb.p.rapidapi.com";
const API_KEY = import.meta.env.VITE_RAPIDAPI_KEY;

const HEADERS = {
  "X-RapidAPI-Key": API_KEY,
  "X-RapidAPI-Host": "exercisedb.p.rapidapi.com",
};

export const BODY_PARTS = [
  "back",
  "cardio",
  "chest",
  "lower arms",
  "lower legs",
  "neck",
  "shoulders",
  "upper arms",
  "upper legs",
  "waist",
];

export const EQUIPMENT_TYPES = [
  "assisted",
  "band",
  "barbell",
  "body weight",
  "cable",
  "dumbbell",
  "ez barbell",
  "kettlebell",
  "leverage machine",
  "medicine ball",
  "resistance band",
  "smith machine",
  "stability ball",
];

export function hasApiKey() {
  return Boolean(API_KEY);
}

function exerciseFetch(path) {
  return fetchJSON(`${BASE_URL}${path}`, { headers: HEADERS });
}

export function searchExercisesByName(name) {
  return exerciseFetch(`/exercises/name/${encodeURIComponent(name.toLowerCase())}`);
}

export function getExercisesByBodyPart(bodyPart) {
  return exerciseFetch(`/exercises/bodyPart/${encodeURIComponent(bodyPart)}`);
}

export function getExercisesByEquipment(equipment) {
  return exerciseFetch(`/exercises/equipment/${encodeURIComponent(equipment)}`);
}

export function getAllExercises(limit = 50) {
  return exerciseFetch(`/exercises?limit=${limit}`);
}

export function getExerciseById(id) {
  return exerciseFetch(`/exercises/exercise/${id}`);
}
