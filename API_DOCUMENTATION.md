# SheHub Admin Core - API Documentation

## Base Configuration
- **Base URL**: `http://localhost:8080/api`
- **Context Path**: `/api`
- **CORS Origins**: `http://localhost:3000`, `http://localhost:3001`, `http://localhost:3002`

## Authentication
- **Type**: Basic Authentication
---

## Applicant Endpoints

### CREATE Operations

#### Create Applicant
```http
POST /api/applicants
Content-Type: application/json
```

**Request Body**:
```json
{
  "email": "string",
  "firstName": "string",
  "lastName": "string",
  "language": "ES|EN|CAT|EN_GB|EN_US",
  "roles": ["string"],
  "mentor": boolean
}
```

**Response**: `201 Created`
```json
{
  "id": "number",
  "email": "string",
  "firstName": "string",
  "lastName": "string",
  "mentor": "string|null",
  "displayRole": "string",
  "language": "Language",
  "roles": ["string"],
  "timestamp": "string",
  "deleted": "boolean",
  "deletedAt": "string|null",
  "userId": "number"
}
```

---

### READ Operations

#### Get All Applicants
```http
GET /api/applicants
```
**Response**: `200 OK` - Array of ApplicantListItemDto

#### Get Paginated Applicants (Admin Panel)
```http
GET /api/applicants/paginated?page=0&size=10&sort=timestamp,desc
```
**Query Parameters**:
- `page`: Page number (default: 0)
- `size`: Page size (default: 10)
- `sort`: Sort criteria (e.g., "timestamp,desc")

**Response**: `200 OK`
```json
{
  "content": [ApplicantListItemDto],
  "totalElements": "number",
  "totalPages": "number",
  "size": "number",
  "number": "number"
}
```

#### Get Applicant by ID
```http
GET /api/applicants/{id}
```
**Response**: `200 OK` or `404 Not Found`

#### Get Applicant by Email
```http
GET /api/applicants/email/{email}
```
**Response**: `200 OK` or `404 Not Found`

#### Filter by Language
```http
GET /api/applicants/language/{language}
```
**Path Parameters**:
- `language`: `ES|EN|CAT|EN_GB|EN_US`

#### Filter by Mentor Status
```http
GET /api/applicants/mentor/{mentor}
```
**Path Parameters**:
- `mentor`: `true|false`

#### Get Pending Applicants
```http
GET /api/applicants/pending
```
**Response**: `200 OK` - Array of pending applicants

#### Get Available Roles
```http
GET /api/applicants/roles/available
```
**Response**: `200 OK`
```json
["role1", "role2", "role3"]
```

#### Check Email Exists
```http
GET /api/applicants/exists?email={email}
```
**Query Parameters**:
- `email`: Email to check

**Response**: `200 OK`
```json
true|false
```

---

### STATISTICS Endpoints

#### Get Applicant Statistics ⭐
```http
GET /api/applicants/stats
```
**Response**: `200 OK`
```json
{
  "total": "number",
  "mentors": "number",
  "colaboradoras": "number"
}
```
> **Used in Dashboard**: Este endpoint es utilizado por `useServerStats` para mostrar las estadísticas principales en el dashboard.

#### Get Total Count
```http
GET /api/applicants/count
```

#### Get Count by Language
```http
GET /api/applicants/count/language/{language}
```

#### Get Count by Mentor Status
```http
GET /api/applicants/count/mentor/{mentor}
```

---

### UPDATE Operations

#### Update Applicant by ID
```http
PUT /api/applicants/{id}
Content-Type: application/json
```

#### Update Applicant by Email
```http
PUT /api/applicants/email/{email}
Content-Type: application/json
```

#### Restore Applicant
```http
PUT /api/applicants/restore/email/{email}
```

#### Convert Applicant to User
```http
PUT /api/applicants/{id}/convert-to-user?userId={userId}
```
**Query Parameters**:
- `userId`: ID of the user to link

---

### DELETE Operations

