import { createContext } from "react"

import type { LoginCredentials } from "../types/auth"
import type { User } from "../types/user"

export interface AuthContextData {
    token: string | null
    user: User | null
    isAuthenticated: boolean
    isLoading: boolean
    login: (credentials: LoginCredentials) => Promise<void>
    logout: () => void
}

export const AuthContext = createContext<AuthContextData | undefined>(undefined)
