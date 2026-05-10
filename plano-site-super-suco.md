# Plano de Implementação — Site Super Suco

Este plano foi desenhado cruzando as informações auxiliares da marca (identidade ousada, energia, apelo popular) com as **melhores práticas de desenvolvimento front-end premium**.

O objetivo é entregar um site de altíssima conversão que justifique o valor estratégico do projeto, utilizando uma arquitetura leve, sem depender de frameworks complexos que encareceriam a manutenção.

---

## 1. Stack Tecnológico & Arquitetura

Conforme os padrões de desenvolvimento ágil e as restrições de um projeto de conversão rápida (Hit and Run):

*   **Core:** HTML5 Semântico e JavaScript Vanilla (para a lógica do modal de unidades).
*   **Estilização:** CSS Vanilla puro com variáveis globais (Design Tokens) para máximo controle e performance. **Não usaremos TailwindCSS ou Astro**, mantendo o projeto 100% livre de dependências de build, facilitando a hospedagem gratuita e edição futura.
*   **Hospedagem:** Preparado para deploy estático na Cloudflare Pages, Vercel ou Hostinger.

---

## 2. Direção de Arte e Estética (A "Vibe")

Apesar do tom popular ("de bairro"), o design visual precisa impressionar o cliente logo no primeiro segundo.

*   **Paleta de Cores (Ajustada para Premium):**
    *   **Fundo Principal:** Azul Marinho Profundo (`#0B1E5B`) para criar contraste rico.
    *   **Acentos:** Dourado ou Roxo-Açaí vibrante para os botões de Call-to-Action (CTA), garantindo que saltem aos olhos.
    *   **Texto:** Branco (`#FFFFFF`) e Cinza Claro (`#E5E7EB`).
*   **Tipografia:**
    *   *Títulos/Logo:* Fonte script dinâmica (ex: *Pacifico* ou *Caveat*) para manter a organicidade.
    *   *Corpo do Texto:* Fonte moderna sem serifa (ex: *Outfit* ou *Inter*) para garantir legibilidade impecável no celular.
*   **Micro-interações:** Efeitos de hover nos botões, surgimento suave de elementos ao rolar a página (Scroll Reveal) para dar uma sensação de "app" de alto custo.

---

## 3. Estrutura da Página (One-Page Flow)

A navegação será focada em um único objetivo: fazer o cliente escolher a unidade e clicar no WhatsApp.

1.  **Hero Section (O Impacto Inicial)**
    *   Fundo escuro premium (Azul Marinho).
    *   Slogan "Melhor suco de açaí do Brasil".
    *   Tagline "Energético & Afrodisíaco" em destaque sofisticado.
    *   **CTA Principal:** "Pedir Agora" (Abre o modal de seleção de loja).
2.  **Seção "A Experiência" (Sobre)**
    *   Breve storytelling sobre a energia da marca.
    *   Fotos reais do produto/fachada (se disponíveis, ou placeholders de alta qualidade gerados por IA).
3.  **Cardápio Rápido (Destaques)**
    *   Exibição dos 3 a 4 produtos principais com preços âncora.
4.  **Seção de Unidades (A Conversão)**
    *   Grid com as 4 unidades (Lagoa, Mangabeira, Manaíra, Campina Grande).
    *   Botão de WhatsApp direto em cada card.
5.  **Rodapé**
    *   Links para o Instagram (`@supersucooficial`), horários gerais e copyright.

---

## 4. Funcionalidades Chave (JavaScript)

*   **Modal de Roteamento Inteligente:** Ao clicar no CTA genérico do topo, um modal elegante escurece o fundo e pede: *"De qual unidade você quer pedir?"*. Isso resolve o problema dos 4 números de WhatsApp diferentes de forma luxuosa.
*   **Menu Fixo (Sticky Header):** O botão de pedir acompanha o usuário durante todo o scroll.

---

## 5. Cronograma de Execução (Próximos Passos)

1.  **Fase 1: Fundação.** Criação do `index.html` e `style.css` com todos os tokens de cor e tipografia.
2.  **Fase 2: Layout & Componentes.** Construção das seções Hero, Sobre e Unidades.
3.  **Fase 3: Lógica & Conversão.** Programação do modal de WhatsApp em JS Vanilla.
4.  **Fase 4: Polimento Visual.** Adição das micro-animações, sombras suaves (Glassmorphism) e revisão mobile-first.
