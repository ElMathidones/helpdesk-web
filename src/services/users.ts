import { API_URL } from "./api"
import type { User } from "../types/user"

interface CreateUserData {
    name: string
    email: string
    password: string
}

export async function createUser(
    data: CreateUserData,
): Promise<User> {
    const response = await fetch(`${API_URL}/users`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    })

    if (response.status === 409) {
        throw new Error("Este e-mail já está cadastrado.")
    }

    if (!response.ok) {
        throw new Error("Não foi possível criar a conta.")
    }

    return response.json() as Promise<User>
}

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

export async function updateCurrentUserEmail(
    token: string,
    email: string,
    currentPassword: string,
): Promise<void> {
    const response = await fetch(`${API_URL}/users/me/email`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
            email,
            current_password: currentPassword,
        }),
    })

    if (response.status === 403) {
        throw new Error("INCORRECT_PASSWORD")
    }

    if (response.status === 409) {
        throw new Error("EMAIL_ALREADY_REGISTERED")
    }

    if (response.status === 429) {
        const data: { detail?: string } | null = await response
            .json()
            .catch(() => null)

        if (data?.detail === "Email change temporarily locked") {
            throw new Error("EMAIL_CHANGE_LOCKED")
        }

        if (data?.detail === "Please wait before requesting again") {
            throw new Error("EMAIL_REQUEST_TOO_SOON")
        }

        throw new Error("EMAIL_UPDATE_FAILED")
    }

    if (response.status === 503) {
        throw new Error("EMAIL_DELIVERY_FAILED")
    }

    if (response.status !== 202) {
        throw new Error("EMAIL_UPDATE_FAILED")
    }
}

export async function confirmEmailChange(
    token: string,
): Promise<void> {
    const response = await fetch(`${API_URL}/users/confirm-email`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ token }),
    })

    if (response.status === 400 || response.status === 422) {
        throw new Error("INVALID_CONFIRMATION_TOKEN")
    }

    if (response.status === 409) {
        throw new Error("EMAIL_ALREADY_REGISTERED")
    }

    if (!response.ok) {
        throw new Error("EMAIL_CONFIRMATION_FAILED")
    }
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
