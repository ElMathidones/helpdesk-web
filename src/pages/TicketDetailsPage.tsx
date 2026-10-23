import {
    useEffect,
    useLayoutEffect,
    useRef,
    useState,
    type KeyboardEvent,
} from "react"

import { Link, useNavigate, useParams } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { translateServiceError } from "../utils/serviceErrors"

import { useAuth } from "../hooks/useAuth"

import {
    assignTicket,
    deleteTicket,
    getMyTicket,
    getTicket,
    releaseTicket,
    updateTicketStatus,
} from "../services/tickets"

import {
    createComment,
    getComments,
} from "../services/comments"

import { getTicketHistory } from "../services/ticketHistory"

import type { Ticket, TicketStatus } from "../types/ticket"
import type { Comment } from "../types/comment"
import type { TicketHistory } from "../types/ticketHistory"

import LoadingSpinner from "../components/LoadingSpinner"

function TicketDetailsPage() {
    const { id, number } = useParams()
    const { token, user } = useAuth()
    const navigate = useNavigate()
    const { t, i18n } = useTranslation()
    const locale = i18n.resolvedLanguage ?? "pt-BR"

    const ticketReference = Number(number ?? id)

    const isCustomerNumberRoute = number !== undefined

    const isValidTicketReference =
        Boolean(number ?? id) &&
        Number.isInteger(ticketReference) &&
        ticketReference > 0

    const [ticket, setTicket] = useState<Ticket | null>(null)
    const [comments, setComments] = useState<Comment[]>([])
    const [history, setHistory] = useState<TicketHistory[]>([])
    const [commentContent, setCommentContent] = useState("")
    const [isCreatingComment, setIsCreatingComment] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState("")
    const displayError = error.startsWith("ticketDetails.errors.")
        ? t(error)
        : error
    const [isAssigning, setIsAssigning] = useState(false)
    const [isReleasing, setIsReleasing] = useState(false)
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)

    const commentInputRef = useRef<HTMLTextAreaElement | null>(null)
    const websocketRef = useRef<WebSocket | null>(null)
    const commentsListRef = useRef<HTMLDivElement | null>(null)
    const shouldAutoScrollRef = useRef(true)

    function handleCommentsScroll() {
        const element = commentsListRef.current

        if (!element) return

        const distanceFromBottom =
            element.scrollHeight -
            element.scrollTop -
            element.clientHeight

        shouldAutoScrollRef.current = distanceFromBottom <= 80
    }

    useLayoutEffect(() => {
        const element = commentsListRef.current

        if (!element || !shouldAutoScrollRef.current) return

        element.scrollTop = element.scrollHeight
    }, [comments])

    useEffect(() => {
        if (!token || !ticket) {
            return
        }

        const websocketUrl = import.meta.env.VITE_API_URL.replace(
            /^http/,
            "ws",
        )

        const websocket = new WebSocket(
            `${websocketUrl}/ws/tickets/${ticket.id}`,
        )

        websocketRef.current = websocket

        websocket.onopen = () => {
            websocket.send(
                JSON.stringify({
                    type: "auth",
                    token,
                }),
            )
        }

        websocket.onmessage = (event) => {
            const message = JSON.parse(event.data)

            if (message.type !== "comment_created") {
                return
            }

            const newComment = message.comment as Comment

            setComments((currentComments) => {
                if (
                    currentComments.some(
                        (comment) => comment.id === newComment.id,
                    )
                ) {
                    return currentComments
                }

                return [...currentComments, newComment]
            })
        }

        websocket.onclose = () => {
            console.log("WebSocket do chamado desconectado")
        }

        return () => {
            websocket.close()
            websocketRef.current = null
        }
    }, [ticket, token])

    useEffect(() => {
        if (!token || !isValidTicketReference) {
            return
        }

        const currentToken = token

        async function loadTicket() {
            try {
                const ticketData = isCustomerNumberRoute
                    ? await getMyTicket(
                        currentToken,
                        ticketReference,
                    )
                    : await getTicket(
                        currentToken,
                        ticketReference,
                    )

                const [commentsData, historyData] =
                    await Promise.all([
                        getComments(
                            currentToken,
                            ticketData.id,
                        ),
                        getTicketHistory(
                            currentToken,
                            ticketData.id,
                        ),
                    ])

                setTicket(ticketData)
                setComments(commentsData)
                setHistory(historyData)
            } catch {
                setError("ticketDetails.errors.load")
            } finally {
                setIsLoading(false)
            }
        }

        void loadTicket()
    }, [
        isCustomerNumberRoute,
        isValidTicketReference,
        ticketReference,
        token,
    ])

    async function handleAssign() {
        if (!token || !ticket) {
            return
        }

        setError("")
        setIsAssigning(true)

        try {
            const updatedTicket = await assignTicket(token, ticket.id)
            setTicket(updatedTicket)

            const updatedHistory = await getTicketHistory(token, ticket.id)

            setHistory(updatedHistory)
        } catch {
            setError("ticketDetails.errors.assign")
        } finally {
            setIsAssigning(false)
        }
    }

    async function handleRelease() {
        if (!token || !ticket) {
            return
        }

        setError("")
        setIsReleasing(true)

        try {
            const updatedTicket = await releaseTicket(
                token,
                ticket.id,
            )

            setTicket(updatedTicket)

            const updatedHistory = await getTicketHistory(
                token,
                ticket.id,
            )

            setHistory(updatedHistory)
        } catch (error) {
            setError(
                translateServiceError(error, t("ticketDetails.errors.release")),
            )
        } finally {
            setIsReleasing(false)
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

        const updatedHistory = await getTicketHistory(token, ticket.id)
        setHistory(updatedHistory)
        } catch {
            setError("ticketDetails.errors.changeStatus")
        } finally {
            setIsUpdatingStatus(false)
        }
    }

    async function handleDeleteTicket() {
        if (!token || !ticket || user?.role !== "admin") {
            return
        }

        const confirmed = window.confirm(
            t("ticketDetails.confirmDelete", { number: ticket.id }),
        )

        if (!confirmed) {
            return
        }

        setError("")
        setIsDeleting(true)

        try {
            await deleteTicket(token, ticket.id)
            navigate("/tickets")
        } catch (error) {
            setError(
                translateServiceError(error, t("ticketDetails.errors.delete")),
            )
            setIsDeleting(false)
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

    function handleCommentKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
        if (
            event.key !== "Enter" ||
            event.shiftKey ||
            event.ctrlKey ||
            event.altKey ||
            event.metaKey ||
            event.nativeEvent.isComposing
        ) {
            return
        }

        event.preventDefault()

        if (isCreatingComment || !commentContent.trim()) {
            return
        }

        void handleCreateComment()
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

            shouldAutoScrollRef.current = true

            setComments((currentComments) => {
                if (
                    currentComments.some(
                        (comment) => comment.id === newComment.id,
                    )
                ) {
                    return currentComments
                }

                return [...currentComments, newComment]
            })

            setCommentContent("")

            if (commentInputRef.current) {
                commentInputRef.current.style.height = "auto"
                commentInputRef.current.style.overflowY = "hidden"
            }
        } catch {
            setError(t("ticketDetails.errors.sendMessage"))
        } finally {
            setIsCreatingComment(false)
        }
    }

    if (!isValidTicketReference) {
        return (
        <div className="ticket-details-page">
            <div className="feedback-card">
            <strong>{t("ticketDetails.invalid.title")}</strong>
            <p>{t("ticketDetails.invalid.description")}</p>
            <Link to="/tickets">← {t("ticketDetails.backToTickets")}</Link>
            </div>
        </div>
        )
    }

    if (isLoading) {
        return (
                <LoadingSpinner>{t("ticketDetails.loading")}</LoadingSpinner>
        )
    }

    if (error || !ticket) {
        return (
        <div className="ticket-details-page">
            <div className="feedback-card">
            <strong>{t("ticketDetails.cannotOpen")}</strong>
            <p>{displayError || t("ticketDetails.notFound")}</p>
            <Link to="/tickets">← {t("ticketDetails.backToTickets")}</Link>
            </div>
        </div>
        )
    }

    const canManage =
        user?.role === "admin" || user?.role === "technician"

    const isAssignedToCurrentUser =
        ticket.assignee_id === user?.id

    const canControlAssignedTicket =
        user?.role === "admin" || isAssignedToCurrentUser

    return (
        <div className="ticket-details-page">
            <Link className="back-link" to="/tickets">
                ← {t("ticketDetails.backToTickets")}
            </Link>

            <div className="ticket-details-header">
                <div>
                    <span className="ticket-details-id">
                        {t("ticketDetails.ticketLabel")}
                        {user?.role === "customer"
                            ? ticket.creator_ticket_number
                            : ticket.id}
                    </span>
                    <h1>{ticket.title}</h1>
                </div>

                <div className="ticket-badges">
                    <span
                        className={`priority-badge priority-${ticket.priority}`}
                    >
                        {t(`dashboard.priority.${ticket.priority}`)}
                    </span>

                    <span className={`status-badge status-${ticket.status}`}>
                        {t(`dashboard.status.${ticket.status}`)}
                    </span>
                </div>
            </div>

            {error && <p className="error-message">{displayError}</p>}

            <div className="ticket-details-grid">
                <div className="ticket-details-main">
                    <section className="details-card">
                        <div className="details-card-header">
                            <h2>{t("ticketDetails.description")}</h2>
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
                                <h2>{t("ticketDetails.actions.title")}</h2>
                            </div>

                            <div className="details-card-content">
                                <div className="ticket-actions">
                                    {ticket.status === "open" && (
                                        <button
                                            className="action-button action-secondary"
                                            type="button"
                                            onClick={() =>
                                                void handleStatusChange("under_review")
                                            }
                                            disabled={isUpdatingStatus}
                                        >
                                            {isUpdatingStatus
                                                ? t("ticketDetails.actions.updating")
                                                : t("ticketDetails.actions.startReview")}
                                        </button>
                                    )}

                                    {ticket.status === "under_review"
                                        && ticket.assignee_id === null && (
                                        <button
                                            className="action-button action-primary"
                                            type="button"
                                            onClick={handleAssign}
                                            disabled={isAssigning}
                                        >
                                            {isAssigning
                                                ? t("ticketDetails.actions.assigning")
                                                : t("ticketDetails.actions.assign")}
                                        </button>
                                    )}

                                    {ticket.status === "in_progress"
                                        && canControlAssignedTicket && (
                                        <>
                                            <button
                                                className="action-button action-success"
                                                type="button"
                                                onClick={() =>
                                                    void handleStatusChange("resolved")
                                                }
                                                disabled={isUpdatingStatus}
                                            >
                                                {isUpdatingStatus
                                                    ? t("ticketDetails.actions.updating")
                                                    : t("ticketDetails.actions.markResolved")}
                                            </button>

                                            <button
                                                className="action-button action-secondary"
                                                type="button"
                                                onClick={() => void handleRelease()}
                                                disabled={isReleasing}
                                            >
                                                {isReleasing
                                                    ? t("ticketDetails.actions.releasing")
                                                    : t("ticketDetails.actions.release")}
                                            </button>
                                        </>
                                    )}

                                    {ticket.status === "resolved"
                                        && canControlAssignedTicket && (
                                        <>
                                            <button
                                                className="action-button action-secondary"
                                                type="button"
                                                onClick={() =>
                                                    void handleStatusChange("in_progress")
                                                }
                                                disabled={isUpdatingStatus}
                                            >
                                                {t("ticketDetails.actions.reopen")}
                                            </button>

                                            <button
                                                className="action-button action-danger"
                                                type="button"
                                                onClick={() =>
                                                    void handleStatusChange("closed")
                                                }
                                                disabled={isUpdatingStatus}
                                            >
                                                {t("ticketDetails.actions.close")}
                                            </button>
                                        </>
                                    )}

                                    {user?.role === "technician"
                                        && ticket.assignee_id !== null
                                        && ticket.assignee_id !== user.id
                                        && (
                                            ticket.status === "in_progress"
                                            || ticket.status === "resolved"
                                        ) && (
                                        <p className="no-actions-message">
                                            {t("ticketDetails.actions.assignedTo", {
                                                name: ticket.assignee?.name ?? t("ticketDetails.actions.anotherAssignee"),
                                            })}
                                        </p>
                                    )}

                                    {(ticket.status === "closed" ||
                                        ticket.status === "canceled") && (
                                        <p className="ticket-actions-finalized">
                                            {t("ticketDetails.actions.finalized", {
                                                status: t(
                                                    `dashboard.status.${ticket.status}`,
                                                ).toLowerCase(),
                                            })}
                                        </p>
                                    )}

                                    {user?.role === "admin" && (
                                        <button
                                            className="action-button action-danger ticket-action-delete"
                                            type="button"
                                            onClick={() => void handleDeleteTicket()}
                                            disabled={isDeleting}
                                        >
                                            {isDeleting ? t("ticketDetails.actions.deleting") : t("ticketDetails.actions.delete")}
                                        </button>
                                    )}

                                    {user?.role !== "admin" &&
                                        ticket.assignee_id !== null &&
                                        ticket.status !== "in_progress" &&
                                        ticket.status !== "resolved" &&
                                        ticket.status !== "closed" &&
                                        ticket.status !== "canceled" && (
                                            <p className="no-actions-message">
                                                {t("ticketDetails.actions.noActions")}
                                            </p>
                                    )}
                                </div>
                            </div>
                        </section>
                    )}

                    <section className="details-card">
                        <div className="details-card-header">
                            <h2>{t("ticketDetails.history.title")}</h2>
                        </div>

                        <div className="details-card-content">
                            {history.length === 0 ? (
                                <p>{t("ticketDetails.history.empty")}</p>
                            ) : (
                                <div
                                    className="ticket-history"
                                    role="region"
                                    aria-label={t("ticketDetails.history.title")}
                                    tabIndex={0}
                                >
                                    {history.map((event) => (
                                        <div className="ticket-history-item" key={event.id}>
                                            <div className="ticket-history-marker" />

                                            <div className="ticket-history-content">
                                                <strong>{t(`ticketDetails.history.events.${event.event_type}`, {
                                                    defaultValue: event.event_type,
                                                })}</strong>

                                                <p className="ticket-history-meta">
                                                    {event.user?.name ?? t("ticketDetails.history.system")} •{" "}
                                                    {formatLocalizedDateTime(event.created_at, locale)}
                                                </p>

                                                {event.event_type === "status_changed" &&
                                                    event.old_value !== null &&
                                                    event.new_value !== null && (
                                                        <p className="ticket-history-change">
                                                            {t(`dashboard.status.${event.old_value as TicketStatus}`)} →{" "}
                                                            {t(`dashboard.status.${event.new_value as TicketStatus}`)}
                                                        </p>
                                                    )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </section>

                    <section className="details-card">
                        <div className="details-card-header">
                            <h2>{t("ticketDetails.chat.title")}</h2>
                        </div>

                        <div className="details-card-content">
                            {comments.length === 0 ? (
                                <p className="no-comments-message">
                                    {t("ticketDetails.chat.empty")}
                                </p>
                            ) : (
                                <div
                                    ref={commentsListRef}
                                    className="comments-list"
                                    role="region"
                                    aria-label={t("ticketDetails.chat.title")}
                                    tabIndex={0}
                                    onScroll={handleCommentsScroll}
                                >
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
                                                        {formatLocalizedDateTime(comment.created_at, locale)}
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
                                onKeyDown={handleCommentKeyDown}
                                placeholder={t("ticketDetails.chat.placeholder")}
                                rows={1}
                                disabled={isCreatingComment}
                            />

                            <button
                                className="comment-send-button"
                                type="button"
                                onClick={() => void handleCreateComment()}
                                disabled={isCreatingComment || !commentContent.trim()}
                                aria-label={t("ticketDetails.chat.send")}
                                title={t("ticketDetails.chat.send")}
                            >
                                {isCreatingComment ? (
                                    <span className="comment-send-loading" aria-hidden="true" />
                                ) : (
                                    <svg
                                        width="19"
                                        height="19"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="1.9"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        aria-hidden="true"
                                    >
                                        <path d="m22 2-7 20-4.5-8.5L2 9l20-7Z" />
                                        <path d="M22 2 10.5 13.5" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </section>
                </div>

                <aside className="ticket-info-card">
                    <h2>{t("ticketDetails.info.title")}</h2>

                    <dl className="ticket-info-list">
                        <div>
                            <dt>{t("ticketDetails.info.priority")}</dt>
                            <dd>{t(`dashboard.priority.${ticket.priority}`)}</dd>
                        </div>

                        <div>
                            <dt>{t("ticketDetails.info.status")}</dt>
                            <dd>{t(`dashboard.status.${ticket.status}`)}</dd>
                        </div>

                        <div>
                            <dt>{t("ticketDetails.info.category")}</dt>
                            <dd>{ticket.category.name}</dd>
                        </div>

                        <div>
                            <dt>{t("ticketDetails.info.createdBy")}</dt>
                            <dd>{ticket.creator.name}</dd>
                        </div>

                        <div>
                            <dt>{t("ticketDetails.info.assignee")}</dt>
                            <dd>
                                {ticket.assignee?.name ?? t("ticketDetails.info.unassigned")}
                            </dd>
                        </div>

                        <div>
                            <dt>{t("ticketDetails.info.createdAt")}</dt>
                            <dd>
                                {formatLocalizedDateTime(ticket.created_at, locale)}
                            </dd>
                        </div>

                        <div>
                            <dt>{t("ticketDetails.info.updatedAt")}</dt>
                            <dd>
                                {formatLocalizedDateTime(ticket.updated_at, locale)}
                            </dd>
                        </div>

                        {ticket.closed_at && (
                            <div>
                                <dt>{t("ticketDetails.info.closedAt")}</dt>
                                <dd>
                                    {formatLocalizedDateTime(ticket.closed_at, locale)}
                                </dd>
                            </div>
                        )}
                    </dl>
                </aside>
            </div>
        </div>
    )
}

function formatLocalizedDateTime(value: string, locale: string) {
    return new Date(value).toLocaleString(locale, {
        dateStyle: "short",
        timeStyle: "short",
    })
}

export default TicketDetailsPage
