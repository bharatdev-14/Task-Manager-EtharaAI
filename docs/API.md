# API Documentation

Base URL:

```text
Local: http://localhost:5000/api
Production: https://your-backend-service.up.railway.app/api
```

Authentication:

```http
Authorization: Bearer <jwt>
```

All responses use this shape:

```json
{
  "success": true,
  "message": "Success",
  "data": {}
}
```

Errors include a request id when available:

```json
{
  "success": false,
  "message": "Validation failed",
  "requestId": "..."
}
```

## Health

### GET `/health`

Checks API and database connectivity.

## Auth

### POST `/auth/signup`

Body:

```json
{
  "name": "Admin User",
  "email": "admin@example.com",
  "password": "Password123!"
}
```

Returns user, access token, and refresh token.

### POST `/auth/login`

Body:

```json
{
  "email": "admin@example.com",
  "password": "Password123!"
}
```

### GET `/auth/me`

Returns the authenticated user.

## Projects

### GET `/projects`

Returns projects visible to the authenticated user.

### POST `/projects`

Creates a project. The creator becomes project admin.

Body:

```json
{
  "name": "Product Launch",
  "description": "Launch planning and execution"
}
```

### GET `/projects/:id`

Returns a single project with members and tasks.

### PATCH `/projects/:id`

Admin only.

Body:

```json
{
  "name": "Updated Project",
  "description": "Updated description"
}
```

### DELETE `/projects/:id`

Admin only.

### POST `/projects/:id/members`

Admin only. Prevents duplicate members.

Body:

```json
{
  "email": "member@example.com",
  "role": "MEMBER"
}
```

Roles:

- `ADMIN`
- `MEMBER`

### DELETE `/projects/:id/members/:memberId`

Admin only.

## Tasks

### GET `/tasks`

Returns tasks visible to the authenticated user.

Query parameters:

- `page`
- `limit`
- `search`
- `status`
- `priority`
- `assignedToId`
- `due`: `overdue`, `today`, `upcoming`

### GET `/projects/:projectId/tasks`

Returns tasks for a project.

### POST `/projects/:projectId/tasks`

Admin only.

Body:

```json
{
  "title": "Prepare launch checklist",
  "description": "Finalize release checklist",
  "dueDate": "2026-06-01T12:00:00.000Z",
  "priority": "HIGH",
  "status": "TODO",
  "assignedToId": "user_id"
}
```

### GET `/tasks/:id`

Returns a single task.

### PATCH `/tasks/:id`

Admins can update any task. Members can update tasks assigned to them.

### PATCH `/tasks/:id/assign`

Admin only.

Body:

```json
{
  "assignedToId": "user_id"
}
```

### PATCH `/tasks/:id/status`

Admins can update any task. Members can update tasks assigned to them.

Body:

```json
{
  "status": "IN_PROGRESS"
}
```

Task statuses:

- `TODO`
- `IN_PROGRESS`
- `DONE`

Task priorities:

- `LOW`
- `MEDIUM`
- `HIGH`

### DELETE `/tasks/:id`

Admin only.

## Dashboard

### GET `/dashboard`

Returns dashboard totals, tasks by status, tasks per user, overdue tasks, and recent activity.

### GET `/dashboard/total-tasks`

### GET `/dashboard/tasks-by-status`

### GET `/dashboard/tasks-per-user`

### GET `/dashboard/overdue-tasks`

### GET `/dashboard/recent-activity`

## Security Behavior

- Auth routes are rate limited.
- API routes are rate limited.
- Requests are sanitized.
- Zod validates request bodies and queries.
- CORS uses an explicit production allowlist.
- Project admin role is required for member management, task assignment, task deletion, and project deletion.