#### Soft Delete by Email
```http
DELETE /api/applicants/email/{email}
```
**Response**: `204 No Content`

#### Soft Delete by ID
```http
DELETE /api/applicants/{id}
```
**Response**: `204 No Content`

---

### ADMIN Operations

#### Get Expired Deleted Applicants
```http
GET /api/applicants/admin/expired-deleted
```
**Response**: `200 OK` - Array of expired deleted applicants

#### Cleanup Expired Applicants
```http
DELETE /api/applicants/admin/cleanup-expired
```
**Response**: `200 OK`
```json
number (count of cleaned up applicants)
```

---

## Admin Authentication Endpoints

### Test Admin Access
```http
GET /api/admin/test
Authorization: Basic {base64(email:password)}
```
**Response**: `200 OK` if authenticated, `401 Unauthorized` if not

> **Used in LoginForm**: Este endpoint es utilizado para validar las credenciales de administrador antes de permitir el acceso al dashboard.

---

## Frontend Integration

### Dashboard Statistics Usage
El dashboard utiliza los siguientes endpoints principales:

1. **`GET /api/applicants`** - Para cargar la lista de aplicantes
2. **`GET /api/applicants/stats`** - Para mostrar estadísticas en tiempo real
3. **`GET /api/admin/test`** - Para validación de credenciales

### Hooks Mapping
- `useApplicants` → `GET /api/applicants`
- `useServerStats` → `GET /api/applicants/stats`
- `LoginForm` → `GET /api/admin/test`

### Environment Variables
```bash
NEXT_PUBLIC_API_URL=http://localhost:8080
```

---

## Error Handling

### Common HTTP Status Codes
- `200 OK` - Request successful
- `201 Created` - Resource created successfully
- `204 No Content` - Delete operation successful
- `400 Bad Request` - Invalid request data
- `401 Unauthorized` - Authentication required
- `403 Forbidden` - Access denied (CORS)
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

### Common Error Response Format
```json
{
  "timestamp": "2025-01-15T10:30:00",
  "status": 400,
  "error": "Bad Request",
  "message": "Validation failed",
  "path": "/api/applicants"
}
```

---

## Data Models

### Language Types
```typescript
type Language = 'ES' | 'EN' | 'CAT' | 'EN_GB' | 'EN_US';
```

### Applicant Interface
```typescript
interface Applicant {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  mentor: string | null;
  displayRole: string;
  language: Language;
  roles: string[];
  timestamp: string;
  deleted: boolean;
  deletedAt: string | null;
  userId: number;
}
```

### ApplicantStats Interface
```typescript
interface ApplicantStats {
  total: number;
  mentors: number;
  colaboradoras: number;
}
```

---

## Testing

### Quick Test Commands
```bash
# Test API connectivity
curl -X GET "http://localhost:8080/api/applicants/stats"

# Test admin authentication
curl -X GET "http://localhost:8080/api/admin/test" \
  -H "Authorization: Basic b25seWlyaW5hN0BnbWFpbC5jb206SXJpbmFBZG1pbjIwMjQh"

# Get all applicants
curl -X GET "http://localhost:8080/api/applicants"
```

---

## Notes for Team Members

### Para Compañeras Desarrolladoras:
1. **Base URL siempre**: `http://localhost:8080/api`
2. **CORS configurado** para puertos 3000, 3001, 3002
3. **Endpoint más importante**: `/api/applicants/stats` para dashboard
4. **Autenticación**: Basic Auth con credenciales demo
5. **Todos los endpoints** devuelven JSON
6. **Soft deletes**: Los registros no se eliminan físicamente

### Endpoints Críticos para el Dashboard:
- ✅ `GET /api/applicants` - Lista completa
- ✅ `GET /api/applicants/stats` - Estadísticas principales
- ✅ `GET /api/admin/test` - Validación auth
- ✅ `GET /api/applicants/paginated` - Para tablas con paginación

---

*Documentación generada para SheHub Admin Core v1.0*
*Última actualización: 30 de agosto de 2025*
