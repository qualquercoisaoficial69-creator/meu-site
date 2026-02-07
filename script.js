document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.getElementById('theme-toggle');
    const htmlElement = document.documentElement;

    // 1. Carregar o tema salvo ou usar o padrão 'dark'
    const savedTheme = localStorage.getItem('theme') || 'dark';
    htmlElement.setAttribute('data-theme', savedTheme);
    updateIcon(savedTheme);

    // 2. Evento de clique para trocar o tema
    themeToggle.addEventListener('click', () => {
        const currentTheme = htmlElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

        // Aplicar o tema no HTML
        htmlElement.setAttribute('data-theme', newTheme);
        
        // Salvar a preferência no navegador
        localStorage.setItem('theme', newTheme);
        
        // Atualizar o ícone (Sol/Lua)
        updateIcon(newTheme);
    });

    // Função para trocar o ícone do botão
    function updateIcon(theme) {
        const icon = themeToggle.querySelector('i');
        if (theme === 'light') {
            // Se for light, mostra o sol
            icon.className = 'fas fa-sun';
        } else {
            // Se for dark, mostra a lua
            icon.className = 'fas fa-moon';
        }
    }

    // --- MENU MOBILE (Opcional, caso queira que o logo abra o menu) ---
    const mobileTrigger = document.getElementById('mobile-menu-trigger');
    const topNav = document.getElementById('main-top-nav');

    if (mobileTrigger && topNav) {
        mobileTrigger.addEventListener('click', () => {
            topNav.classList.toggle('active');
        });
    }
});