/**
 * Knowledge Graph types for document connections visualization
 */

/**
 * Node type in the knowledge graph
 */
export type NodeType = 'document' | 'concept' | 'entity';

/**
 * Connection strength between nodes
 */
export type ConnectionStrength = 'weak' | 'medium' | 'strong';

/**
 * Node in the knowledge graph representing a document or concept
 */
export interface GraphNode {
  /** Unique identifier for the node */
  id: string;
  /** Display label for the node */
  label: string;
  /** Type of node (document, concept, entity) */
  type: NodeType;
  /** Optional metadata about the node */
  metadata?: {
    /** Document ID if this is a document node */
    documentId?: string;
    /** Number of connections */
    connectionCount?: number;
    /** Additional properties */
    [key: string]: unknown;
  };
}

/**
 * Edge connecting two nodes in the knowledge graph
 */
export interface GraphEdge {
  /** Unique identifier for the edge */
  id: string;
  /** Source node ID */
  source: string;
  /** Target node ID */
  target: string;
  /** Connection strength */
  strength: ConnectionStrength;
  /** Optional label for the edge */
  label?: string;
  /** Similarity score (0-1) */
  weight?: number;
}

/**
 * Complete knowledge graph data structure
 */
export interface KnowledgeGraphData {
  /** All nodes in the graph */
  nodes: GraphNode[];
  /** All edges connecting nodes */
  edges: GraphEdge[];
}

/**
 * Filter options for knowledge graph visualization
 */
export interface GraphFilterOptions {
  /** Filter by node type */
  nodeTypes?: NodeType[];
  /** Minimum connection strength to display */
  minStrength?: ConnectionStrength;
  /** Search query to filter nodes */
  searchQuery?: string;
}
