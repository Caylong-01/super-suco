document.addEventListener('DOMContentLoaded', () => {
    // Inicializar dataLayer
    window.dataLayer = window.dataLayer || [];

    // =========================================
    // MODAL DE SELEÇÃO DE UNIDADE
    // =========================================
    const body = document.body;
    const modalOverlay = document.getElementById('modalOverlay');
    const unitModal = document.getElementById('unitModal');
    const openBtns = document.querySelectorAll('.open-modal-btn');
    const closeBtn = document.getElementById('closeModalBtn');

    // Estado do carrinho para usar na mensagem do WhatsApp
    let pendingCart = null;

    // Lógica de Loja Aberta
    // 07:30–17:30 de segunda a sexta
    // 07:30–12:30 no sábado
    // fechado aos domingos
    const updateStoreStatus = () => {
        const now = new Date();
        const day = now.getDay(); // 0 = Domingo, 1 = Segunda, ..., 6 = Sábado
        const hour = now.getHours();
        const min = now.getMinutes();
        const currentTime = hour + min / 60;
        
        let isOpen = false;

        if (day >= 1 && day <= 5) {
            // Segunda a Sexta: 07:30 às 17:30
            if (currentTime >= 7.5 && currentTime < 17.5) {
                isOpen = true;
            }
        } else if (day === 6) {
            // Sábado: 07:30 às 12:30
            if (currentTime >= 7.5 && currentTime < 12.5) {
                isOpen = true;
            }
        }
        // Domingo (day === 0) e outros horários continuam isOpen = false

        const badge = document.querySelector('.store-status');
        
        if (badge) {
            if (isOpen) {
                badge.classList.add('open');
                badge.innerHTML = '<span class="pulse-dot"></span> Aberto';
                badge.style.display = 'inline-flex';
            } else {
                badge.classList.remove('open');
                badge.innerHTML = '<span class="pulse-dot"></span> Fechado';
            }
        }
    };
    updateStoreStatus();

    const openUnitModal = () => {
        // Enviar evento de begin_checkout
        const total = pendingCart 
            ? pendingCart.reduce((sum, i) => sum + i.price * i.qty, 0)
            : Object.keys(cartState).reduce((sum, id) => sum + (cartState[id] * 20), 0); // Estimativa fallback

        window.dataLayer.push({
            event: 'begin_checkout',
            value: total,
            currency: 'BRL'
        });

        body.classList.add('modal-active');
        body.style.overflow = 'hidden';
    };

    const closeUnitModal = () => {
        body.classList.remove('modal-active');
        body.style.overflow = '';
        pendingCart = null;
    };

    openBtns.forEach(btn => {
        // Ignora botões de pedido direto, eles têm lógica própria
        if (btn.classList.contains('direct-order-btn')) return;

        btn.addEventListener('click', (e) => {
            e.preventDefault();
            pendingCart = null; // pedido direto, sem carrinho
            openUnitModal();
        });
    });

    // Fluxo Simplificado: Pedir Agora (Direto do cardápio)
    document.querySelectorAll('.direct-order-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const id = btn.dataset.id;
            const name = btn.dataset.name;
            const price = parseFloat(btn.dataset.price);

            // Define o pedido pendente como APENAS este item (qty: 1)
            pendingCart = [{
                id,
                name,
                price,
                qty: 1
            }];
            
            openUnitModal();
        });
    });

    closeBtn.addEventListener('click', closeUnitModal);

    modalOverlay.addEventListener('click', () => {
        closeUnitModal();
        closeCartModal();
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeUnitModal();
            closeCartModal();
        }
    });

    // Quando clica em uma unidade, monta a mensagem WhatsApp com o pedido
    const unitLinks = document.querySelectorAll('.unit-btn');
    unitLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Prevenção de duplo clique (Debounce longo)
            if (link.dataset.isSubmitting === 'true') return;
            link.dataset.isSubmitting = 'true';
            link.style.opacity = '0.6';
            link.style.pointerEvents = 'none';
            
            const unitName = link.dataset.unit || link.innerText.trim();
            const baseHref = link.getAttribute('href');

            // Evento DataLayer: choose_unit
            window.dataLayer.push({
                event: 'choose_unit',
                unit_id: unitName
            });

            let msg = '';
            let totalVal = 0;

            if (pendingCart && pendingCart.length > 0) {
                // Mensagem com itens do carrinho
                const linhas = pendingCart.map(item =>
                    `• ${item.qty}x ${item.name} — R$ ${(item.price * item.qty).toFixed(2).replace('.', ',')}`
                ).join('\n');
                totalVal = pendingCart.reduce((sum, i) => sum + i.price * i.qty, 0);
                msg = `Olá! Quero fazer um pedido na unidade *${unitName}*:\n\n${linhas}\n\n*Total: R$ ${totalVal.toFixed(2).replace('.', ',')}*\n\nObrigado! 🥤`;
            } else {
                // Mensagem genérica (clicou em "Pedir Agora" sem carrinho)
                msg = `Olá! Quero fazer um pedido na unidade *${unitName}*. Pode me ajudar? 🥤`;
            }

            // Padrão oficial wa.me para todos os dispositivos
            const waUrl = `${baseHref}?text=${encodeURIComponent(msg)}`;

            // Evento DataLayer: contact com Callback para redirecionamento seguro
            const hasGTM = typeof window.google_tag_manager !== 'undefined';
            if (!hasGTM) {
                window.location.href = waUrl;
            } else {
                window.dataLayer.push({
                    event: 'contact',
                    value: totalVal,
                    currency: 'BRL',
                    unit_id: unitName,
                    eventCallback: function() {
                        // Redirecionamento via location.href (evita bloqueio de popup)
                        window.location.href = waUrl;
                    },
                    eventTimeout: 2000
                });
            }
        });
    });


    // =========================================
    // CARRINHO DE VISUALIZAÇÃO
    // =========================================
    const openCartBtn = document.getElementById('openCartBtn');
    const closeCartBtn = document.getElementById('closeCartBtn');
    const cartModal = document.getElementById('cartModal');
    const cartBadge = document.getElementById('cartBadge');
    const cartTotal = document.getElementById('cartTotal');
    const cartCheckoutBtn = document.getElementById('cartCheckoutBtn');
    const cartEmptyMsg = document.getElementById('cartEmptyMsg');

    // Estado do carrinho: { id: qty }
    let cartState = {};
    
    // Tenta carregar o carrinho do localStorage com validade de 24h
    try {
        const CART_TTL = 24 * 60 * 60 * 1000;
        const saved = localStorage.getItem('superSucoCart');
        if (saved) {
            const parsed = JSON.parse(saved);
            if (Date.now() - parsed.timestamp < CART_TTL) {
                cartState = parsed.data;
            } else {
                localStorage.removeItem('superSucoCart');
            }
        }
    } catch(e) {
        console.error('Erro ao ler localStorage:', e);
    }

    const openCartModal = () => {
        body.classList.add('cart-modal-active');
        body.style.overflow = 'hidden';
    };

    const closeCartModal = () => {
        body.classList.remove('cart-modal-active');
        body.style.overflow = '';
    };

    if (openCartBtn) openCartBtn.addEventListener('click', openCartModal);
    if (closeCartBtn) closeCartBtn.addEventListener('click', closeCartModal);

    // Calcular e atualizar o total exibido
    const updateCartUI = () => {
        let total = 0;
        let totalQty = 0;

        const items = document.querySelectorAll('.cart-item');
        items.forEach(item => {
            const id = item.dataset.id;
            const price = parseFloat(item.dataset.price);
            const qty = cartState[id] || 0;

            // Atualiza o número exibido no controle de qty do modal
            const qtyEl = item.querySelector('.qty-value');
            if (qtyEl) qtyEl.textContent = qty;

            // Destaque visual no item
            if (qty > 0) {
                item.style.borderColor = 'rgba(202,138,4,0.4)';
                item.style.background = 'rgba(202,138,4,0.07)';
            } else {
                item.style.borderColor = '';
                item.style.background = '';
            }

            total += price * qty;
            totalQty += qty;
        });

        // Total
        if (cartTotal) {
            cartTotal.textContent = `R$ ${total.toFixed(2).replace('.', ',')}`;
        }

        // Badge do ícone na navbar
        if (cartBadge) {
            cartBadge.textContent = totalQty;
            cartBadge.classList.toggle('hidden', totalQty === 0);
        }

        // Botão de checkout
        if (cartCheckoutBtn) {
            cartCheckoutBtn.disabled = totalQty === 0;
        }

        // Mensagem vazia
        if (cartEmptyMsg) {
            cartEmptyMsg.classList.toggle('visible', totalQty === 0);
        }

        // Salvar na localStorage
        localStorage.setItem('superSucoCart', JSON.stringify({
            data: cartState,
            timestamp: Date.now()
        }));
    };

    // Controles de quantidade no modal do carrinho
    document.querySelectorAll('.cart-item').forEach(item => {
        const id = item.dataset.id;
        if (cartState[id] === undefined) {
            cartState[id] = 0;
        }

        const minusBtn = item.querySelector('.qty-minus');
        const plusBtn = item.querySelector('.qty-plus');
        const zeroBtn = item.querySelector('.qty-zero');

        plusBtn?.addEventListener('click', () => {
            cartState[id] = (cartState[id] || 0) + 1;
            updateCartUI();
        });

        minusBtn?.addEventListener('click', () => {
            cartState[id] = Math.max(0, (cartState[id] || 0) - 1);
            updateCartUI();
        });

        zeroBtn?.addEventListener('click', () => {
            cartState[id] = 0;
            updateCartUI();
        });
    });

    // Limpar Carrinho Completo
    const clearCartBtn = document.getElementById('clearCartBtn');
    if (clearCartBtn) {
        clearCartBtn.addEventListener('click', () => {
            Object.keys(cartState).forEach(id => cartState[id] = 0);
            updateCartUI();
        });
    }

    // Botões "+ Adicionar" dentro dos cards do cardápio
    document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.dataset.id;
            const price = parseFloat(btn.dataset.price || 0);
            const name = btn.dataset.name || 'Produto';

            if (id) {
                cartState[id] = (cartState[id] || 0) + 1;
                updateCartUI();

                window.dataLayer.push({
                    event: 'add_to_cart',
                    items: [{
                        item_id: id,
                        item_name: name,
                        price: price,
                        quantity: 1
                    }],
                    value: price,
                    currency: 'BRL'
                });

                // Feedback visual: anima o botão
                btn.textContent = '✓ Adicionado!';
                btn.style.background = 'rgba(202,138,4,0.25)';
                setTimeout(() => {
                    btn.textContent = '+ Adicionar';
                    btn.style.background = '';
                }, 1200);
            }
        });
    });

    // Ao clicar em "Pedir pelo WhatsApp" no carrinho:
    // monta o pedido e abre o modal de seleção de unidade
    if (cartCheckoutBtn) {
        cartCheckoutBtn.addEventListener('click', () => {
            // Compila os itens do carrinho
            const items = document.querySelectorAll('.cart-item');
            pendingCart = [];
            items.forEach(item => {
                const id = item.dataset.id;
                const qty = cartState[id] || 0;
                if (qty > 0) {
                    pendingCart.push({
                        id,
                        name: item.dataset.name,
                        price: parseFloat(item.dataset.price),
                        qty
                    });
                }
            });

            closeCartModal();
            setTimeout(() => {
                openUnitModal();
            }, 200);
        });
    }

    // Inicializa UI do carrinho
    updateCartUI();


    // =========================================
    // DESIGN SPELLS: Scroll Reveal Stagger
    // =========================================
    const revealElements = document.querySelectorAll(
        '.menu-item, .location-card, .about-content, .section-header'
    );

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry, i) => {
            if (entry.isIntersecting) {
                const delay = (entry.target.dataset.delay || 0);
                setTimeout(() => {
                    entry.target.classList.add('reveal');
                    entry.target.style.animationDelay = `${i * 80}ms`;
                }, delay);
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    revealElements.forEach(el => revealObserver.observe(el));


    // =========================================
    // Contador Animado (page-cro)
    // =========================================
    const counterEl = document.getElementById('order-counter');
    if (counterEl) {
        const target = 5000;
        const duration = 1800;
        const step = 16;
        const increment = Math.ceil(target / (duration / step));
        let current = 0;

        const counterObserver = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                const timer = setInterval(() => {
                    current = Math.min(current + increment, target);
                    counterEl.textContent = current.toLocaleString('pt-BR');
                    if (current >= target) clearInterval(timer);
                }, step);
                counterObserver.unobserve(counterEl);
            }
        }, { threshold: 0.5 });

        counterObserver.observe(counterEl);
    }


    // =========================================
    // DESIGN SPELLS: Efeito Magnético no CTA
    // =========================================
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!prefersReducedMotion) {
        const magneticBtns = document.querySelectorAll('.cta-primary, .cta-nav-primary');
        magneticBtns.forEach(btn => {
            btn.addEventListener('mousemove', (e) => {
                const rect = btn.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;
                btn.style.transform = `translate(${x * 0.12}px, ${y * 0.12}px) translateY(-2px)`;
            });

            btn.addEventListener('mouseleave', () => {
                btn.style.transform = '';
                btn.style.transition = 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)';
                setTimeout(() => { btn.style.transition = ''; }, 500);
            });
        });
    }

});
