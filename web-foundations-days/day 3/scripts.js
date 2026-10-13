let notes = [
  { id: 1, text: "Buy milk and bread", category: "personal" },
  { id: 2, text: "Finish the Day 3 assignment", category: "study" },
  { id: 3, text: "Email the project report to Grace", category: "work" },
  { id: 4, text: "Revise JavaScript arrays", category: "study" },
  { id: 5, text: "Call mum", category: "personal" },
];


function searchNotes(word) {
  return notes.filter((note) =>
    note.text.toLowerCase().includes(word.toLowerCase())
  );
}

console.log(searchNotes("day"));


console.log(searchNotes("pizza"));




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


let savedNotes = notes;
notes = [];

console.log(longestNote());


notes = savedNotes;



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


notes = [];

console.log(countByCategory());


notes = savedNotes;



function getSummary() {
  let counts = countByCategory();
  let word = notes.length === 1 ? "note" : "notes";

  return `${notes.length} ${word}: ${counts.personal} personal, ${counts.work} work, ${counts.study} study.`;
}

console.log(getSummary());

notes = [savedNotes[0]];

console.log(getSummary());

notes = savedNotes;



function isDuplicate(text) {
  let normalizedText = text.trim().toLowerCase();

  return notes.some(
    (note) => note.text.trim().toLowerCase() === normalizedText
  );
}

console.log(isDuplicate("  CALL MUM  "));


console.log(isDuplicate("Buy oranges"));




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


console.log(addNote("Call mum", "personal"));


console.log(addNote("", "study"));


console.log(addNote("Learn Python", "random"));
