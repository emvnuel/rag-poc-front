# Data Model: RAG Knowledge Platform

**Feature**: RAG Knowledge Platform  
**Branch**: 001-rag-knowledge-platform  
**Date**: 2025-11-15

## Overview

Frontend data model and TypeScript interfaces for the RAG Knowledge Platform. This document defines the shape of data flowing through the React application, derived from the backend OpenAPI specification and feature requirements.

## Core Entities

### 1. Project (Workspace)

Represents a workspace where documents and chats are isolated.

```typescript
interface Project {
  id: string; // UUID format
  name: string; // Min 1 char, non-empty pattern
  createdAt: string; // ISO 8601 date-time
  updatedAt: string; // ISO 8601 date-time
  documentCount: number; // Total documents in project
}

// API Request/Response types
interface ProjectCreateRequest {
  name: string; // Required, non-empty
}

interface ProjectUpdateRequest {
  name: string; // Required, non-empty
}

type ProjectListResponse = Project[];
```

**Validation Rules**:
- `name`: Required, must match pattern `\S` (non-empty string)
- `id`: UUID v4 format
- `documentCount`: Read-only, computed by backend

**State Management**:
- Cached in React Query with 5min stale time
- Invalidated on create/update/delete
- Selected project stored in Context API for workspace switching

**UI Representation**:
- Project card in dashboard
- Dropdown selector in header
- Create/edit modal forms

---

### 2. Document

Represents an uploaded file, text snippet, or website in a project.

```typescript
enum DocumentType {
  FILE = 'FILE',
  TEXT = 'TEXT',
  WEBSITE = 'WEBSITE'
}

enum DocumentStatus {
  NOT_PROCESSED = 'NOT_PROCESSED',
  PROCESSING = 'PROCESSING',
  PROCESSED = 'PROCESSED'
}

interface Document {
  id: string; // UUID format
  type: DocumentType;
  status: DocumentStatus;
  fileName: string;
  metadata: string; // JSON string, parse as needed
  createdAt: string; // ISO 8601 date-time
  updatedAt: string; // ISO 8601 date-time
}

// Upload request types
interface FileUploadRequest {
  file: File; // Browser File object
  projectId: string; // UUID
}

interface TextRequest {
  text: string; // Min length 1
  projectId: string; // UUID
}

interface WebsiteRequest {
  url: string; // Min length 1, valid URL
  projectId: string; // UUID
}

// Progress tracking
interface DocumentProgress {
  progressPercentage: number; // 0.0 to 100.0
}

type DocumentListResponse = Document[];
```

**Validation Rules**:
- `fileName`: Display name for document
- `type`: One of FILE, TEXT, WEBSITE
- `status`: Tracks processing state
- `metadata`: JSON string (needs parsing), contains file size, page count, etc.
- `projectId`: Required for all operations, ensures workspace isolation

**State Management**:
- Document list cached per project (2min stale time)
- Poll for progress during PROCESSING status (every 2s)
- Invalidate on upload/delete
- Document content cached separately (10min stale time)

**UI Representation**:
- Document card with type icon and status badge
- Upload progress bar during processing
- Document detail modal with metadata
- Search/filter/sort controls

**Processing Flow**:
1. Upload document → status: NOT_PROCESSED
2. Backend processes → status: PROCESSING (poll for progress)
3. Processing complete → status: PROCESSED
4. Ready for queries

---

### 3. Chat Message

Represents a single message in a chat session.

```typescript
interface ChatMessage {
  role: string; // 'user' | 'assistant'
  content: string;
}

interface ChatRequest {
  projectId: string; // UUID, required
  message: string; // Required, non-empty pattern \S
  history?: ChatMessage[]; // Optional conversation context
}

interface SearchResult {
  id: string; // UUID - document chunk ID
  chunkText: string; // Excerpt from document
  chunkIndex: number; // Position in document
  source: string; // Document name/path
  distance: number; // Similarity score (lower = more relevant)
}

interface ChatResponse {
  response: string; // AI-generated answer
  messages: ChatMessage[]; // Updated conversation history
  sources: SearchResult[]; // Source citations
  model: string; // LLM model used
  totalDuration: number; // Milliseconds
  promptEvalCount: number; // Tokens in prompt
  evalCount: number; // Tokens in response
}
```

