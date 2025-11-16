# API Contracts

**Feature**: RAG Knowledge Platform  
**Branch**: 001-rag-knowledge-platform  
**Date**: 2025-11-15

## Overview

API contract definitions for the RAG Knowledge Platform frontend. This document specifies the HTTP endpoints, request/response formats, and client-side integration patterns.

**Base URL**: `http://localhost:42069`  
**API Version**: 1.0.0  
**OpenAPI Spec**: Available at backend server

---

## API Endpoints

### Project Resources

#### 1. Get All Projects

**Endpoint**: `GET /projects`  
**Description**: Retrieve list of all projects (workspaces)  
**Authentication**: Required (future)  
**Request**: None

**Response**: `200 OK`
```typescript
ProjectInfoResponse[]

interface ProjectInfoResponse {
  id: string; // UUID
  name: string;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
  documentCount: number;
}
```

**Frontend Integration**:
```typescript
// React Query hook
const useProjects = () => {
  return useQuery({
    queryKey: queryKeys.projects.all,
    queryFn: () => api.projects.getAll(),
    staleTime: 5 * 60 * 1000 // 5 minutes
  });
};
```

---

#### 2. Create Project

**Endpoint**: `POST /projects`  
**Description**: Create a new project/workspace  
**Authentication**: Required (future)

**Request Body**: `application/json`
```typescript
ProjectCreateRequest

interface ProjectCreateRequest {
  name: string; // Required, pattern: \S (non-empty)
}
```

**Response**: `200 OK`
```typescript
ProjectInfoResponse
```

**Error**: `400 Bad Request` - Invalid name

**Frontend Integration**:
```typescript
const useCreateProject = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: ProjectCreateRequest) => api.projects.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.all });
    }
  });
};
```

---

#### 3. Get Project By ID

**Endpoint**: `GET /projects/{id}`  
**Description**: Get a single project's details  
**Authentication**: Required (future)

**Path Parameters**:
- `id`: string (UUID)

**Response**: `200 OK`
```typescript
ProjectInfoResponse
```

**Frontend Integration**:
```typescript
const useProject = (id: string) => {
  return useQuery({
    queryKey: queryKeys.projects.detail(id),
    queryFn: () => api.projects.getById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000
  });
};
```

---

#### 4. Update Project

**Endpoint**: `PUT /projects/{id}`  
**Description**: Update project name  
**Authentication**: Required (future)

**Path Parameters**:
- `id`: string (UUID)

**Request Body**: `application/json`
```typescript
ProjectUpdateRequest

interface ProjectUpdateRequest {
  name: string; // Required, pattern: \S
}
```

**Response**: `200 OK`
```typescript
ProjectInfoResponse
```

**Error**: `400 Bad Request` - Invalid name

**Frontend Integration**:
```typescript
const useUpdateProject = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ProjectUpdateRequest }) => 
      api.projects.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.all });
    }
  });
};
```

---

#### 5. Delete Project

**Endpoint**: `DELETE /projects/{id}`  
**Description**: Delete a project and all associated data  
**Authentication**: Required (future)

**Path Parameters**:
- `id`: string (UUID)

**Response**: `200 OK` (no content)

**Frontend Integration**:
```typescript
const useDeleteProject = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => api.projects.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.all });
    }
  });
};
```

---

#### 6. Get Project Documents

**Endpoint**: `GET /projects/{id}/documents`  
**Description**: Get all documents in a project  
**Authentication**: Required (future)

**Path Parameters**:
- `id`: string (UUID) - Project ID

**Response**: `200 OK`
```typescript
DocumentInfoResponse[]

interface DocumentInfoResponse {
  id: string; // UUID
  type: DocumentType; // FILE | TEXT | WEBSITE
  status: DocumentStatus; // NOT_PROCESSED | PROCESSING | PROCESSED
  fileName: string;
  metadata: string; // JSON string
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}
```

**Frontend Integration**:
```typescript
const useProjectDocuments = (projectId: string) => {
  return useQuery({
    queryKey: queryKeys.projects.documents(projectId),
    queryFn: () => api.projects.getDocuments(projectId),
    enabled: !!projectId,
    staleTime: 2 * 60 * 1000 // 2 minutes
  });
};
```

---

### Document Resources

#### 7. Upload File

**Endpoint**: `POST /documents/files`  
**Description**: Upload a document file (PDF, DOCX, TXT, MD)  
**Authentication**: Required (future)

**Request Body**: `multipart/form-data`
```typescript
{
  file: File; // Binary file data
  projectId: string; // UUID
}
```

**Response**: `200 OK` (Document created, processing begins)

**Frontend Integration**:
```typescript
const useUploadFile = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ file, projectId }: { file: File; projectId: string }) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('projectId', projectId);
      return api.documents.uploadFile(formData);
    },
    onSuccess: (_, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.documents(projectId) });
    }
  });
};

// With progress tracking
const useUploadFileWithProgress = () => {
  const [progress, setProgress] = useState(0);
  
  const uploadFile = async (file: File, projectId: string) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('projectId', projectId);
    
    return axios.post('/documents/files', formData, {
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / (progressEvent.total || 1)
        );
        setProgress(percentCompleted);
      }
    });
  };
  
  return { uploadFile, progress };
};
```

