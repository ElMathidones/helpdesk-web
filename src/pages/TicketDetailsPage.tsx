import { useEffect, useRef, useState } from "react"
import { Link, useParams } from "react-router-dom"

import { useAuth } from "../hooks/useAuth"
import {
    assignTicket,
    getTicket,
    updateTicketStatus,
} from "../services/tickets"
import {
    createComment,
    getComments,
} from "../services/comments"
import type { Ticket, TicketStatus } from "../types/ticket"
import type { Comment } from "../types/comment"

function TicketDetailsPage() {
    const { id } = useParams()
    const { token, user } = useAuth()

    const ticketId = Number(id)
    const isValidTicketId = Boolean(id) && !Number.isNaN(ticketId)

    const [ticket, setTicket] = useState<Ticket | null>(null)
    const [comments, setComments] = useState<Comment[]>([])
    const [commentContent, setCommentContent] = useState("")
    const [isCreatingComment, setIsCreatingComment] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState("")
    const [isAssigning, setIsAssigning] = useState(false)
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)
    const commentInputRef = useRef<HTMLTextAreaElement | null>(null)

    useEffect(() => {
        if (!token || !isValidTicketId) {
        return
        }

        const currentToken = token

        async function loadTicket() {
            try {
                const [ticketData, commentsData] = await Promise.all([
                    getTicket(currentToken, ticketId),
                    getComments(currentToken, ticketId),
                ])

                setTicket(ticketData)
                setComments(commentsData)
            } catch {
                setError("Não foi possível carregar o chamado.")
            } finally {
                setIsLoading(false)
            }
        }

        void loadTicket()
    }, [isValidTicketId, ticketId, token])

    async function handleAssign() {
        if (!token || !ticket) {
            return
        }

        setError("")
        setIsAssigning(true)

        try {
            const updatedTicket = await assignTicket(token, ticket.id)
            setTicket(updatedTicket)
        } catch {
            setError("Não foi possível assumir o chamado.")
        } finally {
            setIsAssigning(false)
        }
    }

    async function handleStatusChange(status: TicketStatus) {
        if (!token || !ticket) {
            return
        }

        setError("")
        setIsUpdatingStatus(true)

        try {
            const updatedTicket = await updateTicketStatus(
                token,
                ticket.id,
                status,
        )

        setTicket(updatedTicket)
        } catch {
            setError("Não foi possível alterar o status do chamado.")
        } finally {
            setIsUpdatingStatus(false)
        }
    }
    
    function handleCommentChange(value: string) {
        const currentScrollY = window.scrollY

        setCommentContent(value)

        const textarea = commentInputRef.current

        if (!textarea) {
            return
        }

        textarea.style.height = "auto"

        const maxHeight = 180
        const newHeight = Math.min(textarea.scrollHeight, maxHeight)

        textarea.style.height = `${newHeight}px`
        textarea.style.overflowY =
            textarea.scrollHeight > maxHeight ? "auto" : "hidden"

        requestAnimationFrame(() => {
            window.scrollTo(0, currentScrollY)
        })
    }

    async function handleCreateComment() {
        if (!token || !ticket || !commentContent.trim()) {
            return
        }

        setError("")
        setIsCreatingComment(true)

        try {
            const newComment = await createComment(
                token,
                ticket.id,
                commentContent.trim(),
            )

            setComments((currentComments) => [
                ...currentComments,
                newComment,
            ])

            setCommentContent("")

            if (commentInputRef.current) {
                commentInputRef.current.style.height = "auto"
                commentInputRef.current.style.overflowY = "hidden"
            }
        } catch {
            setError("Não foi possível enviar a mensagem.")
        } finally {
            setIsCreatingComment(false)
        }
    }

    if (!isValidTicketId) {
        return (
        <div className="ticket-details-page">
            <div className="feedback-card">
            <strong>Chamado inválido</strong>
            <p>O identificador informado não é válido.</p>
            <Link to="/tickets">← Voltar para chamados</Link>
            </div>
        </div>
        )
    }

    if (isLoading) {
        return <p>Carregando chamado...</p>
    }

    if (error || !ticket) {
        return (
        <div className="ticket-details-page">
            <div className="feedback-card">
            <strong>Não foi possível abrir o chamado</strong>
            <p>{error || "Chamado não encontrado."}</p>
            <Link to="/tickets">← Voltar para chamados</Link>
            </div>
        </div>
        )
    }

    const canManage =
        user?.role === "admin" || user?.role === "technician"

    return (
        <div className="ticket-details-page">
            <Link className="back-link" to="/tickets">
                ← Voltar para chamados
            </Link>

            <div className="ticket-details-header">
                <div>
                    <span className="ticket-details-id">
                        Chamado #{ticket.id}
                    </span>
                    <h1>{ticket.title}</h1>
                </div>

                <div className="ticket-badges">
                    <span
                        className={`priority-badge priority-${ticket.priority}`}
                    >
                        {formatPriority(ticket.priority)}
                    </span>

                    <span className={`status-badge status-${ticket.status}`}>
                        {formatStatus(ticket.status)}
                    </span>
                </div>
            </div>

            {error && <p className="error-message">{error}</p>}

            <div className="ticket-details-grid">
                <div className="ticket-details-main">
                    <section className="details-card">
                        <div className="details-card-header">
                            <h2>Descrição</h2>
                        </div>

                        <div className="details-card-content">
                            <p className="full-description">
                                {ticket.description}
                            </p>
                        </div>
                    </section>

                    {canManage && (
                        <section className="details-card">
                            <div className="details-card-header">
                                <h2>Ações do chamado</h2>
                            </div>

                            <div className="details-card-content">
                                <div className="ticket-actions">
                                    {ticket.assignee_id === null && (
                                        <button
                                            className="action-button action-primary"
                                            type="button"
                                            onClick={handleAssign}
                                            disabled={isAssigning}
                                        >
                                            {isAssigning
                                                ? "Assumindo..."
                                                : "Assumir chamado"}
                                        </button>
                                    )}

                                    {ticket.status === "in_progress" && (
                                        <button
                                            className="action-button action-success"
                                            type="button"
                                            onClick={() =>
                                                void handleStatusChange(
                                                    "resolved",
                                                )
                                            }
                                            disabled={isUpdatingStatus}
                                        >
                                            {isUpdatingStatus
                                                ? "Atualizando..."
                                                : "Marcar como resolvido"}
                                        </button>
                                    )}

                                    {ticket.status === "resolved" && (
                                        <>
                                            <button
                                                className="action-button action-secondary"
                                                type="button"
                                                onClick={() =>
                                                    void handleStatusChange(
                                                        "in_progress",
                                                    )
                                                }
                                                disabled={isUpdatingStatus}
                                            >
                                                Reabrir chamado
                                            </button>

                                            <button
                                                className="action-button action-danger"
                                                type="button"
                                                onClick={() =>
                                                    void handleStatusChange(
                                                        "closed",
                                                    )
                                                }
                                                disabled={isUpdatingStatus}
                                            >
                                                Fechar chamado
                                            </button>
                                        </>
                                    )}

                                    {ticket.assignee_id !== null &&
                                        ticket.status !== "in_progress" &&
                                        ticket.status !== "resolved" && (
                                            <p className="no-actions-message">
                                                Não há ações disponíveis para o
                                                status atual.
                                            </p>
                                        )}
                                </div>
                            </div>
                        </section>
                    )}

                    <section className="details-card">
                        <div className="details-card-header">
                            <h2>Chat</h2>
                        </div>

                        <div className="details-card-content">
                            {comments.length === 0 ? (
                                <p className="no-comments-message">
                                    Ainda não há mensagens nesta conversa.
                                </p>
                            ) : (
                                <div className="comments-list">
                                    {comments.map((comment) => {
                                        const isOwnMessage = comment.author.id === user?.id

                                        return (
                                            <article
                                                className={`comment-item ${
                                                    isOwnMessage
                                                        ? "comment-item-own"
                                                        : "comment-item-other"
                                                }`}
                                                key={comment.id}
                                            >
                                                <div className="comment-header">
                                                    <strong>{comment.author.name}</strong>

                                                    <time dateTime={comment.created_at}>
                                                        {new Date(
                                                            comment.created_at,
                                                        ).toLocaleString("pt-BR")}
                                                    </time>
                                                </div>

                                                <p>{comment.content}</p>
                                            </article>
                                        )
                                    })}
                                </div>
                            )}
                        </div>

                        <div className="comment-form">
                            <textarea
                                ref={commentInputRef}
                                value={commentContent}
                                onChange={(event) => handleCommentChange(event.target.value)}
                                placeholder="Digite uma mensagem..."
                                rows={1}
                                disabled={isCreatingComment}
                            />

                            <button
                                className="comment-send-button"
                                type="button"
                                onClick={() => void handleCreateComment()}
                                disabled={isCreatingComment || !commentContent.trim()}
                                aria-label="Enviar mensagem"
                                title="Enviar mensagem"
                            >
                                {isCreatingComment ? "…" : "➤"}
                            </button>
                        </div>
                    </section>
                </div>

                <aside className="ticket-info-card">
                    <h2>Informações</h2>

                    <dl className="ticket-info-list">
                        <div>
                            <dt>Prioridade</dt>
                            <dd>{formatPriority(ticket.priority)}</dd>
                        </div>

                        <div>
                            <dt>Status</dt>
                            <dd>{formatStatus(ticket.status)}</dd>
                        </div>

                        <div>
                            <dt>Categoria</dt>
                            <dd>{ticket.category.name}</dd>
                        </div>

                        <div>
                            <dt>Criado por</dt>
                            <dd>{ticket.creator.name}</dd>
                        </div>

                        <div>
                            <dt>Responsável</dt>
                            <dd>
                                {ticket.assignee?.name ?? "Não atribuído"}
                            </dd>
                        </div>

                        <div>
                            <dt>Criado em</dt>
                            <dd>
                                {new Date(
                                    ticket.created_at,
                                ).toLocaleString("pt-BR")}
                            </dd>
                        </div>

                        <div>
                            <dt>Atualizado em</dt>
                            <dd>
                                {new Date(
                                    ticket.updated_at,
                                ).toLocaleString("pt-BR")}
                            </dd>
                        </div>

                        {ticket.closed_at && (
                            <div>
                                <dt>Fechado em</dt>
                                <dd>
                                    {new Date(
                                        ticket.closed_at,
                                    ).toLocaleString("pt-BR")}
                                </dd>
                            </div>
                        )}
                    </dl>
                </aside>
            </div>
        </div>
    )
}

function formatPriority(priority: Ticket["priority"]) {
    const labels: Record<Ticket["priority"], string> = {
        low: "Baixa",
        medium: "Média",
        high: "Alta",
        critical: "Crítica",
    }

    return labels[priority]
}

function formatStatus(status: Ticket["status"]) {
    const labels: Record<Ticket["status"], string> = {
        open: "Aberto",
        under_review: "Em análise",
        in_progress: "Em andamento",
        resolved: "Resolvido",
        closed: "Fechado",
        canceled: "Cancelado",
    }

    return labels[status]
}

export default TicketDetailsPage
