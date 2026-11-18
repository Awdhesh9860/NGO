# Enterprise NGO Platform — REST API Conventions
**Prefix**: `/api/v1`  
**Protocol**: HTTPS / RESTful JSON  

---

## 1. Request & Response Standards

### Success Envelope (`src/lib/api-response.ts`):
```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "timestamp": "ISO-8601",
    "requestId": "uuid"
  }
}
```

### Error Envelope:
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE_STRING",
    "message": "Human readable summary",
    "details": [ ... ]
  },
  "meta": {
    "timestamp": "ISO-8601",
    "requestId": "uuid"
  }
}
```

---

## 2. HTTP Status Code Conventions
- `200 OK`: Successful read or update.
- `201 Created`: Successful entity creation.
- `400 Bad Request`: Validation failure (Zod error details in response).
- `401 Unauthorized`: Missing or invalid session JWT.
- `403 Forbidden`: Authenticated user lacks required RBAC permission.
- `404 Not Found`: Resource does not exist within the tenant scope.
- `409 Conflict`: Duplicate unique key (e.g., email or slug already registered).
- `429 Too Many Requests`: Rate limit exceeded.
- `500 Internal Server Error`: Unhandled server exception.