---

#### 8. Process Text

**Endpoint**: `POST /documents/texts`  
**Description**: Add text directly without file upload  
**Authentication**: Required (future)

**Request Body**: `application/json`
```typescript
TextRequest

interface TextRequest {
  text: string; // Min length 1
  projectId: string; // UUID
}
```

**Response**: `200 OK`

**Error**: `400 Bad Request` - Invalid text or projectId

**Frontend Integration**:
```typescript
const useProcessText = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: TextRequest) => api.documents.processText(data),
    onSuccess: (_, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.documents(projectId) });
    }
  });
};
```

---

#### 9. Process Website

**Endpoint**: `POST /documents/websites`  
**Description**: Scrape and process a website URL  
**Authentication**: Required (future)

**Request Body**: `application/json`
```typescript
WebsiteRequest

interface WebsiteRequest {
  url: string; // Min length 1, valid URL
  projectId: string; // UUID
}
```

**Response**: `200 OK`

**Error**: `400 Bad Request` - Invalid URL or projectId

**Frontend Integration**:
```typescript
const useProcessWebsite = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: WebsiteRequest) => api.documents.processWebsite(data),
    onSuccess: (_, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.documents(projectId) });
    }
  });
};
```

---

#### 10. Get Document By ID

**Endpoint**: `GET /documents/{id}`  
**Description**: Get document metadata and status  
**Authentication**: Required (future)

**Path Parameters**:
- `id`: string (UUID)

**Response**: `200 OK`
```typescript
DocumentInfoResponse
```

**Frontend Integration**:
```typescript
const useDocument = (id: string) => {
  return useQuery({
    queryKey: queryKeys.documents.detail(id),
    queryFn: () => api.documents.getById(id),
    enabled: !!id
  });
};
```

---

#### 11. Get Document Content

**Endpoint**: `GET /documents/{id}/content`  
**Description**: Get extracted text content from document  
**Authentication**: Required (future)

**Path Parameters**:
- `id`: string (UUID)

**Response**: `200 OK`
```typescript
string // text/plain content
```

**Frontend Integration**:
```typescript
const useDocumentContent = (id: string) => {
  return useQuery({
    queryKey: queryKeys.documents.content(id),
    queryFn: () => api.documents.getContent(id),
    enabled: !!id,
    staleTime: 10 * 60 * 1000 // 10 minutes (content doesn't change)
  });
};
```

---

#### 12. Get Document Processing Progress

**Endpoint**: `GET /documents/{id}/progress`  
**Description**: Poll for document processing status  
**Authentication**: Required (future)

**Path Parameters**:
- `id`: string (UUID)

**Response**: `200 OK`
```typescript
DocumentProgressResponse

interface DocumentProgressResponse {
  progressPercentage: number; // 0.0 to 100.0
}
```

**Frontend Integration**:
```typescript
const useDocumentProgress = (id: string, enabled: boolean = false) => {
  return useQuery({
    queryKey: queryKeys.documents.progress(id),
    queryFn: () => api.documents.getProgress(id),
    enabled: enabled && !!id,
    refetchInterval: 2000, // Poll every 2 seconds
    refetchIntervalInBackground: false
  });
};

// Usage: Start polling when status is PROCESSING
const { data: document } = useDocument(id);
const { data: progress } = useDocumentProgress(
  id, 
  document?.status === 'PROCESSING'
);
```

---

#### 13. Search Documents

**Endpoint**: `POST /documents/search`  
**Description**: Search for relevant document chunks  
**Authentication**: Required (future)

**Request Body**: `application/json`
```typescript
SearchRequest

interface SearchRequest {
  query: string; // Required, pattern: \S
  projectId: string; // UUID
}
```

**Response**: `200 OK`
```typescript
SearchResponse

interface SearchResponse {
  results: SearchResult[];
}

interface SearchResult {
  id: string; // UUID - chunk ID
  chunkText: string;
  chunkIndex: number;
  source: string; // Document name
  distance: number; // Similarity score
}
```

**Error**: `400 Bad Request` - Invalid query or projectId

**Frontend Integration**:
```typescript
const useDocumentSearch = () => {
  return useMutation({
    mutationFn: (data: SearchRequest) => api.documents.search(data)
  });
};

// With debounce for search-as-you-type
const useSearchWithDebounce = (projectId: string) => {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 300);
  
  return useQuery({
    queryKey: queryKeys.search.results(projectId, debouncedQuery),
    queryFn: () => api.documents.search({ query: debouncedQuery, projectId }),
    enabled: !!projectId && debouncedQuery.length > 0,
    staleTime: 0 // Always fresh
  });
};
```

---

### Chat Resources

#### 14. Send Chat Message

**Endpoint**: `POST /chat`  
**Description**: Send a message and get AI response with sources  
**Authentication**: Required (future)

**Request Body**: `application/json`
```typescript
ChatRequest

interface ChatRequest {
  projectId: string; // UUID, required
  message: string; // Required, pattern: \S
  history?: ChatMessage[]; // Optional conversation context
}

interface ChatMessage {
  role: string; // 'user' | 'assistant'
  content: string;
}
```

