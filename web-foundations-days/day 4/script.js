// ---------- 1. Select the elements we need ----------
const textarea = document.querySelector("#note-text");
const charCount = document.querySelector("#char-count");
const wordCount = document.querySelector("#word-count");
const clearBtn = document.querySelector("#clear-btn");
const themeToggle = document.querySelector("#theme-toggle");

const MAX_CHARS = 200;
const WARN_CHARS = 180;
const DRAFT_KEY = "day4-draft";
const THEME_KEY = "day4-theme";


function countWords(text) {
  const trimmed = text.trim();
  return trimmed === "" ? 0 : trimmed.split(/\s+/).length;
}

function updateCounts() {
  const length = textarea.value.length;
  const words = countWords(textarea.value);

  charCount.textContent = `${length} / ${MAX_CHARS} characters`;
  wordCount.textContent = `${words} words`;

  
  charCount.classList.toggle("warning", length > WARN_CHARS && length <= MAX_CHARS);
  charCount.classList.toggle("over", length > MAX_CHARS);
}


function saveDraft() {
  localStorage.setItem(DRAFT_KEY, textarea.value);
}

function clearNote() {
  textarea.value = "";
  localStorage.removeItem(DRAFT_KEY);
  updateCounts();
  textarea.focus();
}


function applyTheme(isDark) {
  document.body.classList.toggle("dark", isDark);
  themeToggle.textContent = isDark ? "Light mode" : "Dark mode";
}

function toggleTheme() {
  const isDark = !document.body.classList.contains("dark");
  applyTheme(isDark);
  localStorage.setItem(THEME_KEY, isDark ? "dark" : "light");
}


textarea.addEventListener("input", () => {
  updateCounts();
  saveDraft();
});

textarea.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    clearNote();
  }
});

clearBtn.addEventListener("click", clearNote);
themeToggle.addEventListener("click", toggleTheme);


const savedDraft = localStorage.getItem(DRAFT_KEY);
if (savedDraft !== null) {
  textarea.value = savedDraft;
}

applyTheme(localStorage.getItem(THEME_KEY) === "dark");
updateCounts();