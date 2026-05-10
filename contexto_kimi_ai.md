# Contexto de Atualização — Super Suco (Para KIMI AI)

Este documento descreve o estado atualizado do projeto "Super Suco" após uma rigorosa auditoria de Conversão (CRO), Performance e UX/UI. O projeto foi modificado para garantir retenção máxima e redução de fricção na conversão mobile.

Abaixo estão todos os sistemas, regras de negócio e melhorias de interface que foram implementados com sucesso e já estão ativos no código (`index.html`, `style.css` e `script.js`).

---

## 1. Otimizações de Conversão e Segurança (JavaScript)

### 1.1. Link Universal do WhatsApp (Meta Standard)
- O redirecionamento agora utiliza **exclusivamente** `window.location.href = waUrl`.
- O uso de `window.open` foi removido para evitar bloqueios de pop-up em navegadores mobile (Safari/Chrome iOS/Android).
- A mensagem inteira é tratada com `encodeURIComponent()` no final, para garantir a leitura perfeita de acentuações e símbolos financeiros.

### 1.2. Debounce Longo (Prevenção de Duplo Clique)
- Ao clicar em uma unidade ("Lagoa", "Mangabeira", etc.), o botão recebe `opacity: 0.6` e `pointer-events: none` imediatamente.
- O redirecionamento é disparado pelo `eventCallback` do GTM (ver item 1.4).

### 1.3. Persistência do Carrinho (LocalStorage com TTL)
- O estado do carrinho (`cartState`) foi migrado de `sessionStorage` para `localStorage` com um **Time-To-Live (TTL) de 24 horas**.
- **O que isso resolve:** Isso garante que se o usuário fechar a aba permanentemente ou o SO matar o processo do navegador, ele não perderá o pedido, desde que retorne dentro de 24h.

### 1.4. Rastreamento e Funil GTM (DataLayer)
- O `window.dataLayer` é inicializado precocemente no `<head>` do `index.html` para garantir que o array exista antes de qualquer script da página.
- O evento final de conversão (`contact`) agora utiliza um **callback de segurança com Guard Clause**. O redirecionamento para o WhatsApp ocorre via GTM callback, mas **somente se o GTM estiver instalado**. Se não estiver (`typeof window.google_tag_manager === 'undefined'`), ele aborta o evento e redireciona o usuário imediatamente para o WhatsApp, prevenindo congelamentos de tela (aguardando timeout de 2s) em ambientes sem GTM.
  ```javascript
  const hasGTM = typeof window.google_tag_manager !== 'undefined';
  if (!hasGTM) {
      window.location.href = waUrl;
  } else {
      window.dataLayer.push({
          event: 'contact',
          eventCallback: function() { window.location.href = waUrl; },
          eventTimeout: 2000
      });
  }
  ```

---

## 2. Refinamentos Visuais e UX (HTML & CSS)

### 2.1. Badge Dinâmico de Funcionamento
- O badge "Aberto/Fechado" agora é **dinâmico via JavaScript**.
- **Regra:** Aberto das 10h às 23h. Fora desse horário, o badge muda para "Fechado" com status vermelho e sem animação de pulso.

### 2.2. Redução de CLS e Ajuste de Imagem
- Adicionado `width` e `height` explícitos no HTML.
- **CSS:** Aplicado `object-fit: cover` em todas as imagens principais (`.menu-item img`, `.hero-3d-asset img`, `.about-image img`) para evitar distorções de proporção.

### 2.2. Resolução do Paradoxo da Escolha (CTAs)
- No menu de produtos, tínhamos dois CTAs concorrendo pela mesma atenção: "+ Adicionar" e "Pedir Agora".
- **Solução:** Implementamos a classe `.cta-solid` (Fundo Dourado e Texto Preto) para o botão "+ Adicionar" (fluxo principal sugerido), e a classe `.cta-outline` (Fundo transparente, borda clara) para o "Pedir Agora", definindo hierarquia visual clara.

### 2.3. Contextualização de Preços
- Nos cards de produto, substituímos "A partir de R$ XX,00" por "A partir de R$ XX,00 **(300ml)**", utilizando a tag `<small>`. Isso ancora o cliente no tamanho do copo e remove a ansiedade pré-compra sobre o que ele está comprando.

### 2.4. Gatilhos Mentais e Footer
- Adicionamos um Badge com Animação CSS (`.pulse-dot`) indicando **"Aberto"** no topo da tela (navbar). O ponto verde de pulso gera senso de urgência e oportunidade.
- O link do Instagram no Footer foi atualizado de um seletor genérico (`#`) para o endereço real, adicionando `target="_blank"` e a prática recomendada de segurança `rel="noopener"`.

---

**Nota para KIMI AI:** Considere este documento como a nova base do projeto. As lógicas de "Smart Checkout" que existiam anteriormente foram simplificadas em prol de maior segurança de redirecionamento, preservação da URL em dispositivos restritos (iPads/Tablets), persistência nativa (SessionStorage) e medição de dados em tempo real (DataLayer).
