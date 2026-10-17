import { useState, type FormEvent } from "react"
import { Navigate, useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"

import { useAuth } from "../hooks/useAuth"
import { useTheme } from "../contexts/useTheme"
import { createUser } from "../services/users"
import { translateServiceError } from "../utils/serviceErrors"

function LoginPage() {
    const navigate = useNavigate()
    const { login, isAuthenticated } = useAuth()
    const { theme } = useTheme()
    const { t } = useTranslation()

    const logoSrc =
        theme === "dark"
            ? "/branding/helpdesk-logo-dark.png"
            : "/branding/helpdesk-logo-light.png"

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
                setError(t("auth.errors.minPassword"))
                return
            }

            if (password !== confirmPassword) {
                setError(t("auth.errors.passwordMismatch"))
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
                        ? translateServiceError(error, t("auth.errors.registration"))
                        : t("auth.errors.registration"),
                )
            } else {
                setError(t("auth.errors.invalidCredentials"))
            }
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <main className="login-page">
            <section className="login-panel">
                <div className="login-brand">
                    <img
                        className="login-logo"
                        src={logoSrc}
                        alt=""
                        aria-hidden="true"
                    />

                    <div>
                        <strong>Help Desk</strong>
                        <span>{t("brand.subtitle")}</span>
                    </div>
                </div>

                <div className="login-heading">
                    <h1>
                        {mode === "login"
                            ? t("auth.login.title")
                            : t("auth.register.title")}
                    </h1>

                    <p>
                        {mode === "login"
                            ? t("auth.login.description")
                            : t("auth.register.description")}
                    </p>
                </div>

                <form className="login-form" onSubmit={handleSubmit}>

                    {mode === "register" && (
                        <div className="form-field">
                            <label htmlFor="name">{t("auth.fields.name")}</label>

                            <input
                                id="name"
                                type="text"
                                value={name}
                                onChange={(event) => setName(event.target.value)}
                                placeholder={t("auth.fields.namePlaceholder")}
                                required
                                minLength={2}
                                maxLength={120}
                                autoComplete="name"
                            />
                        </div>
                    )}

                    <div className="form-field">
                        <label htmlFor="email">{t("auth.fields.email")}</label>

                        <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        placeholder={t("auth.fields.emailPlaceholder")}
                        required
                        autoComplete="email"
                        />
                    </div>

                    <div className="form-field">
                        <label htmlFor="password">{t("auth.fields.password")}</label>

                        <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        placeholder={t("auth.fields.passwordPlaceholder")}
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
                                {t("auth.fields.confirmPassword")}
                            </label>

                            <input
                                id="confirm-password"
                                type="password"
                                value={confirmPassword}
                                onChange={(event) =>
                                    setConfirmPassword(event.target.value)
                                }
                                placeholder={t("auth.fields.confirmPasswordPlaceholder")}
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
                                ? t("auth.login.loading")
                                : t("auth.register.loading")
                            : mode === "login"
                            ? t("auth.login.submit")
                            : t("auth.register.submit")}
                    </button>

                    <div className="login-account-switch">
                        <span>
                            {mode === "login"
                                ? t("auth.login.switchQuestion")
                                : t("auth.register.switchQuestion")}
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
                                ? t("auth.login.switchAction")
                                : t("auth.register.switchAction")}
                        </button>
                    </div>

                </form>
            </section>

            <aside className="login-hero">
                <div className="login-hero-content">
                    <span className="login-hero-label">HELP DESK</span>

                    <h2>{t("auth.hero.heading")}</h2>

                    <p>
                        {t("auth.hero.description")}
                    </p>

                    <div className="login-features">
                        <div>
                        <span>✓</span>
                        <p>
                            <strong>{t("auth.hero.ticketManagement")}</strong>
                            <small>
                            {t("auth.hero.ticketManagementDescription")}
                            </small>
                        </p>
                        </div>

                        <div>
                        <span>✓</span>
                        <p>
                            <strong>{t("auth.hero.priorities")}</strong>
                            <small>
                            {t("auth.hero.prioritiesDescription")}
                            </small>
                        </p>
                        </div>

                        <div>
                        <span>✓</span>
                        <p>
                            <strong>{t("auth.hero.security")}</strong>
                            <small>
                            {t("auth.hero.securityDescription")}
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