**Response**: `200 OK`
```typescript
ChatResponse

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

**Error**: `400 Bad Request` - Invalid message or projectId

**Frontend Integration**:
```typescript
const useSendChatMessage = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: ChatRequest) => api.chat.send(data),
    onMutate: async (data) => {
      // Optimistic update: Add user message immediately
      const optimisticMessage: ChatMessage = {
        role: 'user',
        content: data.message
      };
      
      // Store optimistic update in cache
      queryClient.setQueryData(
        queryKeys.chat.session(data.projectId, 'current'),
        (old: ChatMessage[] = []) => [...old, optimisticMessage]
      );
      
      return { optimisticMessage };
    },
    onSuccess: (response, variables) => {
      // Update cache with real response
      queryClient.setQueryData(
        queryKeys.chat.session(variables.projectId, 'current'),
        response.messages
      );
    },
    onError: (_, variables, context) => {
      // Rollback optimistic update on error
      queryClient.setQueryData(
        queryKeys.chat.session(variables.projectId, 'current'),
        (old: ChatMessage[] = []) => 
          old.filter(msg => msg !== context?.optimisticMessage)
      );
    }
  });
};
```

---

## HTTP Client Configuration

### Axios Instance Setup

```typescript
// src/services/http/client.ts
import axios, { AxiosError, AxiosRequestConfig } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:42069';
const API_TIMEOUT = 10000; // 10 seconds default
const UPLOAD_TIMEOUT = 30000; // 30 seconds for file uploads

export const httpClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor: Add auth headers (future)
httpClient.interceptors.request.use(
  (config) => {
    // TODO: Add JWT token when auth is implemented
    // const token = getAuthToken();
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    
    // Increase timeout for file uploads
    if (config.data instanceof FormData) {
      config.timeout = UPLOAD_TIMEOUT;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor: Handle errors globally
httpClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // Handle specific error codes
    if (error.response?.status === 401) {
      // TODO: Redirect to login when auth is implemented
      console.error('Unauthorized access');
    }
    
    if (error.response?.status === 429) {
      // Rate limiting
      console.error('Too many requests. Please try again later.');
    }
    
    // Transform error for consistent handling
    const apiError: ApiError = {
      status: error.response?.status || 500,
      message: error.response?.data?.message || error.message || 'An unexpected error occurred',
      code: error.code,
      details: error.response?.data
    };
    
    return Promise.reject(apiError);
  }
);

export interface ApiError {
  status: number;
  message: string;
  code?: string;
  details?: any;
}
```

---

## Retry Logic

```typescript
// src/services/http/retry.ts
import { httpClient } from './client';
import type { AxiosRequestConfig } from 'axios';

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

export const retryableRequest = async <T>(
  config: AxiosRequestConfig,
  retries = MAX_RETRIES
): Promise<T> => {
  try {
    const response = await httpClient.request<T>(config);
    return response.data;
  } catch (error: any) {
    const shouldRetry = 
      retries > 0 && 
      error.status >= 500 && 
      config.method?.toUpperCase() === 'GET';
    
    if (shouldRetry) {
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      return retryableRequest<T>(config, retries - 1);
    }
    
    throw error;
  }
};
```

---

## Error Messages

```typescript
// src/lib/errors.ts
export const ERROR_MESSAGES: Record<number, string> = {
  400: 'Invalid request. Please check your input.',
  401: 'You need to log in to access this resource.',
  403: 'You do not have permission to perform this action.',
  404: 'The requested resource was not found.',
  413: 'File size exceeds the maximum allowed (25MB).',
  429: 'Too many requests. Please try again in a moment.',
  500: 'An unexpected error occurred. Please try again.',
  503: 'Service is temporarily unavailable. Please try again later.'
};

export const getErrorMessage = (status: number, defaultMessage?: string): string => {
  return ERROR_MESSAGES[status] || defaultMessage || ERROR_MESSAGES[500];
};
```

---

## Type Generation Command

```bash
# Generate TypeScript types from OpenAPI spec
npx @hey-api/openapi-ts \
  --input http://localhost:42069/openapi.json \
  --output src/services/api/generated \
  --client axios

# Or use openapi-typescript-codegen
npx openapi-typescript-codegen \
  --input http://localhost:42069/openapi.json \
  --output src/services/api/generated \
  --client axios
```

This generates:
- Type definitions for all schemas
- API client methods
- Request/response interfaces
- Enum types

---

## Integration Notes

1. **Type Safety**: All API calls typed from OpenAPI spec
2. **Caching**: React Query handles caching with custom stale times
3. **Error Handling**: Centralized in Axios interceptors
4. **Loading States**: React Query provides `isLoading`, `isFetching` automatically
5. **Optimistic Updates**: Implemented for chat and file uploads
6. **Retry Logic**: Automatic retries for GET requests on 5xx errors
7. **Progress Tracking**: Axios `onUploadProgress` for file uploads
8. **Authentication**: Prepared for JWT tokens (not yet implemented)
