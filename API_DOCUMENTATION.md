# 📋 API Documentation - Applicant Controller

## Base URL
```
/api/applicants
```

---

## 📚 Endpoints Overview

### 🟢 CREATE Operations
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/applicants` | Create new applicant |

### 🔵 READ Operations
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/applicants` | Get all active applicants |
| `GET` | `/api/applicants/paginated` | Get applicants with pagination |
| `GET` | `/api/applicants/{id}` | Get applicant by ID |
| `GET` | `/api/applicants/email/{email}` | Get applicant by email |
| `GET` | `/api/applicants/language/{language}` | Filter by language |
| `GET` | `/api/applicants/mentor/{mentor}` | Filter by mentor flag |
| `GET` | `/api/applicants/pending` | Get only pending applicants |
| `GET` | `/api/applicants/roles/available` | Get all available roles |
| `GET` | `/api/applicants/exists` | Check if email exists |

### 📊 COUNT Operations
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/applicants/count` | Total applicant count |
| `GET` | `/api/applicants/count/language/{language}` | Count by language |
| `GET` | `/api/applicants/count/mentor/{mentor}` | Count by mentor flag |

### 🔶 UPDATE Operations
| Method | Endpoint | Description |
|--------|----------|-------------|
| `PUT` | `/api/applicants/{id}` | Update applicant by ID |
| `PUT` | `/api/applicants/email/{email}` | Update applicant by email |
| `PUT` | `/api/applicants/restore/email/{email}` | Restore deleted applicant |
| `PUT` | `/api/applicants/{id}/convert-to-user` | Convert to user |

### 🔴 DELETE Operations
| Method | Endpoint | Description |
|--------|----------|-------------|
| `DELETE` | `/api/applicants/email/{email}` | Soft delete by email |
| `DELETE` | `/api/applicants/{id}` | Soft delete by ID |

### 🛡️ ADMIN Operations
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/applicants/admin/expired-deleted` | Get expired deleted applicants |
| `DELETE` | `/api/applicants/admin/cleanup-expired` | Cleanup expired applicants |

---

## 📖 Detailed Endpoint Documentation

### 🟢 CREATE

#### Create Applicant
```http
POST /api/applicants
```
**Request Body:** `Applicant` (JSON)
**Response:** `ApplicantDetailDto`
**Status:** `201 Created`

---

### 🔵 READ

#### Get All Applicants
```http
GET /api/applicants
```
**Response:** `List<ApplicantListItemDto>`
**Status:** `200 OK`

#### Get Paginated Applicants
```http
GET /api/applicants/paginated?page=0&size=20&sort=id,desc
```
**Query Parameters:**
- `page` (optional): Page number (default: 0)
- `size` (optional): Page size (default: 20)
- `sort` (optional): Sort criteria (e.g., `id,desc`)

**Response:** `Page<ApplicantListItemDto>`
**Status:** `200 OK`

#### Get Applicant by ID
```http
GET /api/applicants/{id}
```
**Path Parameters:**
- `id`: Long - Applicant ID

**Response:** `ApplicantDetailDto`
**Status:** `200 OK` | `404 Not Found`

#### Get Applicant by Email
```http
GET /api/applicants/email/{email}
```
**Path Parameters:**
- `email`: String - Applicant email

**Response:** `ApplicantDetailDto`
**Status:** `200 OK` | `404 Not Found`

#### Filter by Language
```http
GET /api/applicants/language/{language}
```
**Path Parameters:**
- `language`: Language enum (`SPANISH` | `ENGLISH` | `CATALAN`)

**Response:** `List<ApplicantListItemDto>`
**Status:** `200 OK`

#### Filter by Mentor
```http
GET /api/applicants/mentor/{mentor}
```
**Path Parameters:**
- `mentor`: Boolean - true for mentors, false for regular applicants

**Response:** `List<ApplicantListItemDto>`
**Status:** `200 OK`

