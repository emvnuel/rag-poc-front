/**
 * Chat message role
 */
export type ChatMessageRole = 'user' | 'assistant'

/**
 * Individual chat message
 */
export interface ChatMessage {
  role: ChatMessageRole
  content: string
}

/**
 * Request payload for sending a chat message
 */
export interface ChatRequest {
  projectId: string // UUID, required
  message: string // Required, non-empty pattern \S
  history?: ChatMessage[] // Optional conversation context
}

/**
 * Search result representing a document chunk with similarity score
 */
export interface SearchResult {
  id: string // UUID - document chunk ID
  chunkText: string // Excerpt from document
  chunkIndex: number // Position in document
  source: string // Document name/path
  distance: number // Similarity score (lower = more relevant)
}

/**
 * Response payload for chat message with AI-generated answer
 */
export interface ChatResponse {
  response: string // AI-generated answer
  messages: ChatMessage[] // Updated conversation history
  sources: SearchResult[] // Source citations
  model: string // LLM model used
  totalDuration: number // Milliseconds
  promptEvalCount: number // Tokens in prompt
  evalCount: number // Tokens in response
}

/**
 * Request payload for searching documents
 */
export interface SearchRequest {
  query: string // Required, non-empty pattern \S
  projectId: string // UUID, required
}

/**
 * Response payload for document search
 */
export interface SearchResponse {
  results: SearchResult[]
}
