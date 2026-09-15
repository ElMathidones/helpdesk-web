import { useEffect, useState } from "react"

import { useAuth } from "../hooks/useAuth"
import { getTickets } from "../services/tickets"
import type { Ticket } from "../types/ticket"
import CreateTicketForm from "../components/CreateTicketForm"
import { Link } from "react-router-dom"

function TicketsPage() {
    const { token } = useAuth()

    const [tickets, setTickets] = useState<Ticket[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState("")

    useEffect(() => {
        if (!token) {
        return
        }

        let isCancelled = false

        async function loadTickets() {
        try {
            setError("")

            const data = await getTickets(token as string)

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

    if (error) {
        return <p>{error}</p>
    }

    return (
        <section>
        <h1>Tickets</h1>

        <CreateTicketForm
            onCreated={(ticket) => {
                setTickets((currentTickets) => [ticket, ...currentTickets])
            }}
        />

        {tickets.length === 0 ? (
            <p>Nenhum chamado encontrado.</p>
        ) : (
            <ul>
            {tickets.map((ticket) => (
                <li key={ticket.id}>
                <strong>
                <Link to={`/tickets/${ticket.id}`}>{ticket.title}</Link>
                </strong>

                <p>{ticket.description}</p>

                <span>
                    Prioridade: {ticket.priority} | Status: {ticket.status}
                </span>
                </li>
            ))}
            </ul>
        )}
        </section>
    )
}

export default TicketsPage
