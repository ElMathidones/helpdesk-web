import type { Comment } from "../types/comment"

const API_URL = import.meta.env.VITE_API_URL

export async function getComments(
    token: string,
    ticketId: number,
): Promise<Comment[]> {
    const response = await fetch(`${API_URL}/tickets/${ticketId}/comments`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    })

    if (!response.ok) {
        throw new Error("Não foi possível carregar os comentários.")
    }

    return response.json()
}

export async function createComment(
    token: string,
    ticketId: number,
    content: string,
): Promise<Comment> {
    const response = await fetch(`${API_URL}/tickets/${ticketId}/comments`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
            content,
        }),
    })

    if (!response.ok) {
        throw new Error("Não foi possível enviar o comentário.")
    }

    return response.json()
}
