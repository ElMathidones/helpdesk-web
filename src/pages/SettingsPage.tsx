import {
    type DragEvent,
    type FormEvent,
    type ChangeEvent,
    useEffect,
    useRef,
    useState,
} from "react"

import { useTranslation } from "react-i18next"
import { translateServiceError } from "../utils/serviceErrors"

import { useAuth } from "../hooks/useAuth"
import { useTheme } from "../contexts/useTheme"

import {
    createCategory,
    deleteCategory,
    getCategories,
    updateCategory,
    updateCategoryOrder,
    updateCategoryStatus,
} from "../services/categories"

import {
    getAvatarUrl,
    removeCurrentUserAvatar,
    updateCurrentUser,
    updateCurrentUserEmail,
    uploadCurrentUserAvatar,
} from "../services/users"

import type { Category } from "../types/category"

import FilterSelect from "../components/FilterSelect"

function SettingsPage() {
    const { user, token, refreshUser } = useAuth()
    const { theme, toggleTheme } = useTheme()
    const { t, i18n } = useTranslation()

    const [profileNameDraft, setProfileNameDraft] =
    useState<string | null>(null)

    const profileName = profileNameDraft ?? user?.name ?? ""

    const [emailDraft, setEmailDraft] = useState<string | null>(null)
    const [emailPassword, setEmailPassword] = useState("")
    const [isUpdatingEmail, setIsUpdatingEmail] = useState(false)
    const [pendingEmailConfirmation, setPendingEmailConfirmation] =
        useState<string | null>(null)

    const profileEmail = emailDraft ?? user?.email ?? ""
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
    const [deletingCategoryId, setDeletingCategoryId] =
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
                    t("settings.feedback.loadCategoriesError"),
                )
            } finally {
                setIsLoadingCategories(false)
            }
        }

        void loadCategories()
    }, [token, isAdmin, t])

    async function handleCreateCategory(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()

        if (!token) return

        const name = newCategoryName.trim()
        const description = newCategoryDescription.trim()

        if (name.length < 2) {
            setCategoryError(
                t("settings.feedback.categoryNameTooShort"),
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
            setCategorySuccess(t("settings.feedback.categoryCreated"))
        } catch (error) {
            setCategoryError(
                translateServiceError(error, t("settings.feedback.createCategoryError")),
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
                t("settings.feedback.categoryNameTooShort"),
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
            setCategorySuccess(t("settings.feedback.categoryUpdated"))
        } catch (error) {
            setCategoryError(
                translateServiceError(error, t("settings.feedback.updateCategoryError")),
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
            setCategorySuccess(t("settings.feedback.orderUpdated"))
        } catch (error) {
            setCategories(previousCategories)

            setCategoryError(
                translateServiceError(error, t("settings.feedback.orderError")),
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
                t("settings.feedback.profileNameTooShort"),
            )
            return
        }

        setIsUpdatingProfile(true)
        setProfileError("")
        setProfileSuccess("")

        try {
            await updateCurrentUser(token, name)
            await refreshUser()

            setProfileNameDraft(null)
            setProfileSuccess(t("settings.feedback.profileUpdated"))
        } catch {
            setProfileError(
                t("settings.feedback.profileError"),
            )
        } finally {
            setIsUpdatingProfile(false)
        }
    }

    async function handleUpdateEmail(
        event: FormEvent<HTMLFormElement>,
    ) {
        event.preventDefault()

        if (!token || !user) return

        const newEmail = profileEmail.trim().toLowerCase()

        if (
            !newEmail ||
            !emailPassword ||
            newEmail === user.email.toLowerCase()
        ) {
            return
        }

        setIsUpdatingEmail(true)
        setProfileError("")
        setProfileSuccess("")

        try {
            await updateCurrentUserEmail(
                token,
                newEmail,
                emailPassword,
            )

            setEmailDraft(null)
            setEmailPassword("")
            setPendingEmailConfirmation(newEmail)

        } catch (error) {
            const errorCode =
                error instanceof Error ? error.message : ""

            if (errorCode === "INCORRECT_PASSWORD") {
                setProfileError(
                    t("settings.feedback.incorrectPassword"),
                )
            } else if (errorCode === "EMAIL_ALREADY_REGISTERED") {
                setProfileError(
                    t("settings.feedback.emailAlreadyRegistered"),
                )
            } else if (errorCode === "EMAIL_REQUEST_TOO_SOON") {
                setProfileError(
                    t("settings.feedback.emailRequestTooSoon"),
                )
            } else if (errorCode === "EMAIL_CHANGE_LOCKED") {
                setProfileError(
                    t("settings.feedback.emailChangeLocked"),
                )
            } else if (errorCode === "EMAIL_DELIVERY_FAILED") {
                setProfileError(
                    t("settings.feedback.emailDeliveryError"),
                )
            } else {
                setProfileError(
                    t("settings.feedback.emailUpdateError"),
                )
            }
        } finally {
            setIsUpdatingEmail(false)
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
                    ? t("settings.feedback.categoryReactivated")
                    : t("settings.feedback.categoryDeactivated"),
            )
        } catch (error) {
            setCategoryError(
                translateServiceError(error, t("settings.feedback.changeCategoryError")),
            )
        } finally {
            setUpdatingStatusCategoryId(null)
        }
    }

    async function handleDeleteCategory(category: Category) {
        if (!token || deletingCategoryId !== null) {
            return
        }

        const confirmed = window.confirm(
            t("settings.categories.confirmDelete", {
                name: category.name,
            }),
        )

        if (!confirmed) {
            return
        }

        setDeletingCategoryId(category.id)
        setCategoryError("")
        setCategorySuccess("")

        try {
            await deleteCategory(token, category.id)

            setCategories((current) =>
                current.filter((item) => item.id !== category.id),
            )

            setCategorySuccess(t("settings.feedback.categoryDeleted"))
        } catch (error) {
            setCategoryError(
                translateServiceError(error, t("settings.feedback.deleteCategoryError")),
            )
        } finally {
            setDeletingCategoryId(null)
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
                t("settings.feedback.avatarTooLarge"),
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
                t("settings.feedback.avatarInvalidFormat"),
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
                t("settings.feedback.avatarUpdated"),
            )
        } catch (error) {
            setProfileError(
                translateServiceError(error, t("settings.feedback.avatarError")),
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
                t("settings.feedback.avatarRemoved"),
            )
        } catch (error) {
            setProfileError(
                translateServiceError(error, t("settings.feedback.avatarRemoveError")),
            )
        } finally {
            setIsUpdatingAvatar(false)
        }
    }

    return (
        <div className="settings-page">
            <div className="settings-header">
                <div>
                    <h1>{t("settings.page.title")}</h1>
                    <p>
                        {t("settings.page.description")}
                    </p>
                </div>
            </div>

            <section className="settings-section">
                <div className="settings-section-header">
                    <div>
                        <h2>{t("settings.account.title")}</h2>
                        <p>
                            {t("settings.account.description")}
                        </p>
                    </div>
                </div>

                <div className="settings-avatar-row">
                    <div className="settings-avatar-preview">
                        {user?.avatar_filename ? (
                            <img
                                src={getAvatarUrl(user.avatar_filename)}
                                alt={t("settings.account.avatarAlt", { name: user.name })}
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
                        <strong>{t("settings.account.avatarTitle")}</strong>

                        <span>
                            {t("settings.account.avatarFormats")}
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
                                    ? t("settings.account.uploading")
                                    : user?.avatar_filename
                                    ? t("settings.account.changePhoto")
                                    : t("settings.account.addPhoto")}
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
                                    {t("settings.account.removePhoto")}
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
                                <label htmlFor="profile-name">{t("settings.account.name")}</label>

                                <input
                                    id="profile-name"
                                    type="text"
                                    minLength={2}
                                    maxLength={120}
                                    value={profileName}
                                    onChange={(event) =>
                                        setProfileNameDraft(event.target.value)
                                    }
                                    onBlur={() => {
                                        if (!profileName.trim()) {
                                            setProfileNameDraft(null)
                                            setProfileError("")
                                        }
                                    }}
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
                                    ? t("settings.common.saving")
                                    : t("settings.account.saveName")}
                            </button>
                        </form>
                    </div>

                    <div className="settings-field">
                        <span>{t("settings.account.email")}</span>
                        <strong>{user?.email}</strong>
                    </div>

                    <div className="settings-field">
                        <span>{t("settings.account.role")}</span>
                        <strong>
                            {user?.role
                                ? t(`roles.${user.role}`, {
                                    defaultValue: user.role,
                                })
                                : "-"}
                        </strong>
                    </div>
                </div>

                <form
                    className="settings-email-form"
                    onSubmit={handleUpdateEmail}
                >
                    <div className="settings-email-heading">
                        <strong>
                            {t("settings.account.changeEmail")}
                        </strong>
                    </div>

                    <div className="settings-form-field">
                        <label htmlFor="profile-email">
                            {t("settings.account.email")}
                        </label>

                        <input
                            id="profile-email"
                            type="email"
                            autoComplete="email"
                            maxLength={255}
                            required
                            value={profileEmail}
                            onChange={(event) =>
                                setEmailDraft(event.target.value)
                            }
                            onBlur={() => {
                                if (!profileEmail.trim()) {
                                    setEmailDraft(null)
                                }
                            }}
                        />
                    </div>

                    <div className="settings-form-field">
                        <label htmlFor="email-current-password">
                            {t("settings.account.currentPassword")}
                        </label>

                        <input
                            id="email-current-password"
                            type="password"
                            autoComplete="current-password"
                            maxLength={128}
                            required
                            value={emailPassword}
                            onChange={(event) =>
                                setEmailPassword(event.target.value)
                            }
                        />
                    </div>

                    <div className="settings-email-actions">
                        <button
                            type="button"
                            className="settings-secondary-button"
                            disabled={isUpdatingEmail}
                            onClick={() => {
                                setEmailDraft(null)
                                setEmailPassword("")
                                setProfileError("")
                            }}
                        >
                            {t("settings.common.cancel")}
                        </button>

                        <button
                            type="submit"
                            className="settings-primary-button"
                            disabled={
                                isUpdatingEmail ||
                                !emailPassword ||
                                !profileEmail.trim() ||
                                profileEmail.trim().toLowerCase() ===
                                    (user?.email ?? "").toLowerCase()
                            }
                        >
                            {isUpdatingEmail
                                ? t("settings.common.saving")
                                : t("settings.account.saveEmail")}
                        </button>
                    </div>
                </form>

                {(
                    profileError ||
                    profileSuccess ||
                    pendingEmailConfirmation
                ) && (
                    <div className="settings-profile-feedback">
                        {profileError && (
                            <p className="error-message" role="alert">
                                {profileError}
                            </p>
                        )}

                        {profileSuccess && (
                            <p className="settings-success-message">
                                {profileSuccess}
                            </p>
                        )}

                        {pendingEmailConfirmation && (
                            <p
                                className="settings-success-message"
                                role="status"
                            >
                                {t("settings.feedback.emailConfirmationSent", {
                                    email: pendingEmailConfirmation,
                                })}
                            </p>
                        )}
                    </div>
                )}
            </section>

            <section className="settings-section">
                <div className="settings-section-header">
                    <div>
                        <h2>{t("settings.appearance.title")}</h2>
                        <p>
                            {t("settings.appearance.description")}
                        </p>
                    </div>
                </div>

                <div className="settings-theme-row">
                    <div>
                        <strong>
                            {theme === "light"
                                ? t("settings.appearance.light")
                                : t("settings.appearance.dark")}
                        </strong>

                        <span>
                            {t("settings.appearance.saved")}
                        </span>
                    </div>

                    <button
                        type="button"
                        className="settings-secondary-button"
                        onClick={toggleTheme}
                    >
                        {theme === "light"
                            ? t("settings.appearance.useDark")
                            : t("settings.appearance.useLight")}
                    </button>
                </div>

                <div className="settings-theme-row">
                    <div>
                        <label htmlFor="settings-language">
                            <strong>{t("settings.language.title")}</strong>
                        </label>
                        <span>{t("settings.language.description")}</span>
                    </div>

                    <FilterSelect
                        id="settings-language"
                        value={i18n.resolvedLanguage ?? "pt-BR"}
                        onChange={(language) => {
                            void i18n.changeLanguage(language)
                        }}
                        options={[
                            { value: "pt-BR", label: "Português (Brasil)" },
                            { value: "en-US", label: "English (US)" },
                            { value: "es", label: "Español" },
                        ]}
                    />
                </div>
            </section>

            {isAdmin && (
                <section className="settings-section">
                    <div className="settings-section-header">
                        <div>
                            <h2>{t("settings.categories.title")}</h2>
                            <p>
                                {t("settings.categories.description")}
                            </p>
                        </div>
                    </div>

                    <form
                        className="settings-category-form"
                        onSubmit={handleCreateCategory}
                    >
                        <div className="settings-form-field">
                            <label htmlFor="category-name">
                                {t("settings.account.name")}
                            </label>

                            <input
                                id="category-name"
                                type="text"
                                maxLength={100}
                                value={newCategoryName}
                                onChange={(event) =>
                                    setNewCategoryName(event.target.value)
                                }
                                placeholder={t("settings.categories.namePlaceholder")}
                            />
                        </div>

                        <div className="settings-form-field">
                            <label htmlFor="category-description">
                                {t("settings.categories.descriptionLabel")}
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
                                placeholder={t("settings.categories.descriptionPlaceholder")}
                            />
                        </div>

                        <button
                            type="submit"
                            className="settings-primary-button"
                            disabled={isCreatingCategory}
                        >
                            {isCreatingCategory
                                ? t("settings.categories.creating")
                                : t("settings.categories.new")}
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
                        <p>{t("settings.categories.loading")}</p>
                    ) : categories.length === 0 ? (
                        <p className="settings-empty-message">
                            {t("settings.categories.empty")}
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
                                                    {t("settings.account.name")}
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
                                                    {t("settings.categories.descriptionLabel")}
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
                                                        ? t("settings.common.saving")
                                                        : t("settings.common.save")}
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
                                                    {t("settings.common.cancel")}
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
                                                        t("settings.categories.noDescription")}
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
                                                    title={t("settings.categories.drag")}
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
                                                    aria-label={t("settings.categories.moveCategoryUp", { name: category.name })}
                                                    title={t("settings.categories.moveUp")}
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
                                                    aria-label={t("settings.categories.moveCategoryDown", { name: category.name })}
                                                    title={t("settings.categories.moveDown")}
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
                                                        ? t("settings.categories.active")
                                                        : t("settings.categories.inactive")}
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
                                                    {t("settings.categories.edit")}
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
                                                        ? t("settings.common.saving")
                                                        : category.is_active
                                                        ? t("settings.categories.deactivate")
                                                        : t("settings.categories.reactivate")}
                                                </button>

                                                <button
                                                    type="button"
                                                    className="settings-danger-button"
                                                    onClick={() => {
                                                        void handleDeleteCategory(category)
                                                    }}
                                                    disabled={deletingCategoryId === category.id}
                                                >
                                                    {deletingCategoryId === category.id
                                                        ? t("settings.categories.deleting")
                                                        : t("settings.categories.delete")}
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


export default SettingsPage
