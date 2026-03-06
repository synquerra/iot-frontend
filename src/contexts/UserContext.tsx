import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react"
import type { ReactNode } from "react"

import { loadUserContext, clearPersistedContext } from "../helpers/authResponseParser"
import { isTokenExpired } from "@/Pages/Auth/authService"

/* ================= TYPES ================= */

export type UserType = "PARENTS" | "ADMIN" | null

export interface Tokens {
  accessToken: string | null
  refreshToken: string | null
}

export interface UserContextState {
  isAuthenticated: boolean
  userType: UserType
  imeis: string[]
  uniqueId: string | null
  email: string | null
  firstName: string | null
  middleName: string | null
  lastName: string | null
  mobile: string | null
  tokens: Tokens
  isRestoring: boolean

  // Actions
  setUserContext: (context: ParsedAuthContext) => void
  updateTokens: (tokens: Tokens) => void
  clearUserContext: () => void

  // Helpers
  isAdmin: () => boolean
  isParent: () => boolean
}

export interface ParsedAuthContext {
  userType: Exclude<UserType, null>
  imeis?: string[]
  uniqueId: string
  email: string
  firstName?: string | null
  middleName?: string | null
  lastName?: string | null
  mobile?: string | null
  tokens: {
    accessToken: string
    refreshToken: string
  }
}

/* ================= INITIAL STATE ================= */

const initialState: Omit<UserContextState,
  "setUserContext" | "updateTokens" | "clearUserContext" | "isAdmin" | "isParent"
> = {
  isAuthenticated: false,
  userType: null,
  imeis: [],
  uniqueId: null,
  email: null,
  firstName: null,
  middleName: null,
  lastName: null,
  mobile: null,
  tokens: {
    accessToken: null,
    refreshToken: null,
  },
  isRestoring: true,
}

/* ================= CONTEXT ================= */

const UserContext = createContext<UserContextState | undefined>(undefined)

/* ================= PROVIDER ================= */

export const UserContextProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState(initialState)

  /* ---------- Set User Context ---------- */
  const setUserContext = useCallback((context: ParsedAuthContext) => {
    setState(prev => ({
      ...prev,
      isAuthenticated: true,
      userType: context.userType,
      imeis: context.imeis ?? [],
      uniqueId: context.uniqueId,
      email: context.email,
      firstName: context.firstName ?? null,
      middleName: context.middleName ?? null,
      lastName: context.lastName ?? null,
      mobile: context.mobile ?? null,
      tokens: {
        accessToken: context.tokens.accessToken,
        refreshToken: context.tokens.refreshToken,
      },
      isRestoring: false,
    }))
  }, [])

  /* ---------- Update Tokens ---------- */
  const updateTokens = useCallback((tokens: Tokens) => {
    setState(prev => ({
      ...prev,
      tokens,
    }))
  }, [])

  /* ---------- Clear User ---------- */
  const clearUserContext = useCallback(() => {
    setState({ ...initialState, isRestoring: false })
  }, [])

  /* ---------- Helpers ---------- */
  const isAdmin = useCallback(() => state.userType === "ADMIN", [state.userType])
  const isParent = useCallback(() => state.userType === "PARENTS", [state.userType])

  /* ---------- Restore on Mount ---------- */
  useEffect(() => {
    const restore = () => {
      try {
        const persisted = loadUserContext()

        if (!persisted) {
          setState(prev => ({ ...prev, isRestoring: false }))
          return
        }

        const accessToken = localStorage.getItem("accessToken")
        const refreshToken = localStorage.getItem("refreshToken")

        if (!accessToken || !refreshToken || isTokenExpired(accessToken)) {
          clearPersistedContext()
          localStorage.removeItem("accessToken")
          localStorage.removeItem("refreshToken")
          setState(prev => ({ ...prev, isRestoring: false }))
          return
        }

        setState({
          isAuthenticated: true,
          userType: persisted.userType,
          imeis: persisted.imeis ?? [],
          uniqueId: persisted.uniqueId,
          email: persisted.email,
          firstName: persisted.firstName ?? null,
          middleName: persisted.middleName ?? null,
          lastName: persisted.lastName ?? null,
          mobile: persisted.mobile ?? null,
          tokens: {
            accessToken,
            refreshToken,
          },
          isRestoring: false,
        })

      } catch (error) {
        console.error("Failed restoring user:", error)
        clearPersistedContext()
        localStorage.removeItem("accessToken")
        localStorage.removeItem("refreshToken")
        setState(prev => ({ ...prev, isRestoring: false }))
      }
    }

    restore()
  }, [])

  const value: UserContextState = {
    ...state,
    setUserContext,
    updateTokens,
    clearUserContext,
    isAdmin,
    isParent,
  }

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}

/* ================= HOOK ================= */

export const useUserContext = () => {
  const context = useContext(UserContext)

  if (!context) {
    throw new Error("useUserContext must be used within UserContextProvider")
  }

  return context
}

export default UserContext
