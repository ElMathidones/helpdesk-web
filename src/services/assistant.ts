import { API_URL } from "./api"

interface AssistantChatResponse {
    answer: string
}

export async function sendAssistantMessage(
    token: string,
    message: string,
): Promise<string> {
    const response = await fetch(`${API_URL}/assistant/chat`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ message }),
    })

    if (!response.ok) {
        throw new Error("Não foi possível obter uma resposta do assistente.")
    }

    const data = (await response.json()) as AssistantChatResponse

    return data.answer
}
