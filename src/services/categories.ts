import { API_URL } from "./api"

import type {
    Category,
    CategoryCreate,
    CategoryUpdate,
} from "../types/category"


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


export async function createCategory(
    token: string,
    data: CategoryCreate,
): Promise<Category> {
    const response = await fetch(`${API_URL}/categories`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
    })

    if (response.status === 409) {
        throw new Error("Já existe uma categoria com esse nome.")
    }

    if (!response.ok) {
        throw new Error("Não foi possível criar a categoria.")
    }

    return response.json() as Promise<Category>
}


export async function updateCategory(
    token: string,
    categoryId: number,
    data: CategoryUpdate,
): Promise<Category> {
    const response = await fetch(
        `${API_URL}/categories/${categoryId}`,
        {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(data),
        },
    )

    if (response.status === 404) {
        throw new Error("Categoria não encontrada.")
    }

    if (response.status === 409) {
        throw new Error("Já existe uma categoria com esse nome.")
    }

    if (!response.ok) {
        throw new Error("Não foi possível atualizar a categoria.")
    }

    return response.json() as Promise<Category>
}


export async function updateCategoryOrder(
    token: string,
    categoryIds: number[],
): Promise<Category[]> {
    const response = await fetch(`${API_URL}/categories/order`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
            category_ids: categoryIds,
        }),
    })

    if (!response.ok) {
        throw new Error(
            "Não foi possível atualizar a ordem das categorias.",
        )
    }

    return response.json() as Promise<Category[]>
}


export async function updateCategoryStatus(
    token: string,
    categoryId: number,
    isActive: boolean,
): Promise<Category> {
    const response = await fetch(
        `${API_URL}/categories/${categoryId}/status`,
        {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                is_active: isActive,
            }),
        },
    )

    if (response.status === 404) {
        throw new Error("Categoria não encontrada.")
    }

    if (!response.ok) {
        throw new Error(
            "Não foi possível alterar o status da categoria.",
        )
    }

    return response.json() as Promise<Category>
}