#### Get Pending Applicants
```http
GET /api/applicants/pending
```
**Response:** `List<ApplicantListItemDto>`
**Status:** `200 OK`
**Description:** Returns applicants who haven't been converted to users yet

#### Get Available Roles
```http
GET /api/applicants/roles/available
```
**Response:** `List<String>`
**Status:** `200 OK`

#### Check Email Exists
```http
GET /api/applicants/exists?email=user@example.com
```
**Query Parameters:**
- `email`: String - Email to check

**Response:** `Boolean`
**Status:** `200 OK`

---

### 📊 COUNT Operations

#### Get Total Count
```http
GET /api/applicants/count
```
**Response:** `Long`
**Status:** `200 OK`

#### Count by Language
```http
GET /api/applicants/count/language/{language}
```
**Path Parameters:**
- `language`: Language enum

**Response:** `Long`
**Status:** `200 OK`

#### Count by Mentor
```http
GET /api/applicants/count/mentor/{mentor}
```
**Path Parameters:**
- `mentor`: Boolean

**Response:** `Long`
**Status:** `200 OK`

---

### 🔶 UPDATE Operations

#### Update by ID
```http
PUT /api/applicants/{id}
```
**Path Parameters:**
- `id`: Long - Applicant ID

**Request Body:** `Applicant` (JSON)
**Response:** `ApplicantDetailDto`
**Status:** `200 OK`

#### Update by Email
```http
PUT /api/applicants/email/{email}
```
**Path Parameters:**
- `email`: String - Applicant email

**Request Body:** `Applicant` (JSON)
**Response:** `ApplicantDetailDto`
**Status:** `200 OK`

#### Restore Applicant
```http
PUT /api/applicants/restore/email/{email}
```
**Path Parameters:**
- `email`: String - Applicant email

**Response:** `ApplicantDetailDto`
**Status:** `200 OK`

#### Convert to User
```http
PUT /api/applicants/{id}/convert-to-user?userId={userId}
```
**Path Parameters:**
- `id`: Long - Applicant ID

**Query Parameters:**
- `userId`: Long - User ID to associate

**Response:** `ApplicantDetailDto`
**Status:** `200 OK`

---

### 🔴 DELETE Operations

#### Delete by Email
```http
DELETE /api/applicants/email/{email}
```
**Path Parameters:**
- `email`: String - Applicant email

**Response:** `Void`
**Status:** `204 No Content`
**Note:** Performs soft delete

#### Delete by ID
```http
DELETE /api/applicants/{id}
```
**Path Parameters:**
- `id`: Long - Applicant ID

**Response:** `Void`
**Status:** `204 No Content`
**Note:** Performs soft delete

---

### 🛡️ ADMIN Operations

#### Get Expired Deleted Applicants
```http
GET /api/applicants/admin/expired-deleted
```
**Response:** `List<ApplicantListItemDto>`
**Status:** `200 OK`
**Access:** Admin only

#### Cleanup Expired Applicants
```http
DELETE /api/applicants/admin/cleanup-expired
```
**Response:** `Integer` (number of cleaned up applicants)
**Status:** `200 OK`
**Access:** Admin only

---

## 🏗️ Data Transfer Objects (DTOs)

### ApplicantListItemDto
```typescript
interface ApplicantListItemDto {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  language: 'SPANISH' | 'ENGLISH' | 'CATALAN';
  mentor: boolean;
  roles: string[];
  timestamp: string;
  userId?: number; // null if not converted to user
}
```

### ApplicantDetailDto
```typescript
interface ApplicantDetailDto {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  language: 'SPANISH' | 'ENGLISH' | 'CATALAN';
  mentor: boolean;
  roles: string[];
  timestamp: string;
  userId?: number;
  // Additional detail fields may be present
}
```

---

## 🔍 Current Frontend Implementation Status

### ✅ Currently Implemented
- `GET /api/applicants` - Used in `useApplicants` hook

