import { useState, type FormEvent } from "react"
import { Navigate, useNavigate } from "react-router-dom"

import { useAuth } from "../hooks/useAuth"
import { createUser } from "../services/users"

function LoginPage() {
    const navigate = useNavigate()
    const { login, isAuthenticated } = useAuth()

    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [mode, setMode] = useState<"login" | "register">("login")
    const [name, setName] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [error, setError] = useState("")
    const [isLoading, setIsLoading] = useState(false)

    if (isAuthenticated) {
        return <Navigate to="/dashboard" replace />
    }

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()

        setError("")

        if (mode === "register") {
            if (password.length < 8) {
                setError("A senha deve ter pelo menos 8 caracteres.")
                return
            }

            if (password !== confirmPassword) {
                setError("As senhas não coincidem.")
                return
            }
        }

        setIsLoading(true)

        try {
            if (mode === "register") {
                await createUser({
                    name: name.trim(),
                    email,
                    password,
                })
            }

            await login({
                email,
                password,
            })

            navigate("/dashboard")
        } catch (error) {
            if (mode === "register") {
                setError(
                    error instanceof Error
                        ? error.message
                        : "Não foi possível criar a conta.",
                )
            } else {
                setError("E-mail ou senha inválidos.")
            }
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
                <h1>
                    {mode === "login"
                        ? "Bem-vindo"
                        : "Crie sua conta"}
                </h1>

                <p>
                    {mode === "login"
                        ? "Entre com sua conta para acessar o sistema."
                        : "Cadastre-se para abrir e acompanhar seus chamados."}
                </p>
            </div>

            <form className="login-form" onSubmit={handleSubmit}>

                {mode === "register" && (
                    <div className="form-field">
                        <label htmlFor="name">Nome</label>

                        <input
                            id="name"
                            type="text"
                            value={name}
                            onChange={(event) => setName(event.target.value)}
                            placeholder="Seu nome"
                            required
                            minLength={2}
                            maxLength={120}
                            autoComplete="name"
                        />
                    </div>
                )}

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
                    autoComplete={
                        mode === "login"
                            ? "current-password"
                            : "new-password"
                    }
                    minLength={mode === "register" ? 8 : undefined}
                    maxLength={128}
                    />
                </div>

                {mode === "register" && (
                    <div className="form-field">
                        <label htmlFor="confirm-password">
                            Confirmar senha
                        </label>

                        <input
                            id="confirm-password"
                            type="password"
                            value={confirmPassword}
                            onChange={(event) =>
                                setConfirmPassword(event.target.value)
                            }
                            placeholder="Digite sua senha novamente"
                            required
                            minLength={8}
                            maxLength={128}
                            autoComplete="new-password"
                        />
                    </div>
                )}

                {error && <p className="form-error">{error}</p>}

                <button
                    className="login-button"
                    type="submit"
                    disabled={isLoading}
                >
                    {isLoading
                        ? mode === "login"
                            ? "Entrando..."
                            : "Criando conta..."
                        : mode === "login"
                        ? "Entrar"
                        : "Criar conta"}
                </button>

                <div className="login-account-switch">
                    <span>
                        {mode === "login"
                            ? "Ainda não tem uma conta?"
                            : "Já possui uma conta?"}
                    </span>

                    <button
                        type="button"
                        onClick={() => {
                            setMode(
                                mode === "login"
                                    ? "register"
                                    : "login",
                            )

                            setError("")
                            setPassword("")
                            setConfirmPassword("")
                        }}
                        disabled={isLoading}
                    >
                        {mode === "login"
                            ? "Criar conta"
                            : "Entrar"}
                    </button>
                </div>

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
