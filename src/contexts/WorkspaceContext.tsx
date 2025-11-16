import { createContext, useState, useCallback, type ReactNode } from 'react'
import type { Project } from '@/types/project'

/**
 * Workspace context value interface
 */
export interface WorkspaceContextValue {
  currentProject: Project | null
  setCurrentProject: (project: Project | null) => void
  clearWorkspace: () => void
}

/**
 * Workspace context for managing current project selection
 */
// eslint-disable-next-line react-refresh/only-export-components
export const WorkspaceContext = createContext<WorkspaceContextValue | undefined>(
  undefined
)

/**
 * Workspace provider component
 */
export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [currentProject, setCurrentProjectState] = useState<Project | null>(null)

  const setCurrentProject = useCallback((project: Project | null) => {
    setCurrentProjectState(project)
  }, [])

  const clearWorkspace = useCallback(() => {
    setCurrentProjectState(null)
  }, [])

  return (
    <WorkspaceContext.Provider
      value={{ currentProject, setCurrentProject, clearWorkspace }}
    >
      {children}
    </WorkspaceContext.Provider>
  )
}