### ❌ Not Yet Implemented
- `GET /api/applicants/paginated` - Could improve performance for large datasets
- `GET /api/applicants/{id}` - For individual applicant details
- `GET /api/applicants/pending` - More efficient than client-side filtering
- `GET /api/applicants/roles/available` - For dynamic role options
- `PUT /api/applicants/{id}` - For editing functionality
- `PUT /api/applicants/{id}/convert-to-user` - For user conversion
- `DELETE /api/applicants/{id}` - For delete functionality
- Count endpoints - For accurate statistics
- Language/Mentor filtering endpoints - More efficient filtering

---

## 🎯 Recommended Next Steps

1. **Implement pagination** for better performance with large datasets
2. **Add edit functionality** using PUT endpoints
3. **Add delete functionality** using DELETE endpoints  
4. **Add user conversion** functionality
5. **Use count endpoints** for accurate statistics instead of client-side counting
6. **Add role management** using available roles endpoint
7. **Implement server-side filtering** for better performance

---

## 🏗️ Business Logic Details (from Service Layer)

### � Key Business Rules

#### Soft Delete System
- All delete operations are **soft deletes** (sets `deleted = true`, `deletedAt = timestamp`)
- Deleted applicants are kept for **7 days** before permanent cleanup
- All queries automatically filter out deleted records (`deleted = false`)

#### User Conversion Process
- Applicants can be converted to users via `convertToUser(applicantId, userId)`
- Once converted, `userId` field is populated (no longer null)
- **Pending applicants** = `userId IS NULL AND deleted = false`
- **Registered applicants** = `userId IS NOT NULL`

#### Email Validation
- Email must be unique across **all applicants** (including deleted ones)
- Email changes validate against existing emails
- Duplicate emails throw `EmailAlreadyExistsException`

#### Automatic Cleanup
- Applicants deleted > 7 days ago can be permanently removed
- Admin endpoint `/admin/cleanup-expired` performs batch cleanup
- Returns count of permanently deleted records

### 🔄 State Management

```
┌─────────────┐    create()    ┌──────────────┐
│   NONE      │──────────────→ │   ACTIVE     │
└─────────────┘                │ (deleted=F)  │
                                │ (userId=null)│
                                └──────┬───────┘
                                       │
                                       │ convertToUser()
                                       ▼
                                ┌──────────────┐
                                │  CONVERTED   │
                                │ (deleted=F)  │
                                │ (userId=123) │
                                └──────┬───────┘
                                       │
                                       │ delete()
                                       ▼
                                ┌──────────────┐    cleanup (7d)    ┌─────────────┐
                                │ SOFT DELETED │──────────────────→ │  PURGED     │
                                │ (deleted=T)  │                    │ (permanent) │
                                │ (deletedAt)  │                    └─────────────┘
                                └──────────────┘
                                       ▲
                                       │ restore()
                                       ▼
                                ┌──────────────┐
                                │   RESTORED   │
                                │ (deleted=F)  │
                                │ (deletedAt=) │
                                └──────────────┘
```

---

## 🔍 Current Frontend Implementation Analysis

### ✅ Currently Implemented in Frontend
```typescript
// In useApplicants.ts
const response = await fetch(`${API_BASE}/api/applicants`, {
  headers: { 'Authorization': `Basic ${credentials}` }
});
```

### ❌ Missing High-Priority Implementations

#### 1. **Statistics with Server-Side Counts**
```typescript
// Current: Client-side counting (inefficient)
const stats = useMemo(() => ({
  total: applicants.length,
  pending: applicants.filter(a => !a.userId).length,
  converted: applicants.filter(a => a.userId).length,
  mentors: applicants.filter(a => a.mentor).length
}), [applicants]);

// Should be: Server-side counts
const useApplicantStats = () => {
  // GET /api/applicants/count
  // GET /api/applicants/count/mentor/true
  // Etc...
};
```

#### 2. **CRUD Operations**
```typescript
// Missing: Individual applicant operations
const useApplicantCRUD = () => {
  const getById = (id: number) => // GET /api/applicants/{id}
  const update = (id: number, data: Applicant) => // PUT /api/applicants/{id}
  const delete = (id: number) => // DELETE /api/applicants/{id}
  const convertToUser = (id: number, userId: number) => // PUT /api/applicants/{id}/convert-to-user
};
```

