#Web Foundations - Daily Assignments.

A small note taking web app for capturing ideas, reminders and tasks. Built with HTML, CSS and vanilla JavaScript as Project 1 of Web Foundations.

## Features

* Add notes with a category: Personal, Work or Study
* Each note shows its text, category label and the date and time it was created
* Validation: empty notes and notes over 200 characters are rejected with a clear message
* Delete a single note, or clear all notes (with a confirmation)
* Live note count that handles none, one and many notes
* Search notes by text, not case sensitive
* Notes are saved in localStorage, so they are still there after a refresh

## How to run

1. Download or clone this repository.
2. Open `index.html` in any modern browser. No build step or install is needed.

## Project files

* `index.html`: page structure
* `style.css`: layout and styling
* `script.js`: add, delete, validate, search and save notes
* `README.md`: this file

## What I learned

* Selecting and changing elements with the DOM
* Building elements with createElement and textContent
* Handling form events with preventDefault
* Saving and loading data with localStorage, JSON.stringify and JSON.parse
