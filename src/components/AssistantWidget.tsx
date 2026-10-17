import {
    useEffect,
    useRef,
    useState,
    type FormEvent,
} from "react"

import Markdown from "react-markdown"
import { useTranslation } from "react-i18next"

import { useAuth } from "../hooks/useAuth"
import { sendAssistantMessage } from "../services/assistant"


interface ChatMessage {
    id: number
    role: "user" | "assistant"
    content: string
}


function AssistantWidget() {
    const { token } = useAuth()
    const { t } = useTranslation()

    const [isOpen, setIsOpen] = useState(false)
    const [message, setMessage] = useState("")
    const [messages, setMessages] = useState<ChatMessage[]>([])
    const [isSending, setIsSending] = useState(false)

    const nextMessageId = useRef(1)
    const messagesEndRef = useRef<HTMLDivElement | null>(null)

    useEffect(() => {
        if (!isOpen) {
            return
        }

        messagesEndRef.current?.scrollIntoView({
            behavior: "smooth",
        })
    }, [messages, isSending, isOpen])

    function createMessage(
        role: ChatMessage["role"],
        content: string,
    ): ChatMessage {
        const newMessage = {
            id: nextMessageId.current,
            role,
            content,
        }

        nextMessageId.current += 1

        return newMessage
    }

    async function handleSubmit(
        event: FormEvent<HTMLFormElement>,
    ) {
        event.preventDefault()

        const trimmedMessage = message.trim()

        if (!trimmedMessage || !token || isSending) {
            return
        }

        const userMessage = createMessage(
            "user",
            trimmedMessage,
        )

        setMessages((current) => [
            ...current,
            userMessage,
        ])

        setMessage("")
        setIsSending(true)

        try {
            const answer = await sendAssistantMessage(
                token,
                trimmedMessage,
            )

            const assistantMessage = createMessage(
                "assistant",
                answer,
            )

            setMessages((current) => [
                ...current,
                assistantMessage,
            ])
        } catch {
            const errorMessage = createMessage(
                "assistant",
                t("assistant.error"),
            )

            setMessages((current) => [
                ...current,
                errorMessage,
            ])
        } finally {
            setIsSending(false)
        }
    }

    return (
        <div className="assistant-widget">
            {isOpen && (
                <section
                    className="assistant-panel"
                    aria-label={t("assistant.panelLabel")}
                >
                    <header className="assistant-header">
                        <div className="assistant-header-info">
                            <div
                                className="assistant-avatar"
                                aria-hidden="true"
                            >
                                ✦
                            </div>

                            <div>
                                <strong>
                                    {t("assistant.title")}
                                </strong>

                                <span>
                                    {t("assistant.subtitle")}
                                </span>
                            </div>
                        </div>

                        <button
                            type="button"
                            className="assistant-close-button"
                            onClick={() => setIsOpen(false)}
                            aria-label={t("assistant.close")}
                        >
                            ×
                        </button>
                    </header>

                    <div className="assistant-messages">
                        <div className="assistant-message assistant-message-ai">
                            <div
                                className="assistant-message-avatar"
                                aria-hidden="true"
                            >
                                ✦
                            </div>

                            <div className="assistant-message-bubble">
                                <p>
                                    {t("assistant.greeting")}
                                </p>

                                <p>
                                    {t("assistant.suggestion")}
                                </p>
                            </div>
                        </div>

                        {messages.map((chatMessage) => (
                            <div
                                key={chatMessage.id}
                                className={
                                    chatMessage.role === "user"
                                        ? "assistant-message assistant-message-user"
                                        : "assistant-message assistant-message-ai"
                                }
                            >
                                {chatMessage.role === "assistant" && (
                                    <div
                                        className="assistant-message-avatar"
                                        aria-hidden="true"
                                    >
                                        ✦
                                    </div>
                                )}

                                <div className="assistant-message-bubble assistant-markdown">
                                    <Markdown>
                                        {chatMessage.content}
                                    </Markdown>
                                </div>
                            </div>
                        ))}

                        {isSending && (
                            <div className="assistant-message assistant-message-ai">
                                <div
                                    className="assistant-message-avatar"
                                    aria-hidden="true"
                                >
                                    ✦
                                </div>

                                <div className="assistant-message-bubble assistant-typing">
                                    <span />
                                    <span />
                                    <span />
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    <form
                        className="assistant-form"
                        onSubmit={handleSubmit}
                    >
                        <input
                            type="text"
                            value={message}
                            onChange={(event) =>
                                setMessage(event.target.value)
                            }
                            placeholder={
                                isSending
                                    ? t("assistant.waiting")
                                    : t("assistant.placeholder")
                            }
                            aria-label={t("assistant.messageLabel")}
                            maxLength={1000}
                            disabled={isSending}
                        />

                        <button
                            type="submit"
                            disabled={
                                !message.trim()
                                || !token
                                || isSending
                            }
                            aria-label={t("assistant.send")}
                            title={t("assistant.send")}
                        >
                            ↑
                        </button>
                    </form>
                </section>
            )}

            <button
                type="button"
                className={`assistant-toggle ${
                    isOpen ? "assistant-toggle-open" : ""
                }`}
                onClick={() =>
                    setIsOpen((current) => !current)
                }
                aria-label={
                    isOpen
                        ? t("assistant.close")
                        : t("assistant.open")
                }
            >
                {isOpen ? "×" : "✦"}

                {!isOpen && (
                    <span>{t("assistant.label")}</span>
                )}
            </button>
        </div>
    )
}

export default AssistantWidget