#### 3. **Server-Side Filtering**
```typescript
// Current: Client-side filtering
const filteredApplicants = useMemo(() => {
  return applicants.filter(applicant => {
    // Complex filtering logic...
  });
}, [applicants, searchTerm, activeTab]);

// Should be: Server-side filtering
const getPendingApplicants = () => // GET /api/applicants/pending
const getByLanguage = (lang: Language) => // GET /api/applicants/language/{language}
const getByMentor = (isMentor: boolean) => // GET /api/applicants/mentor/{mentor}
```

#### 4. **Pagination Support**
```typescript
// Missing: Pagination for large datasets
const useApplicantsPaginated = (page: number, size: number) => {
  // GET /api/applicants/paginated?page={page}&size={size}&sort=id,desc
};
```

---

## 🎯 Implementation Priority

### Priority 1: Statistics Enhancement
Replace client-side counting with server-side endpoints for accurate, real-time statistics.

### Priority 2: CRUD Operations
Implement edit, delete, and user conversion functionality.

### Priority 3: Server-Side Filtering
Move filtering to server for better performance and accuracy.

### Priority 4: Pagination
Add pagination support for better performance with large datasets.

---

## 💻 Proposed Frontend Enhancements

### Enhanced API Client
```typescript
// src/features/applicants/api/applicants.api.ts
export class ApplicantAPI {
  
  // Statistics
  static async getTotalCount(): Promise<number> {
    return this.get<number>('/api/applicants/count');
  }
  
  static async getCountByMentor(mentor: boolean): Promise<number> {
    return this.get<number>(`/api/applicants/count/mentor/${mentor}`);
  }
  
  // CRUD
  static async getById(id: number): Promise<ApplicantDetailDto> {
    return this.get<ApplicantDetailDto>(`/api/applicants/${id}`);
  }
  
  static async update(id: number, applicant: Applicant): Promise<ApplicantDetailDto> {
    return this.put<ApplicantDetailDto>(`/api/applicants/${id}`, applicant);
  }
  
  static async delete(id: number): Promise<void> {
    return this.delete(`/api/applicants/${id}`);
  }
  
  static async convertToUser(id: number, userId: number): Promise<ApplicantDetailDto> {
    return this.put<ApplicantDetailDto>(`/api/applicants/${id}/convert-to-user?userId=${userId}`);
  }
  
  // Filtering
  static async getPendingApplicants(): Promise<ApplicantListItemDto[]> {
    return this.get<ApplicantListItemDto[]>('/api/applicants/pending');
  }
  
  // Pagination
  static async getPaginated(page: number, size: number): Promise<Page<ApplicantListItemDto>> {
    return this.get<Page<ApplicantListItemDto>>(`/api/applicants/paginated?page=${page}&size=${size}&sort=id,desc`);
  }
}
```

### New Custom Hooks
```typescript
// useApplicantStats.ts - Server-side statistics
const useApplicantStats = () => {
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    converted: 0,
    mentors: 0
  });
  
  // Fetch from server endpoints...
};

// useApplicantCRUD.ts - Individual operations
const useApplicantCRUD = () => {
  const update = async (id: number, data: Applicant) => { /* ... */ };
  const delete = async (id: number) => { /* ... */ };
  const convertToUser = async (id: number, userId: number) => { /* ... */ };
  
  return { update, delete, convertToUser };
};
```

---

## 🚀 Next Steps Recommendation

1. **Update TypeScript types** to match exact DTOs from Java
2. **Implement server-side statistics** for better performance  
3. **Add CRUD operations** (edit/delete functionality in UI)
4. **Add user conversion feature** 
5. **Implement server-side filtering** for better performance
6. **Add pagination support** for scalability

Would you like me to start implementing any of these enhancements? Which would you like to tackle first?
