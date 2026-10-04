let notes = [
  { id: 1, text: "Buy milk and bread", category: "personal" },
  { id: 2, text: "Finish the Day 3 assignment", category: "study" },
  { id: 3, text: "Email the project report to Grace", category: "work" },
  { id: 4, text: "Revise JavaScript arrays", category: "study" },
  { id: 5, text: "Call mum", category: "personal" },
];

// 1. Search notes
function searchNotes(word) {
  return notes.filter((note) =>
    note.text.toLowerCase().includes(word.toLowerCase())
  );
}

console.log(searchNotes("day"));
// Expected: [{ id: 2, text: "Finish the Day 3 assignment", category: "study" }]

console.log(searchNotes("pizza"));
// Expected: []


// 2. Find longest note
function longestNote() {
  if (notes.length === 0) {
    return null;
  }

  let longest = notes[0];

  for (let note of notes) {
    if (note.text.length > longest.text.length) {
      longest = note;
    }
  }

  return longest;
}

console.log(longestNote());
// Expected: { id: 3, text: "Email the project report to Grace", category: "work" }

let savedNotes = notes;
notes = [];

console.log(longestNote());
// Expected: null

notes = savedNotes;


// 3. Count notes by category
function countByCategory() {
  let counts = {
    personal: 0,
    work: 0,
    study: 0,
  };

  for (let note of notes) {
    counts[note.category]++;
  }

  return counts;
}

console.log(countByCategory());
// Expected: { personal: 2, work: 1, study: 2 }

notes = [];

console.log(countByCategory());
// Expected: { personal: 0, work: 0, study: 0 }

notes = savedNotes;


// 4. Get summary
function getSummary() {
  let counts = countByCategory();
  let word = notes.length === 1 ? "note" : "notes";

  return `${notes.length} ${word}: ${counts.personal} personal, ${counts.work} work, ${counts.study} study.`;
}

console.log(getSummary());
// Expected: "5 notes: 2 personal, 1 work, 2 study."

notes = [savedNotes[0]];

console.log(getSummary());
// Expected: "1 note: 1 personal, 0 work, 0 study."

notes = savedNotes;


// 5. Check for duplicate
function isDuplicate(text) {
  let normalizedText = text.trim().toLowerCase();

  return notes.some(
    (note) => note.text.trim().toLowerCase() === normalizedText
  );
}

console.log(isDuplicate("  CALL MUM  "));
// Expected: true

console.log(isDuplicate("Buy oranges"));
// Expected: false


// 6. Add a note
function addNote(text, category) {
  let trimmedText = text.trim();
  let validCategories = ["personal", "work", "study"];

  if (trimmedText.length < 1 || trimmedText.length > 200) {
    console.log("Note must be between 1 and 200 characters.");
    return false;
  }

  if (isDuplicate(trimmedText)) {
    console.log("Note already exists.");
    return false;
  }

  if (!validCategories.includes(category)) {
    console.log("Invalid category.");
    return false;
  }

  let newNote = {
    id: notes.length + 1,
    text: trimmedText,
    category: category,
  };

  notes.push(newNote);

  return true;
}

console.log(addNote("Plan weekend hike", "personal"));
// Expected: true

console.log(addNote("Call mum", "personal"));
// Expected: false, with "Note already exists." logged

console.log(addNote("", "study"));
// Expected: false, with "Note must be between 1 and 200 characters." logged

console.log(addNote("Learn Python", "random"));
// Expected: false, with "Invalid category." logged