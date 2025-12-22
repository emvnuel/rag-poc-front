/**
 * Authentication context and provider using Keycloak adapter.
 */

import {
  createContext,
  useReducer,
  useEffect,
  useCallback,
  type ReactNode,
  useRef,
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
  isLoading: true,
  user: null,
  error: null,
}

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'LOGIN_START':
      return { ...state, isLoading: true, error: null }
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
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload }
    case 'CLEAR_ERROR':
      return { ...state, error: null }
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
  const isInitialized = useRef(false)

  // Initialize Keycloak on mount
  useEffect(() => {
    if (isInitialized.current) return
    isInitialized.current = true

    const initAuth = async () => {
      try {
        const authenticated = await authService.init()
        if (authenticated) {
          const user = authService.getUserInfo()
          dispatch({ type: 'RESTORE_SESSION', payload: user! })
        } else {
          dispatch({ type: 'SET_LOADING', payload: false })
        }
      } catch (error) {
        console.error('Failed to initialize Keycloak:', error)
         // Even on error, we stop loading to unblock UI (it will just be unauthenticated)
        dispatch({ type: 'SET_LOADING', payload: false })
      }
    }

    initAuth()
  }, [])

  // Login action (Redirects to Keycloak)
  // Note: We accept credentials to match interface but ignore them for PKCE redirect
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const login = useCallback(async (_credentials: LoginCredentials): Promise<void> => {
    dispatch({ type: 'LOGIN_START' })
    try {
      await authService.login()
      // Note: Code below this won't run due to redirect
    } catch (error) {
       const message = error instanceof Error ? error.message : 'Login failed'
       dispatch({ type: 'LOGIN_FAILURE', payload: message })
    }
  }, [])

  // Logout action
  const logout = useCallback(async (): Promise<void> => {
    await authService.logout()
    dispatch({ type: 'LOGOUT' })
  }, [])

  // Role checking (delegated to service)
  const hasRole = useCallback((role: string): boolean => {
    return authService.hasRole(role)
  }, [])

  const isAdmin = useCallback((): boolean => {
    return authService.isAdmin()
  }, [])

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

export { AuthContext }
