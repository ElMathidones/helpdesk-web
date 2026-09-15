import { API_URL } from "./api"
import type { LoginCredentials, TokenResponse } from "../types/auth"

export async function login(
    credentials: LoginCredentials,
): Promise<TokenResponse> {
    const formData = new URLSearchParams()

    formData.append("username", credentials.email)
    formData.append("password", credentials.password)

    const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData,
    })

    if (!response.ok) {
        throw new Error("E-mail ou senha inválidos")
    }

    return response.json() as Promise<TokenResponse>
}
