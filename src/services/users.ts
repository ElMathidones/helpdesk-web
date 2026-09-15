import { API_URL } from "./api"
import type { User } from "../types/user"

export async function getCurrentUser(token: string): Promise<User> {
    const response = await fetch(`${API_URL}/users/me`, {
        headers: {
        Authorization: `Bearer ${token}`,
        },
    })

    if (!response.ok) {
        throw new Error("Unable to load current user")
    }

    return response.json() as Promise<User>
}
