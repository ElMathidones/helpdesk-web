import { API_URL } from "./api"
import type { Category } from "../types/category"

export async function getCategories(token: string): Promise<Category[]> {
    const response = await fetch(`${API_URL}/categories`, {
        headers: {
        Authorization: `Bearer ${token}`,
        },
    })

    if (!response.ok) {
        throw new Error("Unable to load categories")
    }

    return response.json() as Promise<Category[]>
}