**Validation Rules**:
- `message`: Required, non-empty (pattern `\S`)
- `projectId`: Required, ensures workspace isolation
- `history`: Optional, for follow-up context
- `sources`: Array of citations, may be empty

**State Management**:
- Chat sessions stored in React Query cache (1min stale time)
- Optimistic updates for user messages
- New sessions created per project
- History maintained client-side for context window

**UI Representation**:
- Chat interface with message bubbles
- User messages right-aligned
- Assistant messages left-aligned with sources
- Source citations as expandable cards
- Loading indicator during API call
- Token usage and model info in footer

**Conversation Flow**:
1. User sends message
2. Include previous `messages` as `history`
3. Backend returns `response` with updated `messages` array
4. Display sources as citations
5. Store updated `messages` for next request

---

### 4. Search

Direct document search without chat interface.

```typescript
interface SearchRequest {
  query: string; // Required, non-empty pattern \S
  projectId: string; // UUID, required
}

interface SearchResponse {
  results: SearchResult[]; // Array of matching document chunks
}
```

**Validation Rules**:
- `query`: Required, non-empty
- `projectId`: Required, workspace isolation

**State Management**:
- Search results not cached (fresh on every query)
- Debounce search input (300ms)

**UI Representation**:
- Search bar with instant feedback
- Results list with highlighting
- Click to view document context
- Used in document management page

---

## Derived/Computed Types

### UI State Types

```typescript
// Workspace context
interface WorkspaceContext {
  currentProject: Project | null;
  setCurrentProject: (project: Project | null) => void;
}

// Theme context
interface ThemeContext {
  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
}

// Upload tracking
interface UploadProgress {
  documentId: string;
  fileName: string;
  progress: number; // 0-100
  status: 'uploading' | 'processing' | 'complete' | 'error';
  error?: string;
}

// Chat session
interface ChatSession {
  id: string; // Client-side generated UUID
  projectId: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

// Pagination
interface PaginatedResponse<T> {
  data: T[];
  page: number;
  pageSize: number;
  total: number;
  hasMore: boolean;
}

// Sorting/Filtering
interface DocumentFilters {
  type?: DocumentType;
  status?: DocumentStatus;
  searchQuery?: string;
  sortBy: 'name' | 'date' | 'size';
  sortOrder: 'asc' | 'desc';
}
```

---

## Validation Schemas (Zod)

```typescript
import { z } from 'zod';

// Project validation
export const projectCreateSchema = z.object({
  name: z.string().min(1, 'Project name is required').regex(/\S/, 'Project name cannot be empty')
});

export const projectUpdateSchema = projectCreateSchema;

// Document upload validation
export const fileUploadSchema = z.object({
  file: z.instanceof(File)
    .refine((file) => file.size <= 25 * 1024 * 1024, 'File size must be less than 25MB')
    .refine(
      (file) => ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain', 'text/markdown'].includes(file.type),
      'File type must be PDF, DOCX, TXT, or MD'
    ),
  projectId: z.string().uuid('Invalid project ID')
});

export const textRequestSchema = z.object({
  text: z.string().min(1, 'Text cannot be empty'),
  projectId: z.string().uuid('Invalid project ID')
});

export const websiteRequestSchema = z.object({
  url: z.string().url('Invalid URL').min(1, 'URL cannot be empty'),
  projectId: z.string().uuid('Invalid project ID')
});

// Chat validation
export const chatMessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string()
});

export const chatRequestSchema = z.object({
  projectId: z.string().uuid('Invalid project ID'),
  message: z.string().min(1, 'Message cannot be empty').regex(/\S/, 'Message cannot be only whitespace'),
  history: z.array(chatMessageSchema).optional()
});

// Search validation
export const searchRequestSchema = z.object({
  query: z.string().min(1, 'Search query cannot be empty').regex(/\S/, 'Search query cannot be only whitespace'),
  projectId: z.string().uuid('Invalid project ID')
});
```

