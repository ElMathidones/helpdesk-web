import type { TicketHistory } from "../types/ticketHistory.ts"

const API_URL = import.meta.env.VITE_API_URL

export async function getTicketHistory(
    token: string,
    ticketId: number,
): Promise<TicketHistory[]> {
    const response = await fetch(`${API_URL}/tickets/${ticketId}/history`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    })

    if (!response.ok) {
        throw new Error("Não foi possível carregar o histórico do chamado.")
    }

    return response.json()
}
