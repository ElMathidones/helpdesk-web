import { useEffect, useState } from "react"
import { Link } from "react-router-dom"

import CreateTicketForm from "../components/CreateTicketForm"
import { useAuth } from "../hooks/useAuth"
import { getTickets } from "../services/tickets"
import type { Ticket } from "../types/ticket"

function TicketsPage() {
    const { token } = useAuth()

    const [tickets, setTickets] = useState<Ticket[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState("")

    useEffect(() => {
        if (!token) {
        return
        }

        const currentToken = token
        let isCancelled = false

        async function loadTickets() {
        try {
            const data = await getTickets(currentToken)

            if (!isCancelled) {
            setTickets(data)
            }
        } catch {
            if (!isCancelled) {
            setError("Não foi possível carregar os chamados.")
            }
        } finally {
            if (!isCancelled) {
            setIsLoading(false)
            }
        }
        }

        void loadTickets()

        return () => {
        isCancelled = true
        }
    }, [token])

    if (isLoading) {
        return <p>Carregando chamados...</p>
    }

    return (
        <div className="tickets-page">
        <div className="page-header">
            <div>
            <h1>Chamados</h1>
            <p>Crie, acompanhe e gerencie os chamados do sistema.</p>
            </div>

            <span className="ticket-count">
            {tickets.length} {tickets.length === 1 ? "chamado" : "chamados"}
            </span>
        </div>

        {error && <p className="error-message">{error}</p>}

        <div className="tickets-layout">
            <section className="create-ticket-section">
            <div className="section-title">
                <h2>Novo chamado</h2>
                <p>Preencha os dados para registrar uma nova solicitação.</p>
            </div>

            <CreateTicketForm
                onCreated={(ticket) => {
                setTickets((currentTickets) => [ticket, ...currentTickets])
                }}
            />
            </section>

            <section className="tickets-list-section">
            <div className="section-title">
                <h2>Lista de chamados</h2>
                <p>Chamados disponíveis para o seu usuário.</p>
            </div>

            {tickets.length === 0 ? (
                <div className="empty-state">
                <strong>Nenhum chamado encontrado</strong>
                <p>Crie um novo chamado utilizando o formulário ao lado.</p>
                </div>
            ) : (
                <div className="tickets-list">
                {tickets.map((ticket) => (
                    <Link
                    className="ticket-card"
                    key={ticket.id}
                    to={`/tickets/${ticket.id}`}
                    >
                    <div className="ticket-card-header">
                        <span className="ticket-number">#{ticket.id}</span>

                        <div className="ticket-badges">
                        <span
                            className={`priority-badge priority-${ticket.priority}`}
                        >
                            {formatPriority(ticket.priority)}
                        </span>

                        <span
                            className={`status-badge status-${ticket.status}`}
                        >
                            {formatStatus(ticket.status)}
                        </span>
                        </div>
                    </div>

                    <h3>{ticket.title}</h3>

                    <p className="ticket-description">{ticket.description}</p>

                    <div className="ticket-card-footer">
                        <span>
                        Criado em{" "}
                        {new Date(ticket.created_at).toLocaleDateString("pt-BR")}
                        </span>

                        <span>Ver detalhes →</span>
                    </div>
                    </Link>
                ))}
                </div>
            )}
            </section>
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

export default TicketsPage
