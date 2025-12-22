/**
 * Authentication context and provider for React components.
 *
 * Provides authentication state and actions to the component tree
 * via React Context. Uses the AuthService singleton for actual
 * authentication logic.
 */

import {
  createContext,
  useReducer,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react'
import { authService } from './services/auth-service'
import type {
  AuthState,
  AuthAction,
  AuthContextValue,
  LoginCredentials,
} from './types/auth.types'

// ============================================
// CONTEXT
// ============================================

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

// ============================================
// REDUCER
// ============================================

const initialState: AuthState = {
  isAuthenticated: false,
  isLoading: true, // Start loading to check for existing session
  user: null,
  error: null,
}

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'LOGIN_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      }
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        isAuthenticated: true,
        isLoading: false,
        user: action.payload,
        error: null,
      }
    case 'LOGIN_FAILURE':
      return {
        ...state,
        isAuthenticated: false,
        isLoading: false,
        user: null,
        error: action.payload,
      }
    case 'LOGOUT':
      return {
        ...state,
        isAuthenticated: false,
        isLoading: false,
        user: null,
        error: null,
      }
    case 'RESTORE_SESSION':
      return {
        ...state,
        isAuthenticated: true,
        isLoading: false,
        user: action.payload,
        error: null,
      }
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      }
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      }
    default:
      return state
  }
}

// ============================================
// PROVIDER
// ============================================

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, dispatch] = useReducer(authReducer, initialState)

  // Restore session on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        const user = await authService.restoreSession()
        if (user) {
          dispatch({ type: 'RESTORE_SESSION', payload: user })
        } else {
          dispatch({ type: 'SET_LOADING', payload: false })
        }
      } catch (error) {
        console.error('Failed to restore session:', error)
        dispatch({ type: 'SET_LOADING', payload: false })
      }
    }

    initAuth()
  }, [])

  // Login action
  const login = useCallback(async (credentials: LoginCredentials): Promise<void> => {
    dispatch({ type: 'LOGIN_START' })

    try {
      const user = await authService.login(credentials)
      dispatch({ type: 'LOGIN_SUCCESS', payload: user })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed'
      dispatch({ type: 'LOGIN_FAILURE', payload: message })
      throw error
    }
  }, [])

  // Logout action
  const logout = useCallback((): void => {
    authService.logout()
    dispatch({ type: 'LOGOUT' })
  }, [])

  // Role checking
  const hasRole = useCallback((role: string): boolean => {
    return authService.hasRole(role)
  }, [])

  const isAdmin = useCallback((): boolean => {
    return authService.isAdmin()
  }, [])

  // Clear error
  const clearError = useCallback((): void => {
    dispatch({ type: 'CLEAR_ERROR' })
  }, [])

  const value: AuthContextValue = {
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    user: state.user,
    error: state.error,
    login,
    logout,
    hasRole,
    isAdmin,
    clearError,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// Export context for use in useAuth hook
export { AuthContext }
