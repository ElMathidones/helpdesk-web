import { useEffect, useState } from "react"
import { Link, useParams } from "react-router-dom"

import { useAuth } from "../hooks/useAuth"
import {
    assignTicket,
    getTicket,
    updateTicketStatus,
} from "../services/tickets"
import type { Ticket, TicketStatus } from "../types/ticket"

function TicketDetailsPage() {
    const { id } = useParams()
    const { token, user } = useAuth()

    const ticketId = Number(id)
    const isValidTicketId = Boolean(id) && !Number.isNaN(ticketId)

    const [ticket, setTicket] = useState<Ticket | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState("")
    const [isAssigning, setIsAssigning] = useState(false)
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)

    useEffect(() => {
        if (!token || !isValidTicketId) {
        return
        }

        const currentToken = token

        async function loadTicket() {
        try {
            const data = await getTicket(currentToken, ticketId)
            setTicket(data)
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

    if (!isValidTicketId) {
        return (
        <section>
            <p>Chamado inválido.</p>
            <Link to="/tickets">Voltar para chamados</Link>
        </section>
        )
    }

    if (isLoading) {
        return <p>Carregando chamado...</p>
    }

    if (error || !ticket) {
        return (
        <section>
            <p>{error || "Chamado não encontrado."}</p>
            <Link to="/tickets">Voltar para chamados</Link>
        </section>
        )
    }

    return (
        <section>
        <Link to="/tickets">← Voltar para chamados</Link>

        <h1>{ticket.title}</h1>

        <p>{ticket.description}</p>

        <dl>
            <dt>ID</dt>
            <dd>{ticket.id}</dd>

            <dt>Prioridade</dt>
            <dd>{ticket.priority}</dd>

            <dt>Status</dt>
            <dd>{ticket.status}</dd>

            <dt>Categoria</dt>
            <dd>{ticket.category_id}</dd>

            <dt>Criado por</dt>
            <dd>{ticket.creator_id}</dd>

            <dt>Responsável</dt>
            <dd>{ticket.assignee_id ?? "Não atribuído"}</dd>

            <dt>Criado em</dt>
            <dd>{new Date(ticket.created_at).toLocaleString("pt-BR")}</dd>

            {ticket.closed_at && (
                <>
                    <dt>Fechado em</dt>
                    <dd>{new Date(ticket.closed_at).toLocaleString("pt-BR")}</dd>
                </>
            )}
        </dl>

        {(user?.role === "admin" || user?.role === "technician") &&
            ticket.assignee_id === null && (
            <button
                type="button"
                onClick={handleAssign}
                disabled={isAssigning}
            >
                {isAssigning ? "Assumindo..." : "Assumir chamado"}
            </button>
        )}

        {(user?.role === "admin" || user?.role === "technician") &&
            ticket.status === "in_progress" && (
                <button
                    type="button"
                    onClick={() => void handleStatusChange("resolved")}
                    disabled={isUpdatingStatus}
                >
                    {isUpdatingStatus ? "Atualizando..." : "Marcar como resolvido"}
                </button>
        )}

        {(user?.role === "admin" || user?.role === "technician") &&
            ticket.status === "resolved" && (
                <>
                <button
                    type="button"
                    onClick={() => void handleStatusChange("in_progress")}
                    disabled={isUpdatingStatus}
                >
                    Reabrir chamado
                </button>

                <button
                    type="button"
                    onClick={() => void handleStatusChange("closed")}
                    disabled={isUpdatingStatus}
                >
                    Fechar chamado
                </button>
                </>
        )}
        </section>
    )
}

export default TicketDetailsPage
