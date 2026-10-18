/* Day 6 assignment: school database (SQLite) */

PRAGMA foreign_keys = ON;

/* ---------- 1. Tables ---------- */

CREATE TABLE students (
  id     INTEGER PRIMARY KEY,
  name   TEXT NOT NULL,
  email  TEXT NOT NULL UNIQUE
);

CREATE TABLE courses (
  id       INTEGER PRIMARY KEY,
  title    TEXT NOT NULL,
  credits  INTEGER NOT NULL
);

/* Join table: one row means "this student is enrolled on this course" */
CREATE TABLE enrolments (
  student_id  INTEGER NOT NULL,
  course_id   INTEGER NOT NULL,
  grade       INTEGER CHECK (grade BETWEEN 0 AND 100),  /* empty until graded */
  PRIMARY KEY (student_id, course_id),  /* same student cannot enrol on the same course twice */
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (course_id)  REFERENCES courses(id)  ON DELETE CASCADE
);

/* ---------- 2. Sample data ---------- */

INSERT INTO students (id, name, email) VALUES
  (1, 'Amina Hassan',  'amina@example.com'),
  (2, 'Brian Otieno',  'brian@example.com'),
  (3, 'Grace Wanjiru', 'grace@example.com'),
  (4, 'David Mwangi',  'david@example.com');

INSERT INTO courses (id, title, credits) VALUES
  (1, 'Web Foundations', 3),
  (2, 'Databases',       4),
  (3, 'Data Structures', 4);

INSERT INTO enrolments (student_id, course_id, grade) VALUES
  (1, 1, 72),
  (1, 2, 88),
  (2, 1, 65),
  (3, 2, 91),
  (3, 3, NULL),
  (1, 3, NULL);

/* ---------- 3. Queries ---------- */

/* Query 1: all courses for one student, by name */
SELECT courses.title, enrolments.grade
FROM students
JOIN enrolments ON enrolments.student_id = students.id
JOIN courses    ON courses.id = enrolments.course_id
WHERE students.name = 'Amina Hassan';

/* Query 2: all students on one course */
SELECT students.name, students.email
FROM courses
JOIN enrolments ON enrolments.course_id = courses.id
JOIN students   ON students.id = enrolments.student_id
WHERE courses.title = 'Databases';

/* Query 3: number of students per course (LEFT JOIN keeps empty courses) */
SELECT courses.title, COUNT(enrolments.student_id) AS student_count
FROM courses
LEFT JOIN enrolments ON enrolments.course_id = courses.id
GROUP BY courses.id;

/* Query 4: students who have no enrolments */
SELECT students.name, students.email
FROM students
LEFT JOIN enrolments ON enrolments.student_id = students.id
WHERE enrolments.student_id IS NULL;

/* Query 5: update one enrolment's grade (Brian, Web Foundations) */
UPDATE enrolments
SET grade = 80
WHERE student_id = 2 AND course_id = 1;

/* Check the update worked */
SELECT students.name, courses.title, enrolments.grade
FROM enrolments
JOIN students ON students.id = enrolments.student_id
JOIN courses  ON courses.id = enrolments.course_id
WHERE enrolments.student_id = 2 AND enrolments.course_id = 1;

/* Extra: the duplicate rule in action. Uncomment to see it fail with a UNIQUE constraint error.
INSERT INTO enrolments (student_id, course_id, grade) VALUES (1, 1, 50);
*/