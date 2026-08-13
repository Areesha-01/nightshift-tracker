# NightShift API Documentation

Base URL (local): `http://localhost:5000/api`
Base URL (live): `https://nightshift-api-ezqw.onrender.com/api`

All endpoints return JSON. Endpoints marked **🔒 Protected** require a valid JWT sent in the request header:
```
Authorization: Bearer <token>
```
The token is obtained from the Login endpoint.

---

## Authentication

### Register User
Creates a new user account and sends a welcome email.

```
POST /auth/register
```

**Request Body**
```json
{
  "name": "Areesha Chaudhry",
  "email": "areesha@example.com",
  "password": "StrongPass1"
}
```

**Validation**
- `name`, `email`, `password` are all required
- `email` must be a valid email format
- `password` must be at least 8 characters

**Success Response — 201**
```json
{
  "message": "User registered successfully"
}
```

**Error Responses**
| Status | Condition | Body |
|---|---|---|
| 400 | Missing field | `{ "message": "Name, email, and password are all required" }` |
| 400 | Invalid email format | `{ "message": "Please provide a valid email address" }` |
| 400 | Password under 8 characters | `{ "message": "Password must be at least 8 characters" }` |
| 400 | Email already registered | `{ "message": "User already exists" }` |

---

### Login User
Authenticates a user and returns a JWT.

```
POST /auth/login
```

**Request Body**
```json
{
  "email": "areesha@example.com",
  "password": "StrongPass1"
}
```

**Success Response — 200**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "name": "Areesha Chaudhry",
    "email": "areesha@example.com"
  }
}
```

**Error Responses**
| Status | Condition | Body |
|---|---|---|
| 400 | Missing email/password | `{ "message": "Email and password are required" }` |
| 400 | Wrong password or unknown email | `{ "message": "Invalid credentials" }` |

---

## Tasks
All task endpoints are **🔒 Protected**.

### Get All Tasks
```
GET /tasks
```

Returns every task, with `assignee`, `createdBy`, and each comment's `commentedBy` populated with `name` and `email`.

**Success Response — 200**
```json
[
  {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "title": "Fix login bug",
    "description": "Users unable to login with correct password",
    "status": "To Do",
    "priority": "High",
    "dueDate": "2026-07-31T00:00:00.000Z",
    "assignee": { "_id": "...", "name": "Hassam", "email": "hassam@example.com" },
    "createdBy": { "_id": "...", "name": "Areesha Chaudhry", "email": "areesha@example.com" },
    "comments": [
      {
        "_id": "...",
        "text": "This work is in progress",
        "commentedBy": { "_id": "...", "name": "Areesha Chaudhry" },
        "createdAt": "2026-07-31T10:20:00.000Z"
      }
    ],
    "createdAt": "2026-07-30T09:00:00.000Z",
    "updatedAt": "2026-07-31T10:20:00.000Z"
  }
]
```

---

### Create Task
```
POST /tasks
```

**Request Body**
```json
{
  "title": "Fix login bug",
  "description": "Users unable to login with correct password",
  "status": "To Do",
  "priority": "High",
  "dueDate": "2026-07-31",
  "assignee": "64f8a1b2c3d4e5f6a7b8c9d1"
}
```
Only `title` is required. `status` defaults to `"To Do"`, `priority` defaults to `"Medium"`. `assignee` and `dueDate` are optional.

**Success Response — 201** — the created task (same shape as above)

**Error Response**
| Status | Condition | Body |
|---|---|---|
| 400 | Empty/missing title | `{ "message": "Title is required" }` |
| 401 | Missing/invalid token | `{ "message": "No token, authorization denied" }` or `{ "message": "Token is not valid" }` |

---

### Update Task
```
PUT /tasks/:id
```

Accepts any subset of: `title`, `description`, `status`, `priority`, `dueDate`, `assignee`. Any other field in the request body (e.g. `createdBy`) is silently ignored — only the fields above can ever be written.

**Request Body (example — status change only)**
```json
{
  "status": "In Progress"
}
```

**Success Response — 200** — the updated task

**Error Responses**
| Status | Condition | Body |
|---|---|---|
| 400 | Title present but empty | `{ "message": "Title cannot be empty" }` |
| 404 | Task ID does not exist | `{ "message": "Task not found" }` |

---

### Delete Task
```
DELETE /tasks/:id
```

**Success Response — 200**
```json
{ "message": "Task deleted successfully" }
```

**Error Response**
| Status | Condition | Body |
|---|---|---|
| 404 | Task ID does not exist | `{ "message": "Task not found" }` |

---

### Add Comment
```
POST /tasks/:id/comments
```

**Request Body**
```json
{
  "text": "This work is in progress"
}
```

**Success Response — 200** — the full updated task, including the new comment in `comments`

**Error Responses**
| Status | Condition | Body |
|---|---|---|
| 400 | Empty/whitespace-only text | `{ "message": "Comment text is required" }` |
| 404 | Task ID does not exist | `{ "message": "Task not found" }` |

---

## Users

### Get All Users
```
GET /users
```
**🔒 Protected**. Returns a list of registered users (`name`, `email` only) — used to populate the assignee dropdown on the frontend.

**Success Response — 200**
```json
[
  { "_id": "64f8a1b2c3d4e5f6a7b8c9d1", "name": "Hassam", "email": "hassam@example.com" }
]
```

---

## Error Format
All errors follow the same shape:
```json
{ "message": "Human-readable description of what went wrong" }
```

Unmatched routes return:
```json
{ "message": "Route not found: /api/whatever-was-requested" }
```

---

## Postman Collection
A ready-to-import Postman collection covering every endpoint above (with the live base URL pre-configured) is included in the repository: `NightShift_API.postman_collection.json`.
