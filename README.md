# 📝 To-Do List & Calendar Interativo

Uma aplicação de gerenciamento de tarefas moderna e funcional, que combina uma lista de afazeres clássica com uma visualização de calendário interativa. Desenvolvida para facilitar a organização pessoal com uma interface limpa, intuitiva e adaptável.

![Versão](https://img.shields.io/badge/Vers%C3%A3o-1.0.0-blue)
![JavaScript](https://img.shields.io/badge/JavaScript-Vanilla-yellow)
![Status](https://img.shields.io/badge/Status-Finalizado-brightgreen)

## 🚀 Funcionalidades

### 📋 Gestão de Tarefas
- **CRUD Completo:** Adicione, edite, exclua e marque tarefas como concluídas.
- **Priorização:** Classifique suas tarefas em Alta, Média ou Baixa prioridade com indicadores visuais coloridos.
- **Prazos e Alertas:** Defina datas de entrega e visualize automaticamente o status de "Atrasada" para tarefas fora do prazo.
- **Filtros Inteligentes:** Alterne entre visualizar Todas, Pendentes ou apenas as Concluídas.
- **Limpeza Rápida:** Botão para remover todas as tarefas concluídas de uma vez.

### 📅 Calendário Integrado
- **Visualização Mensal:** Navegue entre os meses e visualize a distribuição das suas tarefas.
- **Badges de Contagem:** Indicadores numéricos nos dias do calendário que possuem tarefas agendadas.
- **Modal de Detalhes:** Clique em um dia específico para abrir um modal com a lista detalhada de tarefas daquela data.

### 🌓 Experiência do Usuário (UX)
- **Dark Mode:** Alternância entre tema claro e escuro, com salvamento automático da preferência do usuário.
- **Persistência de Dados:** Integração com `localStorage`, garantindo que seus dados permaneçam salvos mesmo após fechar o navegador.
- **Design Responsivo:** Interface adaptável para diferentes tamanhos de tela.
- **Animações Suaves:** Transições suaves de entrada de tarefas e troca de abas.

## 🛠️ Tecnologias Utilizadas

- **Linguagens:** HTML5, CSS3 (Variáveis, Flexbox, Grid) e JavaScript (ES6+).
- **Ícones:** [Font Awesome](https://fontawesome.com/).
- **Tipografia:** [Google Fonts (Poppins)](https://fonts.google.com/).

## 📂 Estrutura do Projeto

```text
├── index.html   # Estrutura semântica e acessibilidade.
├── style.css    # Estilização, temas e animações.
└── script.js    # Lógica do calendário, manipulação do DOM e armazenamento.
