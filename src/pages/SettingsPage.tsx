import {
    type DragEvent,
    type FormEvent,
    type ChangeEvent,
    useEffect,
    useRef,
    useState,
} from "react"

import { useAuth } from "../hooks/useAuth"
import { useTheme } from "../contexts/useTheme"

import {
    createCategory,
    getCategories,
    updateCategory,
    updateCategoryOrder,
    updateCategoryStatus,
} from "../services/categories"

import {
    getAvatarUrl,
    removeCurrentUserAvatar,
    updateCurrentUser,
    uploadCurrentUserAvatar,
} from "../services/users"

import type { Category } from "../types/category"


function SettingsPage() {
    const { user, token, refreshUser } = useAuth()
    const { theme, toggleTheme } = useTheme()

    const [profileName, setProfileName] = useState(user?.name ?? "")
    const [isUpdatingProfile, setIsUpdatingProfile] = useState(false)
    const [profileError, setProfileError] = useState("")
    const [profileSuccess, setProfileSuccess] = useState("")

    const [categories, setCategories] = useState<Category[]>([])
    const [isLoadingCategories, setIsLoadingCategories] = useState(false)

    const [newCategoryName, setNewCategoryName] = useState("")
    const [newCategoryDescription, setNewCategoryDescription] = useState("")
    const [isCreatingCategory, setIsCreatingCategory] = useState(false)
    const [isReorderingCategories, setIsReorderingCategories] =
        useState(false)

    const [editingCategoryId, setEditingCategoryId] = useState<number | null>(
        null,
    )
    const [updatingStatusCategoryId, setUpdatingStatusCategoryId] =
        useState<number | null>(null)
    
    const [editName, setEditName] = useState("")
    const [editDescription, setEditDescription] = useState("")
    const [isUpdatingCategory, setIsUpdatingCategory] = useState(false)

    const [draggedCategoryId, setDraggedCategoryId] =
        useState<number | null>(null)

    const [dragOverCategoryId, setDragOverCategoryId] =
        useState<number | null>(null)

    const dragStartCategoriesRef = useRef<Category[] | null>(null)

    const [categoryError, setCategoryError] = useState("")
    const [categorySuccess, setCategorySuccess] = useState("")

    const [isUpdatingAvatar, setIsUpdatingAvatar] =
        useState(false)

    const avatarInputRef =
        useRef<HTMLInputElement>(null)

    const isAdmin = user?.role === "admin"

    useEffect(() => {
        if (!profileSuccess) return

        const timeoutId = window.setTimeout(() => {
            setProfileSuccess("")
        }, 4000)

        return () => {
            window.clearTimeout(timeoutId)
        }
    }, [profileSuccess])

    useEffect(() => {
        if (!categorySuccess) return

        const timeoutId = window.setTimeout(() => {
            setCategorySuccess("")
        }, 4000)

        return () => {
            window.clearTimeout(timeoutId)
        }
    }, [categorySuccess])

    useEffect(() => {
        if (!token || !isAdmin) return

        const currentToken = token

        async function loadCategories() {
            setIsLoadingCategories(true)
            setCategoryError("")

            try {
                const data = await getCategories(currentToken)
                setCategories(data)
            } catch {
                setCategoryError(
                    "Não foi possível carregar as categorias.",
                )
            } finally {
                setIsLoadingCategories(false)
            }
        }

        void loadCategories()
    }, [token, isAdmin])

    async function handleCreateCategory(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()

        if (!token) return

        const name = newCategoryName.trim()
        const description = newCategoryDescription.trim()

        if (name.length < 2) {
            setCategoryError(
                "O nome da categoria deve ter pelo menos 2 caracteres.",
            )
            return
        }

        setIsCreatingCategory(true)
        setCategoryError("")
        setCategorySuccess("")

        try {
            const category = await createCategory(token, {
                name,
                description: description || null,
            })

            setCategories((current) => [...current, category])

            setNewCategoryName("")
            setNewCategoryDescription("")
            setCategorySuccess("Categoria criada com sucesso.")
        } catch (error) {
            setCategoryError(
                error instanceof Error
                    ? error.message
                    : "Não foi possível criar a categoria.",
            )
        } finally {
            setIsCreatingCategory(false)
        }
    }

    function handleStartEditing(category: Category) {
        setEditingCategoryId(category.id)
        setEditName(category.name)
        setEditDescription(category.description ?? "")
        setCategoryError("")
        setCategorySuccess("")
    }

    function handleCancelEditing() {
        setEditingCategoryId(null)
        setEditName("")
        setEditDescription("")
        setCategoryError("")
    }

    async function handleUpdateCategory(
        event: FormEvent<HTMLFormElement>,
        categoryId: number,
    ) {
        event.preventDefault()

        if (!token) return

        const name = editName.trim()
        const description = editDescription.trim()

        if (name.length < 2) {
            setCategoryError(
                "O nome da categoria deve ter pelo menos 2 caracteres.",
            )
            return
        }

        setIsUpdatingCategory(true)
        setCategoryError("")
        setCategorySuccess("")

        try {
            const updatedCategory = await updateCategory(
                token,
                categoryId,
                {
                    name,
                    description: description || null,
                },
            )

            setCategories((current) =>
                current.map((category) =>
                    category.id === categoryId
                        ? updatedCategory
                        : category,
                ),
            )

            setEditingCategoryId(null)
            setEditName("")
            setEditDescription("")
            setCategorySuccess("Categoria atualizada com sucesso.")
        } catch (error) {
            setCategoryError(
                error instanceof Error
                    ? error.message
                    : "Não foi possível atualizar a categoria.",
            )
        } finally {
            setIsUpdatingCategory(false)
        }
    }

    async function persistCategoryOrder(
        reorderedCategories: Category[],
        previousCategories: Category[],
    ) {
        if (!token) return

        setIsReorderingCategories(true)
        setCategoryError("")
        setCategorySuccess("")

        try {
            const updatedCategories = await updateCategoryOrder(
                token,
                reorderedCategories.map((category) => category.id),
            )

            setCategories(updatedCategories)
            setCategorySuccess("Ordem das categorias atualizada.")
        } catch (error) {
            setCategories(previousCategories)

            setCategoryError(
                error instanceof Error
                    ? error.message
                    : "Não foi possível atualizar a ordem das categorias.",
            )
        } finally {
            setIsReorderingCategories(false)
        }
    }

    async function handleMoveCategory(
        categoryId: number,
        direction: "up" | "down",
    ) {
        if (!token || isReorderingCategories) return

        const currentIndex = categories.findIndex(
            (category) => category.id === categoryId,
        )

        const targetIndex =
            direction === "up"
                ? currentIndex - 1
                : currentIndex + 1

        if (
            currentIndex === -1 ||
            targetIndex < 0 ||
            targetIndex >= categories.length
        ) {
            return
        }

        const previousCategories = categories
        const reorderedCategories = [...categories]

        ;[
            reorderedCategories[currentIndex],
            reorderedCategories[targetIndex],
        ] = [
            reorderedCategories[targetIndex],
            reorderedCategories[currentIndex],
        ]

        setCategories(reorderedCategories)

        await persistCategoryOrder(
            reorderedCategories,
            previousCategories,
        )
    }

    function handleDragStart(
        event: DragEvent<HTMLElement>,
        categoryId: number,
    ) {
        if (isReorderingCategories || editingCategoryId !== null) {
            event.preventDefault()
            return
        }

        dragStartCategoriesRef.current = categories

        setDraggedCategoryId(categoryId)
        setDragOverCategoryId(categoryId)

        event.dataTransfer.effectAllowed = "move"
        event.dataTransfer.setData(
            "text/plain",
            String(categoryId),
        )
    }


    function handleDragEnter(categoryId: number) {
        if (
            draggedCategoryId === null ||
            draggedCategoryId === categoryId ||
            dragOverCategoryId === categoryId
        ) {
            return
        }

        setDragOverCategoryId(categoryId)

        setCategories((current) => {
            const fromIndex = current.findIndex(
                (category) => category.id === draggedCategoryId,
            )

            const toIndex = current.findIndex(
                (category) => category.id === categoryId,
            )

            if (
                fromIndex === -1 ||
                toIndex === -1 ||
                fromIndex === toIndex
            ) {
                return current
            }

            const reordered = [...current]
            const [draggedCategory] = reordered.splice(fromIndex, 1)

            reordered.splice(toIndex, 0, draggedCategory)

            return reordered
        })
    }


    function handleDragOver(event: DragEvent<HTMLElement>) {
        event.preventDefault()
        event.dataTransfer.dropEffect = "move"
    }


    function handleDrop(event: DragEvent<HTMLElement>) {
        event.preventDefault()
    }


    async function handleDragEnd() {
        const previousCategories = dragStartCategoriesRef.current

        setDraggedCategoryId(null)
        setDragOverCategoryId(null)
        dragStartCategoriesRef.current = null

        if (!previousCategories) return

        const previousIds = previousCategories.map(
            (category) => category.id,
        )

        const currentIds = categories.map(
            (category) => category.id,
        )

        const orderChanged = previousIds.some(
            (id, index) => id !== currentIds[index],
        )

        if (!orderChanged) return

        await persistCategoryOrder(
            categories,
            previousCategories,
        )
    }

    async function handleUpdateProfile(
        event: FormEvent<HTMLFormElement>,
    ) {
        event.preventDefault()

        if (!token) return

        const name = profileName.trim()

        if (name.length < 2) {
            setProfileError(
                "O nome deve ter pelo menos 2 caracteres.",
            )
            return
        }

        setIsUpdatingProfile(true)
        setProfileError("")
        setProfileSuccess("")

        try {
            await updateCurrentUser(token, name)
            await refreshUser()

            setProfileName(name)
            setProfileSuccess("Nome atualizado com sucesso.")
        } catch {
            setProfileError(
                "Não foi possível atualizar seu nome.",
            )
        } finally {
            setIsUpdatingProfile(false)
        }
    }

    async function handleToggleCategoryStatus(
        category: Category,
    ) {
        if (!token || updatingStatusCategoryId !== null) return

        setUpdatingStatusCategoryId(category.id)
        setCategoryError("")
        setCategorySuccess("")

        try {
            const updatedCategory = await updateCategoryStatus(
                token,
                category.id,
                !category.is_active,
            )

            setCategories((current) =>
                current.map((item) =>
                    item.id === category.id
                        ? updatedCategory
                        : item,
                ),
            )

            setCategorySuccess(
                updatedCategory.is_active
                    ? "Categoria reativada com sucesso."
                    : "Categoria desativada com sucesso.",
            )
        } catch (error) {
            setCategoryError(
                error instanceof Error
                    ? error.message
                    : "Não foi possível alterar a categoria.",
            )
        } finally {
            setUpdatingStatusCategoryId(null)
        }
    }

    async function handleAvatarChange(
        event: ChangeEvent<HTMLInputElement>,
    ) {
        const file = event.target.files?.[0]

        if (!file || !token) return

        setProfileError("")
        setProfileSuccess("")

        if (file.size > 2 * 1024 * 1024) {
            setProfileError(
                "A foto deve ter no máximo 2 MB.",
            )

            event.target.value = ""
            return
        }

        const allowedTypes = [
            "image/jpeg",
            "image/png",
            "image/webp",
        ]

        if (!allowedTypes.includes(file.type)) {
            setProfileError(
                "Use uma imagem JPEG, PNG ou WebP.",
            )

            event.target.value = ""
            return
        }

        setIsUpdatingAvatar(true)

        try {
            await uploadCurrentUserAvatar(
                token,
                file,
            )

            await refreshUser()

            setProfileSuccess(
                "Foto de perfil atualizada com sucesso.",
            )
        } catch (error) {
            setProfileError(
                error instanceof Error
                    ? error.message
                    : "Não foi possível alterar a foto.",
            )
        } finally {
            setIsUpdatingAvatar(false)
            event.target.value = ""
        }
    }

    async function handleRemoveAvatar() {
        if (!token || !user?.avatar_filename) return

        setIsUpdatingAvatar(true)
        setProfileError("")
        setProfileSuccess("")

        try {
            await removeCurrentUserAvatar(token)
            await refreshUser()

            setProfileSuccess(
                "Foto de perfil removida.",
            )
        } catch (error) {
            setProfileError(
                error instanceof Error
                    ? error.message
                    : "Não foi possível remover a foto.",
            )
        } finally {
            setIsUpdatingAvatar(false)
        }
    }

    return (
        <div className="settings-page">
            <div className="settings-header">
                <div>
                    <h1>Configurações</h1>
                    <p>
                        Gerencie suas preferências e configurações do sistema.
                    </p>
                </div>
            </div>

            <section className="settings-section">
                <div className="settings-section-header">
                    <div>
                        <h2>Minha conta</h2>
                        <p>
                            Informações associadas ao seu usuário.
                        </p>
                    </div>
                </div>

                <div className="settings-avatar-row">
                    <div className="settings-avatar-preview">
                        {user?.avatar_filename ? (
                            <img
                                src={getAvatarUrl(user.avatar_filename)}
                                alt={`Foto de ${user.name}`}
                            />
                        ) : (
                            <span>
                                {user?.name
                                    ?.trim()
                                    .charAt(0)
                                    .toUpperCase() || "?"}
                            </span>
                        )}
                    </div>

                    <div className="settings-avatar-content">
                        <strong>Foto de perfil</strong>

                        <span>
                            JPEG, PNG ou WebP. Máximo de 2 MB.
                        </span>

                        <div className="settings-avatar-actions">
                            <input
                                ref={avatarInputRef}
                                className="settings-avatar-input"
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                onChange={(event) => {
                                    void handleAvatarChange(event)
                                }}
                            />

                            <button
                                type="button"
                                className="settings-primary-button"
                                onClick={() =>
                                    avatarInputRef.current?.click()
                                }
                                disabled={isUpdatingAvatar}
                            >
                                {isUpdatingAvatar
                                    ? "Enviando..."
                                    : user?.avatar_filename
                                    ? "Alterar foto"
                                    : "Adicionar foto"}
                            </button>

                            {user?.avatar_filename && (
                                <button
                                    type="button"
                                    className="settings-secondary-button"
                                    onClick={() => {
                                        void handleRemoveAvatar()
                                    }}
                                    disabled={isUpdatingAvatar}
                                >
                                    Remover
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                <div className="settings-account-grid">
                    <div className="settings-field settings-profile-field">
                        <form
                            className="settings-profile-form"
                            onSubmit={handleUpdateProfile}
                        >
                            <div className="settings-form-field">
                                <label htmlFor="profile-name">Nome</label>

                                <input
                                    id="profile-name"
                                    type="text"
                                    minLength={2}
                                    maxLength={120}
                                    value={profileName}
                                    onChange={(event) =>
                                        setProfileName(event.target.value)
                                    }
                                />
                            </div>

                            <button
                                type="submit"
                                className="settings-primary-button"
                                disabled={
                                    isUpdatingProfile ||
                                    profileName.trim() ===
                                        (user?.name ?? "").trim()
                                }
                            >
                                {isUpdatingProfile
                                    ? "Salvando..."
                                    : "Salvar nome"}
                            </button>
                        </form>
                    </div>

                    <div className="settings-field">
                        <span>E-mail</span>
                        <strong>{user?.email}</strong>
                    </div>

                    <div className="settings-field">
                        <span>Perfil</span>
                        <strong>{formatRole(user?.role)}</strong>
                    </div>
                </div>

                {(profileError || profileSuccess) && (
                    <div className="settings-profile-feedback">
                        {profileError && (
                            <p className="error-message">
                                {profileError}
                            </p>
                        )}

                        {profileSuccess && (
                            <p className="settings-success-message">
                                {profileSuccess}
                            </p>
                        )}
                    </div>
                )}
            </section>

            <section className="settings-section">
                <div className="settings-section-header">
                    <div>
                        <h2>Aparência</h2>
                        <p>
                            Escolha como o Help Desk é exibido para você.
                        </p>
                    </div>
                </div>

                <div className="settings-theme-row">
                    <div>
                        <strong>
                            {theme === "light"
                                ? "Tema claro"
                                : "Tema escuro"}
                        </strong>

                        <span>
                            O tema escolhido fica salvo neste navegador.
                        </span>
                    </div>

                    <button
                        type="button"
                        className="settings-secondary-button"
                        onClick={toggleTheme}
                    >
                        {theme === "light"
                            ? "Usar tema escuro"
                            : "Usar tema claro"}
                    </button>
                </div>
            </section>

            {isAdmin && (
                <section className="settings-section">
                    <div className="settings-section-header">
                        <div>
                            <h2>Categorias</h2>
                            <p>
                                Gerencie as categorias utilizadas nos chamados.
                            </p>
                        </div>
                    </div>

                    <form
                        className="settings-category-form"
                        onSubmit={handleCreateCategory}
                    >
                        <div className="settings-form-field">
                            <label htmlFor="category-name">
                                Nome
                            </label>

                            <input
                                id="category-name"
                                type="text"
                                maxLength={100}
                                value={newCategoryName}
                                onChange={(event) =>
                                    setNewCategoryName(event.target.value)
                                }
                                placeholder="Ex.: Software"
                            />
                        </div>

                        <div className="settings-form-field">
                            <label htmlFor="category-description">
                                Descrição
                            </label>

                            <input
                                id="category-description"
                                type="text"
                                maxLength={255}
                                value={newCategoryDescription}
                                onChange={(event) =>
                                    setNewCategoryDescription(
                                        event.target.value,
                                    )
                                }
                                placeholder="Descrição opcional"
                            />
                        </div>

                        <button
                            type="submit"
                            className="settings-primary-button"
                            disabled={isCreatingCategory}
                        >
                            {isCreatingCategory
                                ? "Criando..."
                                : "Nova categoria"}
                        </button>
                    </form>

                    {categoryError && (
                        <p className="error-message">
                            {categoryError}
                        </p>
                    )}

                    {categorySuccess && (
                        <p className="settings-success-message">
                            {categorySuccess}
                        </p>
                    )}

                    {isLoadingCategories ? (
                        <p>Carregando categorias...</p>
                    ) : categories.length === 0 ? (
                        <p className="settings-empty-message">
                            Nenhuma categoria cadastrada.
                        </p>
                    ) : (
                        <div className="settings-category-list">
                            {categories.map((category, index) => (
                                <article
                                    className={[
                                        "settings-category-item",
                                        draggedCategoryId === category.id
                                            ? "settings-category-item-dragging"
                                            : "",
                                        dragOverCategoryId === category.id &&
                                        draggedCategoryId !== category.id
                                            ? "settings-category-item-drag-over"
                                            : "",
                                    ]
                                        .filter(Boolean)
                                        .join(" ")}
                                    key={category.id}
                                    onDragEnter={() =>
                                        handleDragEnter(category.id)
                                    }
                                    onDragOver={handleDragOver}
                                    onDrop={handleDrop}
                                >
                                    {editingCategoryId === category.id ? (
                                        <form
                                            className="settings-category-edit"
                                            onSubmit={(event) =>
                                                handleUpdateCategory(
                                                    event,
                                                    category.id,
                                                )
                                            }
                                        >
                                            <div className="settings-form-field">
                                                <label
                                                    htmlFor={`category-edit-name-${category.id}`}
                                                >
                                                    Nome
                                                </label>

                                                <input
                                                    id={`category-edit-name-${category.id}`}
                                                    type="text"
                                                    maxLength={100}
                                                    value={editName}
                                                    onChange={(event) =>
                                                        setEditName(
                                                            event.target.value,
                                                        )
                                                    }
                                                />
                                            </div>

                                            <div className="settings-form-field">
                                                <label
                                                    htmlFor={`category-edit-description-${category.id}`}
                                                >
                                                    Descrição
                                                </label>

                                                <input
                                                    id={`category-edit-description-${category.id}`}
                                                    type="text"
                                                    maxLength={255}
                                                    value={editDescription}
                                                    onChange={(event) =>
                                                        setEditDescription(
                                                            event.target.value,
                                                        )
                                                    }
                                                />
                                            </div>

                                            <div className="settings-category-actions">
                                                <button
                                                    type="submit"
                                                    className="settings-primary-button"
                                                    disabled={
                                                        isUpdatingCategory
                                                    }
                                                >
                                                    {isUpdatingCategory
                                                        ? "Salvando..."
                                                        : "Salvar"}
                                                </button>

                                                <button
                                                    type="button"
                                                    className="settings-secondary-button"
                                                    onClick={
                                                        handleCancelEditing
                                                    }
                                                    disabled={
                                                        isUpdatingCategory
                                                    }
                                                >
                                                    Cancelar
                                                </button>
                                            </div>
                                        </form>
                                    ) : (
                                        <>
                                            <div className="settings-category-content">
                                                <strong>
                                                    {category.name}
                                                </strong>

                                                <span>
                                                    {category.description ??
                                                        "Sem descrição"}
                                                </span>
                                            </div>

                                            <div className="settings-category-actions">
                                                <span
                                                    className="settings-drag-handle"
                                                    draggable={
                                                        editingCategoryId === null &&
                                                        !isReorderingCategories
                                                    }
                                                    onDragStart={(event) =>
                                                        handleDragStart(event, category.id)
                                                    }
                                                    onDragEnd={() => {
                                                        void handleDragEnd()
                                                    }}
                                                    title="Arrastar para reorganizar"
                                                    aria-hidden="true"
                                                >
                                                    ⠿
                                                </span>
                                                
                                                <button
                                                    type="button"
                                                    className="settings-order-button"
                                                    onClick={() =>
                                                        handleMoveCategory(category.id, "up")
                                                    }
                                                    disabled={
                                                        index === 0 ||
                                                        isReorderingCategories
                                                    }
                                                    aria-label={`Mover ${category.name} para cima`}
                                                    title="Mover para cima"
                                                >
                                                    <span
                                                        className="settings-order-chevron settings-order-chevron-up"
                                                    />
                                                </button>

                                                <button
                                                    type="button"
                                                    className="settings-order-button"
                                                    onClick={() =>
                                                        handleMoveCategory(category.id, "down")
                                                    }
                                                    disabled={
                                                        index === categories.length - 1 ||
                                                        isReorderingCategories
                                                    }
                                                    aria-label={`Mover ${category.name} para baixo`}
                                                    title="Mover para baixo"
                                                >
                                                    <span
                                                        className="settings-order-chevron settings-order-chevron-down"
                                                    />
                                                </button>

                                                <span
                                                    className={
                                                        category.is_active
                                                            ? "settings-status-active"
                                                            : "settings-status-inactive"
                                                    }
                                                >
                                                    {category.is_active
                                                        ? "Ativa"
                                                        : "Inativa"}
                                                </span>

                                                <button
                                                    type="button"
                                                    className="settings-secondary-button"
                                                    onClick={() =>
                                                        handleStartEditing(
                                                            category,
                                                        )
                                                    }
                                                >
                                                    Editar
                                                </button>

                                                <button
                                                    type="button"
                                                    className={
                                                        category.is_active
                                                            ? "settings-danger-button"
                                                            : "settings-reactivate-button"
                                                    }
                                                    onClick={() =>
                                                        void handleToggleCategoryStatus(category)
                                                    }
                                                    disabled={
                                                        updatingStatusCategoryId === category.id
                                                    }
                                                >
                                                    {updatingStatusCategoryId === category.id
                                                        ? "Salvando..."
                                                        : category.is_active
                                                        ? "Desativar"
                                                        : "Reativar"}
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </article>
                            ))}
                        </div>
                    )}
                </section>
            )}
        </div>
    )
}


function formatRole(role?: string) {
    const labels: Record<string, string> = {
        admin: "Administrador",
        technician: "Técnico",
        customer: "Cliente",
    }

    return role ? labels[role] ?? role : "-"
}


export default SettingsPage
