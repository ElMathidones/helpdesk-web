import { API_URL } from "./api"
import type { Ticket, TicketStatus } from "../types/ticket"
import type { TicketPriority } from "../types/ticket"

interface CreateTicketData {
    title: string
    description: string
    priority: TicketPriority
    category_id: number
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
