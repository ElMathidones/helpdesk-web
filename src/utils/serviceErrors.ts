import i18n from "../i18n"

// Only known client-side service errors are translated. Unexpected backend messages
// are kept verbatim so important details are not lost.
const serviceErrorKeys: Record<string, string> = {
    "Este e-mail já está cadastrado.": "serviceErrors.emailRegistered",
    "Não foi possível criar a conta.": "serviceErrors.createAccount",
    "Já existe uma categoria com esse nome.": "serviceErrors.categoryExists",
    "Categoria não encontrada.": "serviceErrors.categoryNotFound",
    "Não foi possível criar a categoria.": "serviceErrors.categoryCreate",
    "Não foi possível atualizar a categoria.": "serviceErrors.categoryUpdate",
    "Não foi possível atualizar a ordem das categorias.": "serviceErrors.categoryOrder",
    "Não foi possível alterar o status da categoria.": "serviceErrors.categoryStatus",
    "Esta categoria já possui chamados e não pode ser excluída. Você pode desativá-la.": "serviceErrors.categoryInUse",
    "Não foi possível excluir a categoria.": "serviceErrors.categoryDelete",
    "Não foi possível liberar o chamado.": "serviceErrors.ticketRelease",
    "Chamado não encontrado.": "serviceErrors.ticketNotFound",
    "Não foi possível excluir o chamado.": "serviceErrors.ticketDelete",
    "Não foi possível atualizar o usuário.": "serviceErrors.updateUser",
    "Não foi possível alterar a foto.": "serviceErrors.changeAvatar",
    "Não foi possível remover a foto.": "serviceErrors.removeAvatar",
}

export function translateServiceError(error: unknown, fallback: string): string {
    if (!(error instanceof Error)) return fallback
    const key = serviceErrorKeys[error.message]
    return key ? i18n.t(key) : (error.message || fallback)
}
