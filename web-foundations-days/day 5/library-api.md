# Library Books REST API

A REST API design for the books resource of a library. The base path for every endpoint is `/books`. Data is sent and received as JSON.

## Endpoints

### 1. List all books

* Method: GET
* Path: `/books`
* Description: Returns every book in the library.
* Request body: none
* Success status code: 200 OK

### 2. Get one book

* Method: GET
* Path: `/books/{id}`
* Description: Returns the single book with the given id.
* Request body: none
* Success status code: 200 OK

### 3. Create a book

* Method: POST
* Path: `/books`
* Description: Adds a new book and returns it with the id the server assigned.
* Example request body:

```json
{
  "title": "Things Fall Apart",
  "author": "Chinua Achebe",
  "year": 1958,
  "isbn": "9780385474542"
}
```

* Success status code: 201 Created

### 4. Replace a book

* Method: PUT
* Path: `/books/{id}`
* Description: Replaces the whole book record with the data sent.
* Example request body:

```json
{
  "title": "Things Fall Apart",
  "author": "Chinua Achebe",
  "year": 1958,
  "isbn": "9780385474542"
}
```

* Success status code: 200 OK

### 5. Update part of a book

* Method: PATCH
* Path: `/books/{id}`
* Description: Changes only the fields that are sent and leaves the rest as they are.
* Example request body:

```json
{
  "year": 1959
}
```

* Success status code: 200 OK

### 6. Delete a book

* Method: DELETE
* Path: `/books/{id}`
* Description: Removes the book with the given id.
* Request body: none
* Success status code: 204 No Content

### 7. List books by an author

* Method: GET
* Path: `/books?author=Chinua%20Achebe`
* Description: Returns only the books written by the author given in the query parameter.
* Request body: none
* Success status code: 200 OK (an author with no books returns an empty list, not an error)

## Error codes

### 400 Bad Request

* Meaning: The request is malformed or the data is invalid, so the server cannot process it.
* Example: A client sends POST `/books` without a `title`, or sends `"year": "last year"` instead of a number.

### 404 Not Found

* Meaning: The resource the client asked for does not exist.
* Example: A client sends GET `/books/9999` and no book with id 9999 exists. The same happens for PUT, PATCH or DELETE on an id that does not exist.