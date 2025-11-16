/**
 * Document types supported by the platform
 */
export type DocumentType = 'FILE' | 'TEXT' | 'WEBSITE'

/**
 * Document processing status
 */
export type DocumentStatus = 'NOT_PROCESSED' | 'PROCESSING' | 'PROCESSED'

/**
 * Document entity representing an uploaded file, text snippet, or website
 */
export interface Document {
  id: string // UUID format
  type: DocumentType
  status: DocumentStatus
  fileName: string
  metadata: string // JSON string, parse as needed
  createdAt: string // ISO 8601 date-time
  updatedAt: string // ISO 8601 date-time
}

/**
 * Request payload for uploading a file
 */
export interface FileUploadRequest {
  file: File // Browser File object
  projectId: string // UUID
}

/**
 * Request payload for processing text
 */
export interface TextRequest {
  text: string // Min length 1
  projectId: string // UUID
}

/**
 * Request payload for processing a website
 */
export interface WebsiteRequest {
  url: string // Min length 1, valid URL
  projectId: string // UUID
}

/**
 * Document processing progress
 */
export interface DocumentProgress {
  progressPercentage: number // 0.0 to 100.0
}

/**
 * API response type for list of documents
 */
export type DocumentListResponse = Document[]
