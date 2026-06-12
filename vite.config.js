import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        exercises: resolve(__dirname, "exercises.html"),
        exerciseDetail: resolve(__dirname, "exercise-detail.html"),
        workout: resolve(__dirname, "workout.html"),
        history: resolve(__dirname, "history.html"),
        nutrition: resolve(__dirname, "nutrition.html"),
      },
    },
  },
});
