import { API_URL } from "./api"
import type { Ticket, TicketStatus } from "../types/ticket"
import type { TicketPriority } from "../types/ticket"

interface CreateTicketData {
    title: string
    description: string
    priority: TicketPriority
    category_id: number
    send_email_copy: boolean
}

export async function createTicket(
    token: string,
    data: CreateTicketData,
    ): Promise<Ticket> {
    const response = await fetch(`${API_URL}/tickets`, {
        method: "POST",
        headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    })

    if (!response.ok) {
        throw new Error("Unable to create ticket")
    }

    return response.json() as Promise<Ticket>
}

export async function getTickets(token: string): Promise<Ticket[]> {
    const response = await fetch(`${API_URL}/tickets`, {
        headers: {
        Authorization: `Bearer ${token}`,
        },
    })

    if (!response.ok) {
        throw new Error("Unable to load tickets")
    }

    return response.json() as Promise<Ticket[]>
}

export async function getTicket(
    token: string,
    ticketId: number,
    ): Promise<Ticket> {
    const response = await fetch(`${API_URL}/tickets/${ticketId}`, {
        headers: {
        Authorization: `Bearer ${token}`,
        },
    })

    if (!response.ok) {
        throw new Error("Unable to load ticket")
    }

    return response.json() as Promise<Ticket>
}

export async function getMyTicket(
    token: string,
    creatorTicketNumber: number,
): Promise<Ticket> {
    const response = await fetch(
        `${API_URL}/tickets/my/${creatorTicketNumber}`,
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        },
    )

    if (!response.ok) {
        throw new Error("Unable to load ticket")
    }

    return response.json() as Promise<Ticket>
}

export async function assignTicket(
    token: string,
    ticketId: number,
    ): Promise<Ticket> {
    const response = await fetch(`${API_URL}/tickets/${ticketId}/assign`, {
        method: "PATCH",
        headers: {
        Authorization: `Bearer ${token}`,
        },
    })

    if (!response.ok) {
        throw new Error("Unable to assign ticket")
    }

    return response.json() as Promise<Ticket>
}

export async function releaseTicket(
    token: string,
    ticketId: number,
): Promise<Ticket> {
    const response = await fetch(
        `${API_URL}/tickets/${ticketId}/release`,
        {
            method: "PATCH",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        },
    )

    if (!response.ok) {
        throw new Error("Não foi possível liberar o chamado.")
    }

    return response.json() as Promise<Ticket>
}

export async function updateTicketStatus(
    token: string,
    ticketId: number,
    status: TicketStatus,
    ): Promise<Ticket> {
    const response = await fetch(`${API_URL}/tickets/${ticketId}/status`, {
        method: "PATCH",
        headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
    })

    if (!response.ok) {
        throw new Error("Unable to update ticket status")
    }

    return response.json() as Promise<Ticket>
}

export async function deleteTicket(
    token: string,
    ticketId: number,
): Promise<void> {
    const response = await fetch(`${API_URL}/tickets/${ticketId}`, {
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    })

    if (response.status === 404) {
        throw new Error("Chamado não encontrado.")
    }

    if (!response.ok) {
        throw new Error("Não foi possível excluir o chamado.")
    }
}
