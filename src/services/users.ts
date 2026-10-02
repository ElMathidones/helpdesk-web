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

export async function updateCurrentUser(
    token: string,
    name: string,
): Promise<User> {
    const response = await fetch(`${API_URL}/users/me`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
            name,
        }),
    })

    if (!response.ok) {
        throw new Error("Não foi possível atualizar o usuário.")
    }

    return response.json() as Promise<User>
}

export function getAvatarUrl(
    avatarFilename: string,
): string {
    return `${API_URL}/users/avatars/${encodeURIComponent(
        avatarFilename,
    )}`
}


export async function uploadCurrentUserAvatar(
    token: string,
    avatar: File,
): Promise<User> {
    const formData = new FormData()

    formData.append("avatar", avatar)

    const response = await fetch(
        `${API_URL}/users/me/avatar`,
        {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
            },
            body: formData,
        },
    )

    if (!response.ok) {
        const data = (await response.json()) as {
            detail?: string
        }

        throw new Error(
            data.detail ??
                "Não foi possível alterar a foto.",
        )
    }

    return response.json() as Promise<User>
}


export async function removeCurrentUserAvatar(
    token: string,
): Promise<User> {
    const response = await fetch(
        `${API_URL}/users/me/avatar`,
        {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        },
    )

    if (!response.ok) {
        throw new Error(
            "Não foi possível remover a foto.",
        )
    }

    return response.json() as Promise<User>
}
