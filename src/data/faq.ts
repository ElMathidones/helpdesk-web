
export interface FaqItem {
    id: string
    category: string
    question: string
    answer: string
}

export const faqItems: FaqItem[] = [
    {
        id: "create-ticket",
        category: "Chamados",
        question: "Como posso abrir um novo chamado?",
        answer:
            "Acesse a página Chamados, preencha o título, a descrição, a categoria e a prioridade do problema. Depois, envie o formulário para registrar o chamado.",
    },
    {
        id: "track-ticket",
        category: "Chamados",
        question: "Como acompanho o andamento do meu chamado?",
        answer:
            "Na página Chamados você encontra todas as solicitações associadas à sua conta. Clique em um chamado para visualizar seus detalhes, status, responsável, histórico e conversa.",
    },
    {
        id: "ticket-number",
        category: "Chamados",
        question: "O que significa o número do chamado?",
        answer:
            "O número identifica o chamado dentro do sistema. Para clientes, a numeração é sequencial dentro da própria conta, facilitando o acompanhamento das solicitações.",
    },
    {
        id: "ticket-edit",
        category: "Chamados",
        question: "Posso editar um chamado depois de criá-lo?",
        answer:
            "Atualmente, as informações principais do chamado não são editadas após a criação. Caso seja necessário complementar alguma informação, utilize a conversa disponível nos detalhes do chamado.",
    },
    {
        id: "ticket-delete",
        category: "Chamados",
        question: "Posso excluir um chamado?",
        answer:
            "A exclusão de chamados é uma ação administrativa. Clientes podem acompanhar suas solicitações, mas não excluí-las diretamente.",
    },
    {
        id: "priority",
        category: "Prioridades",
        question: "O que significam as prioridades dos chamados?",
        answer:
            "Baixa é usada para situações sem impacto relevante; Média para problemas que precisam de atenção, mas permitem continuar trabalhando; Alta para problemas com impacto significativo; e Crítica para situações urgentes ou que impedem completamente uma atividade importante.",
    },
    {
        id: "change-priority",
        category: "Prioridades",
        question: "Posso alterar a prioridade depois de abrir o chamado?",
        answer:
            "A prioridade é definida durante a abertura do chamado. Se a situação mudar, você pode informar isso pela conversa do chamado para que a equipe de suporte tenha o contexto atualizado.",
    },
    {
        id: "status-open",
        category: "Status",
        question: "O que significa o status Aberto?",
        answer:
            "Significa que o chamado foi registrado e está aguardando o início da análise pela equipe de suporte. Chamados liberados por um responsável também retornam para esse status.",
    },
    {
        id: "status-review",
        category: "Status",
        question: "O que significa Em análise?",
        answer:
            "Significa que a equipe de suporte iniciou a avaliação do chamado. Nessa etapa ele ainda não possui um responsável e precisa estar Em análise antes de poder ser assumido.",
    },
    {
        id: "status-progress",
        category: "Status",
        question: "O que significa Em andamento?",
        answer:
            "Significa que um administrador ou técnico assumiu o chamado, tornou-se responsável pelo atendimento e está trabalhando na solicitação.",
    },
    {
        id: "status-resolved-closed",
        category: "Status",
        question: "Qual a diferença entre Resolvido e Fechado?",
        answer:
            "Resolvido indica que a equipe considera o problema solucionado. Fechado representa a etapa final do fluxo, quando o chamado é encerrado definitivamente.",
    },
    {
        id: "status-canceled",
        category: "Status",
        question: "O que significa Cancelado?",
        answer:
            "Significa que o atendimento daquele chamado foi interrompido e não seguirá o fluxo normal de resolução.",
    },
    {
        id: "comments",
        category: "Atendimento",
        question: "Como converso com a equipe de suporte?",
        answer:
            "Abra os detalhes do chamado e utilize a área de conversa. As novas mensagens aparecem em tempo real para os usuários que estiverem acompanhando o mesmo chamado.",
    },
    {
        id: "assignee",
        category: "Atendimento",
        question: "O que significa responsável pelo chamado?",
        answer:
            "É o administrador ou técnico que assumiu o atendimento. Ao assumir um chamado Em análise, ele passa automaticamente para Em andamento e o usuário fica registrado como responsável.",
    },
    {
        id: "no-assignee",
        category: "Atendimento",
        question: "Meu chamado está sem responsável. Isso é um problema?",
        answer:
            "Não. Chamados Abertos ou Em análise podem permanecer sem responsável. Um responsável é definido quando um administrador ou técnico assume o atendimento.",
    },
    {
        id: "release-ticket",
        category: "Atendimento",
        question: "O que significa liberar um chamado?",
        answer:
            "Liberar um chamado significa deixar de ser o responsável pelo atendimento. O chamado volta de Em andamento para Aberto, fica sem responsável e pode passar novamente pelo processo de análise e atribuição.",
    },
    {
        id: "ticket-flow",
        category: "Atendimento",
        question: "Qual é o fluxo normal de um chamado?",
        answer:
            "Normalmente, o chamado começa como Aberto. Depois a equipe inicia a análise, passando para Em análise. Quando um técnico ou administrador assume o atendimento, ele passa para Em andamento. Após a solução, pode ser marcado como Resolvido e, por fim, Fechado.",
    },
    {
        id: "email-copy",
        category: "Notificações",
        question: "Posso receber uma cópia do chamado por e-mail?",
        answer:
            "Sim. Durante a criação do chamado, você pode solicitar o envio de uma cópia por e-mail com as principais informações da solicitação.",
    },
    {
        id: "assignment-email",
        category: "Notificações",
        question: "Técnicos recebem notificações por e-mail?",
        answer:
            "Sim. Quando um administrador ou técnico assume um chamado, o sistema pode enviar uma notificação ao e-mail da conta responsável pelo atendimento.",
    },
    {
        id: "roles",
        category: "Conta e permissões",
        question: "Quais tipos de usuário existem no sistema?",
        answer:
            "O Help Desk possui três perfis principais: Cliente, Técnico e Administrador. Cada perfil possui permissões diferentes de acordo com sua função no sistema.",
    },
    {
        id: "customer-permissions",
        category: "Conta e permissões",
        question: "Um cliente consegue visualizar chamados de outros clientes?",
        answer:
            "Não. Clientes têm acesso somente aos chamados associados à própria conta.",
    },
    {
        id: "technician-permissions",
        category: "Conta e permissões",
        question: "O que um técnico pode fazer?",
        answer:
            "Técnicos podem acompanhar chamados, iniciar análises, assumir atendimentos e participar das conversas. Depois que um chamado é assumido, somente o técnico responsável pode alterar seu fluxo; outros técnicos ainda podem visualizar o chamado, mas não controlar o atendimento.",
    },
    {
        id: "admin-permissions",
        category: "Conta e permissões",
        question: "O que um administrador pode fazer?",
        answer:
            "Administradores possuem acesso às funções administrativas do Help Desk, incluindo gerenciamento de categorias, chamados e relatórios. Também podem intervir no fluxo de chamados atribuídos a técnicos quando necessário.",
    },
    {
        id: "dark-mode",
        category: "Conta e permissões",
        question: "O sistema possui modo escuro?",
        answer:
            "Sim. O tema pode ser alterado nas configurações ou pelo controle disponível na interface. A preferência fica salva no navegador.",
    },
]
