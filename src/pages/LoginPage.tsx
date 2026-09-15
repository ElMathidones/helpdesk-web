import { useState, type FormEvent } from "react"
import { Navigate, useNavigate } from "react-router-dom"

import { useAuth } from "../hooks/useAuth"

function LoginPage() {
    const navigate = useNavigate()
    const { login, isAuthenticated } = useAuth()

    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const [isLoading, setIsLoading] = useState(false)

    if (isAuthenticated) {
        return <Navigate to="/dashboard" replace />
    }

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()

        setError("")
        setIsLoading(true)

        try {
        await login({
            email,
            password,
        })

        navigate("/dashboard")
        } catch {
        setError("E-mail ou senha inválidos.")
        } finally {
        setIsLoading(false)
        }
    }

    return (
        <main>
        <h1>Help Desk</h1>

        <form onSubmit={handleSubmit}>
            <div>
            <label htmlFor="email">E-mail</label>

            <input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                autoComplete="email"
            />
            </div>

            <div>
            <label htmlFor="password">Senha</label>

            <input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                autoComplete="current-password"
            />
            </div>

            {error && <p>{error}</p>}

            <button type="submit" disabled={isLoading}>
            {isLoading ? "Entrando..." : "Entrar"}
            </button>
        </form>
        </main>
    )
}

export default LoginPage
