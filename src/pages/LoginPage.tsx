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
        <main className="login-page">
        <section className="login-panel">
            <div className="login-brand">
            <div className="login-logo">H</div>

            <div>
                <strong>Help Desk</strong>
                <span>Support Center</span>
            </div>
            </div>

            <div className="login-heading">
            <h1>Bem-vindo</h1>
            <p>Entre com sua conta para acessar o sistema.</p>
            </div>

            <form className="login-form" onSubmit={handleSubmit}>
            <div className="form-field">
                <label htmlFor="email">E-mail</label>

                <input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="seu@email.com"
                required
                autoComplete="email"
                />
            </div>

            <div className="form-field">
                <label htmlFor="password">Senha</label>

                <input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Digite sua senha"
                required
                autoComplete="current-password"
                />
            </div>

            {error && <p className="form-error">{error}</p>}

            <button
                className="login-button"
                type="submit"
                disabled={isLoading}
            >
                {isLoading ? "Entrando..." : "Entrar"}
            </button>
            </form>
        </section>

        <aside className="login-hero">
            <div className="login-hero-content">
            <span className="login-hero-label">HELP DESK</span>

            <h2>Suporte organizado, atendimento eficiente.</h2>

            <p>
                Centralize solicitações, acompanhe o andamento dos chamados
                e mantenha todo o fluxo de suporte em um único lugar.
            </p>

            <div className="login-features">
                <div>
                <span>✓</span>
                <p>
                    <strong>Gestão de chamados</strong>
                    <small>
                    Acompanhe solicitações do início ao encerramento.
                    </small>
                </p>
                </div>

                <div>
                <span>✓</span>
                <p>
                    <strong>Controle de prioridades</strong>
                    <small>
                    Identifique rapidamente o que precisa de atenção.
                    </small>
                </p>
                </div>

                <div>
                <span>✓</span>
                <p>
                    <strong>Acesso seguro</strong>
                    <small>
                    Autenticação e permissões de acordo com cada usuário.
                    </small>
                </p>
                </div>
            </div>
            </div>
        </aside>
        </main>
    )
}

export default LoginPage
