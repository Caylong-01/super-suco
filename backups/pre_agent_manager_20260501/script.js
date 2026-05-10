document.addEventListener('DOMContentLoaded', () => {
    
    const body = document.body;
    const modalOverlay = document.getElementById('modalOverlay');
    const unitModal = document.getElementById('unitModal');
    const openBtns = document.querySelectorAll('.open-modal-btn');
    const closeBtn = document.getElementById('closeModalBtn');

    // Funcionalidade de Abrir Modal
    openBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            body.classList.add('modal-active');
            // Impedir scroll quando modal está aberto
            body.style.overflow = 'hidden';
        });
    });

    // Funcionalidade de Fechar Modal
    const closeModal = () => {
        body.classList.remove('modal-active');
        body.style.overflow = '';
    };
    // Interações de interface (Modal, etc) já tratadas no início do arquivo.
    closeBtn.addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', closeModal);

    // Fechar com tecla ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && body.classList.contains('modal-active')) {
            closeModal();
        }
    });

    // Tracking de Cliques nas Unidades (opcional para Analytics futuro)
    const unitLinks = document.querySelectorAll('.unit-btn');
    unitLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const unitName = e.target.innerText.replace('📍 ', '');
            console.log(`Cliente escolheu a unidade: ${unitName}`);
            // Fecha o modal após a escolha (e o target="_blank" abre o WA)
            setTimeout(closeModal, 500);
        });
    });
});
