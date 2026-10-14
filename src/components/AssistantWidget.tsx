import {
    useEffect,
    useRef,
    useState,
    type FormEvent,
} from "react"

import Markdown from "react-markdown"

import { useAuth } from "../hooks/useAuth"
import { sendAssistantMessage } from "../services/assistant"


interface ChatMessage {
    id: number
    role: "user" | "assistant"
    content: string
}


function AssistantWidget() {
    const { token } = useAuth()

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
                "Não consegui responder agora. Tente novamente em alguns instantes.",
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
                    aria-label="Assistente do Help Desk"
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
                                    Assistente Help Desk
                                </strong>

                                <span>
                                    Tire dúvidas sobre o sistema
                                </span>
                            </div>
                        </div>

                        <button
                            type="button"
                            className="assistant-close-button"
                            onClick={() => setIsOpen(false)}
                            aria-label="Fechar assistente"
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
                                    Olá! Posso ajudar com dúvidas
                                    sobre o Help Desk.
                                </p>

                                <p>
                                    Pergunte sobre chamados,
                                    prioridades, status, atendimento
                                    ou funcionamento do sistema.
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
                                    ? "Aguarde a resposta..."
                                    : "Digite sua pergunta..."
                            }
                            aria-label="Mensagem para o assistente"
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
                            aria-label="Enviar mensagem"
                            title="Enviar mensagem"
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
                        ? "Fechar assistente"
                        : "Abrir assistente"
                }
            >
                {isOpen ? "×" : "✦"}

                {!isOpen && (
                    <span>Assistente</span>
                )}
            </button>
        </div>
    )
}

export default AssistantWidget
