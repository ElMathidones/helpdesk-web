
import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next"

import { useAuth } from "../hooks/useAuth"
import { useTheme } from "../contexts/useTheme"
import { confirmEmailChange } from "../services/users"

type ConfirmationStatus =
    | "idle"
    | "loading"
    | "success"
    | "error"

function ConfirmEmailPage() {
    const { t } = useTranslation()
    const { isAuthenticated, refreshUser } = useAuth()
    const { theme } = useTheme()

    const [token] = useState(
        () =>
            new URLSearchParams(window.location.search)
                .get("token") ?? "",
    )

    const [status, setStatus] =
        useState<ConfirmationStatus>("idle")

    const [errorCode, setErrorCode] = useState("")
        const invalidToken =
        status === "error" &&
        errorCode === "INVALID_CONFIRMATION_TOKEN"

    const logoSrc =
        theme === "dark"
            ? "/branding/helpdesk-logo-dark.png"
            : "/branding/helpdesk-logo-light.png"

    useEffect(() => {
        const url = new URL(window.location.href)

        if (!url.searchParams.has("token")) return

        url.searchParams.delete("token")

        window.history.replaceState(
            window.history.state,
            "",
            `${url.pathname}${url.search}${url.hash}`,
        )
    }, [])

    async function handleConfirm() {
        if (
            !token ||
            status === "loading" ||
            status === "success"
        ) {
            return
        }

        setStatus("loading")
        setErrorCode("")

        try {
            await confirmEmailChange(token)

            if (isAuthenticated) {
                await refreshUser().catch(() => undefined)
            }

            setStatus("success")
        } catch (error) {
            setErrorCode(
                error instanceof Error
                    ? error.message
                    : "EMAIL_CONFIRMATION_FAILED",
            )

            setStatus("error")
        }
    }

    function getErrorMessage() {
        if (errorCode === "INVALID_CONFIRMATION_TOKEN") {
            return t("emailConfirmation.invalidToken")
        }

        if (errorCode === "EMAIL_ALREADY_REGISTERED") {
            return t("settings.feedback.emailAlreadyRegistered")
        }

        return t("emailConfirmation.genericError")
    }

    return (
        <main className="confirm-email-page">
            <section className="confirm-email-card">
                <div className="confirm-email-brand">
                    <img
                        src={logoSrc}
                        alt=""
                        aria-hidden="true"
                    />
                    <strong>Help Desk</strong>
                </div>

                {status === "success" ? (
                    <>
                        <h1>
                            {t("emailConfirmation.successTitle")}
                        </h1>

                        <p
                            className="confirm-email-message"
                            role="status"
                        >
                            {t("emailConfirmation.success")}
                        </p>
                    </>
                ) : (
                    <>
                        <h1>
                            {t("emailConfirmation.title")}
                        </h1>

                        {token && !invalidToken && (
                            <p className="confirm-email-message">
                                {t("emailConfirmation.description")}
                            </p>
                        )}

                        {!token ? (
                            <p
                                className="confirm-email-error"
                                role="alert"
                            >
                                {t("emailConfirmation.missingToken")}
                            </p>
                        ) : (
                            <>
                                {status === "error" && (
                                    <p
                                        className="confirm-email-error"
                                        role="alert"
                                    >
                                        {getErrorMessage()}
                                    </p>
                                )}

                                {!invalidToken && (
                                    <button
                                        type="button"
                                        className="confirm-email-button"
                                        disabled={status === "loading"}
                                        onClick={() => {
                                            void handleConfirm()
                                        }}
                                    >
                                        {status === "loading"
                                            ? t("emailConfirmation.confirming")
                                            : t("emailConfirmation.confirmButton")}
                                    </button>
                                )}
                            </>
                        )}
                    </>
                )}

                <Link
                    className="confirm-email-back"
                    to={isAuthenticated ? "/settings" : "/login"}
                >
                    {isAuthenticated
                        ? t("emailConfirmation.backToSettings")
                        : t("emailConfirmation.backToLogin")}
                </Link>
            </section>
        </main>
    )
}

export default ConfirmEmailPage
