# School Database Design

## Tables

### students

* Holds one row for each student.
* Columns: `id` (primary key), `name` (required), `email` (required and unique).
* The unique email stops the same address being registered for two students.

### courses

* Holds one row for each course on offer.
* Columns: `id` (primary key), `title` (required), `credits` (required).

### enrolments

* Holds one row each time a student is enrolled on a course. It also stores the grade for that enrolment.
* Columns: `student_id` (foreign key to students), `course_id` (foreign key to courses), `grade` (a number from 0 to 100, empty until the student is graded).
* The primary key is the pair (`student_id`, `course_id`). This is a composite key, so the same student cannot enrol on the same course twice.
* Both foreign keys use ON DELETE CASCADE, so deleting a student or a course also removes the matching enrolments.

## Relationships

* One student can enrol on many courses, and one course can have many students. This is a **many to many** relationship between students and courses.
* A relational table cannot store a list of courses inside one student column, or a list of students inside one course column. That would be hard to search and update.
* The solution is a **join table**. The enrolments table sits between the two. Each row links one student to one course.
* As a result, students to enrolments is **one to many** (one student has many enrolment rows), and courses to enrolments is also **one to many** (one course has many enrolment rows).
* The grade belongs in the join table because it describes the pair, not the student or the course alone. Amina has a different grade on each course.

## Index

I would add an index on `enrolments(course_id)`.

* The primary key (`student_id`, `course_id`) already makes lookups by student fast, because the student id comes first in the key.
* Queries that start from a course, such as listing all students on a course or counting students per course, have no matching index, so the database would scan every enrolment row.
* An index on `course_id` makes those queries fast. The cost is a little extra storage and slightly slower writes, which is a good trade for a table that is read far more often than it is changed.

## SQL or NoSQL?

I would choose SQL for this system. The data is structured, every student, course and enrolment has the same fields, and the many to many relationship between students and courses is exactly what relational tables and joins are designed for. A school also needs the data to stay correct. Foreign keys prevent an enrolment for a student who does not exist, and the composite key prevents duplicate enrolments. Reports such as courses per student, students per course and students with no enrolments are simple SQL queries with JOIN and GROUP BY. A NoSQL document database would suit data with flexible, changing fields, but it would make these cross table questions and integrity rules harder, so it is not the best fit here.