---

## State Management Architecture

### React Query Keys

```typescript
// Query key factory for type safety
export const queryKeys = {
  projects: {
    all: ['projects'] as const,
    detail: (id: string) => ['projects', id] as const,
    documents: (id: string) => ['projects', id, 'documents'] as const
  },
  documents: {
    detail: (id: string) => ['documents', id] as const,
    content: (id: string) => ['documents', id, 'content'] as const,
    progress: (id: string) => ['documents', id, 'progress'] as const
  },
  chat: {
    session: (projectId: string, sessionId: string) => ['chat', projectId, sessionId] as const
  },
  search: {
    results: (projectId: string, query: string) => ['search', projectId, query] as const
  }
};
```

### Context Structure

```typescript
// Workspace context provider
interface WorkspaceProviderProps {
  children: React.ReactNode;
}

// Theme provider (using next-themes)
interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: 'light' | 'dark' | 'system';
  storageKey?: string;
}
```

---

## Data Flow Patterns

### 1. Project Selection Flow
```
User clicks project → 
  Update WorkspaceContext → 
  Trigger document list query → 
  Update URL (/projects/:id) → 
  Render project workspace
```

### 2. Document Upload Flow
```
User selects file → 
  Client-side validation (type, size) → 
  Optimistic UI update (show progress) → 
  API upload with progress tracking → 
  Poll for processing status → 
  Invalidate document list query → 
  Show success notification
```

### 3. Chat Message Flow
```
User types message → 
  Debounce input → 
  Client-side validation → 
  Optimistic update (show user message) → 
  API request with history → 
  Stream or wait for response → 
  Update messages array → 
  Display sources → 
  Store session in cache
```

### 4. Search Flow
```
User types query → 
  Debounce 300ms → 
  Client-side validation → 
  API request → 
  Display results → 
  No caching (fresh on each query)
```

---

## Error Handling

### Error Types

```typescript
interface ApiError {
  status: number;
  message: string;
  code?: string;
  details?: Record<string, any>;
}

interface ValidationError {
  field: string;
  message: string;
}

// Mapped error messages for user-friendly display
const errorMessages: Record<number, string> = {
  400: 'Invalid request. Please check your input.',
  401: 'You are not authenticated. Please log in.',
  403: 'You do not have permission to perform this action.',
  404: 'The requested resource was not found.',
  413: 'File size exceeds the maximum allowed (25MB).',
  429: 'Too many requests. Please try again later.',
  500: 'An unexpected error occurred. Please try again.',
  503: 'Service is temporarily unavailable. Please try again later.'
};
```

---

## Relationships and Constraints

### Entity Relationships

```
User (future)
  ↓ 1:N
Project
  ↓ 1:N
Document
  ↓ N:N (through SearchResult)
Chat Session
  ↓ 1:N
ChatMessage
  ↓ N:N (through sources)
SearchResult → Document Chunks
```

### Workspace Isolation Constraints

- **Project**: Top-level isolation boundary
- **Documents**: Always scoped to projectId
- **Chats**: Always scoped to projectId
- **Search**: Always scoped to projectId
- **Cross-workspace queries**: Prevented by API (projectId required)

### Performance Constraints

- **Chat history**: Limit to last 10 messages for context window
- **Document list**: Paginate at 50 documents per page
- **Search results**: Limit to 20 results
- **Upload concurrency**: Max 3 parallel uploads

---

## Type Generation

Types will be generated from OpenAPI spec using:

```bash
npx @hey-api/openapi-ts -i http://localhost:42069/openapi.json -o src/services/api/generated
```

This ensures:
- Type safety from API to UI
- Automatic updates when API changes
- No manual type maintenance
- IntelliSense support in IDE
