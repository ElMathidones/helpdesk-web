import { useEffect, useState, type ReactNode } from "react"

import { login as loginRequest } from "../services/auth"
import { getCurrentUser } from "../services/users"
import type { LoginCredentials } from "../types/auth"
import type { User } from "../types/user"
import { AuthContext } from "./AuthContext"

interface AuthProviderProps {
    children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
    const [token, setToken] = useState<string | null>(() =>
        localStorage.getItem("helpdesk_token"),
    )
    const [user, setUser] = useState<User | null>(null)
    const [isLoading, setIsLoading] = useState(Boolean(token))

    useEffect(() => {
        if (!token) {
        return
        }

        let isCancelled = false

        async function loadCurrentUser() {
        try {
            const currentUser = await getCurrentUser(token as string)

            if (!isCancelled) {
            setUser(currentUser)
            }
        } catch {
            if (!isCancelled) {
            localStorage.removeItem("helpdesk_token")
            setToken(null)
            setUser(null)
            }
        } finally {
            if (!isCancelled) {
            setIsLoading(false)
            }
        }
        }

        void loadCurrentUser()

        return () => {
        isCancelled = true
        }
    }, [token])

    async function login(credentials: LoginCredentials) {
        const response = await loginRequest(credentials)
        const currentUser = await getCurrentUser(response.access_token)

        localStorage.setItem("helpdesk_token", response.access_token)
        setToken(response.access_token)
        setUser(currentUser)
        setIsLoading(false)
    }

    function logout() {
        localStorage.removeItem("helpdesk_token")
        setToken(null)
        setUser(null)
        setIsLoading(false)
    }

    return (
        <AuthContext.Provider
        value={{
            token,
            user,
            isAuthenticated: Boolean(token && user),
            isLoading,
            login,
            logout,
        }}
        >
        {children}
        </AuthContext.Provider>
    )
}
