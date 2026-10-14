// ==========================================
// COMPORTAMENTO APÓS CARREGAR A PÁGINA
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    // --- INTRO DE PRIMEIRA VISITA ---
    setupFirstVisitIntro();

    // --- GERENCIAMENTO DE TEMA (CLARO/ESCURO) ---
    const themeToggle = document.getElementById('themeToggle') || document.getElementById('theme-toggle');
    const htmlElement = document.documentElement;
    const icon = themeToggle ? themeToggle.querySelector('i') : null;

    const savedTheme = localStorage.getItem('theme') || 'dark';
    htmlElement.setAttribute('data-theme', savedTheme);
    updateIcon(savedTheme);

    if (themeToggle) {
        themeToggle.addEventListener('click', (e) => {
            e.preventDefault();
            const currentTheme = htmlElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

            htmlElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            updateIcon(newTheme);
        });
    }

    function updateIcon(theme) {
        if (icon) {
            icon.className = theme === 'light' ? 'fas fa-sun' : 'fas fa-moon';
        }

        if (themeToggle) {
            const label = theme === 'light' ? 'Ativar tema escuro' : 'Ativar tema claro';
            themeToggle.setAttribute('aria-label', label);
            themeToggle.setAttribute('title', label);
            themeToggle.setAttribute('aria-pressed', String(theme === 'light'));
        }
    }

    // --- ACESSIBILIDADE E LINKS ---
    document.querySelectorAll('i[class^="fa"], i[class*=" fa-"]').forEach(iconElement => {
        iconElement.setAttribute('aria-hidden', 'true');
    });

    document.querySelectorAll('a[target="_blank"]').forEach(link => {
        link.setAttribute('rel', 'noopener noreferrer');
    });

    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.top-nav a[href]').forEach(link => {
        const linkPage = link.getAttribute('href').split('/').pop();

        if (linkPage === currentPage) {
            link.classList.add('active');
            link.setAttribute('aria-current', 'page');
        }
    });

    // --- MENU MOBILE E SIDEBAR ---
    const mobileTrigger = document.getElementById('mobile-menu-trigger');
    const topNav = document.getElementById('sidebar');

    if (mobileTrigger && topNav) {
        mobileTrigger.addEventListener('click', () => {
            topNav.classList.toggle('active');
        });
    }

    window.toggleSubmenu = function(button) {
        const submenu = button.nextElementSibling;
        const isAlreadyOpen = submenu.classList.contains("show");

        closeAllSubmenus();

        if (!isAlreadyOpen) {
            if (submenu && submenu.classList.contains("submenu")) {
                submenu.classList.add("show");
            }
            button.classList.add("rotate");
        }
    };

    window.closeAllSubmenus = function() {
        const openMenus = document.querySelectorAll(".submenu.show");
        openMenus.forEach(menu => {
            menu.classList.remove("show");
            const btn = menu.previousElementSibling;
            if (btn) btn.classList.remove("rotate");
        });
    };

    window.toggleSidebar = function() {
        const headerElement = document.getElementById("headerMenu");
        if (headerElement) {
            headerElement.classList.toggle("close");
        }
    };

    function setupFirstVisitIntro() {
        const intro = document.getElementById('siteIntro');
        if (!intro) return;

        let pageLoaded = document.readyState === 'complete';
        let minTimeElapsed = false;
        let finished = false;

        function finishIntro() {
            if (finished) return;
            finished = true;

            intro.classList.add('intro-exit');

            setTimeout(() => {
                intro.setAttribute('hidden', '');
                intro.style.display = 'none';
            }, 550);
        }

        function checkAndFinish() {
            if (pageLoaded && minTimeElapsed) {
                finishIntro();
            }
        }

        if (!pageLoaded) {
            window.addEventListener('load', () => {
                pageLoaded = true;
                checkAndFinish();
            }, { once: true });
        }

        // Aguarda 1.4s exibindo a logo e o spinner antes de transicionar
        setTimeout(() => {
            minTimeElapsed = true;
            checkAndFinish();
        }, 1400);
    }
});

// ==========================================
// COMPORTAMENTO DO CABEÇALHO AO ROLAR
// ==========================================
const header = document.querySelector(".main-header");
let lastScroll = 0;

if (header) {
    window.addEventListener("scroll", () => {
        if (window.innerWidth <= 768) {
            header.classList.remove("scroll-down", "scroll-up");
            return;
        }

        const currentScroll = window.pageYOffset || document.documentElement.scrollTop;

        if (currentScroll <= 0) {
            header.classList.remove("scroll-down", "scroll-up");
            return;
        }

        if (currentScroll > lastScroll && !header.classList.contains("scroll-down")) {
            header.classList.remove("scroll-up");
            header.classList.add("scroll-down");
        } else if (currentScroll < lastScroll && header.classList.contains("scroll-down")) {
            header.classList.remove("scroll-down");
            header.classList.add("scroll-up");
        }

        lastScroll = currentScroll;
    });
}

// ==========================================
// GAMESTORE: DADOS, CARROSSEL 3D, BUSCA E MODAL
// ==========================================
const GAMES_DATA = {
    'unique-soul': {
        id: 'unique-soul',
        title: 'Unique Soul',
        genre: 'RPG / Investigação',
        version: 'Alpha 0.1',
        status: 'Em Desenvolvimento',
        platforms: 'PC (Steam & Epic Games)',
        cover: 'imagens/unique_soul_capa.png',
        banner: 'imagens/unique_soul_cenario.png',
        tagline: 'Toda alma tem uma história. Qual será a sua?',
        description: 'Unique Soul é um mergulho em um universo 2D onde você precisa enfrentar julgamentos e preconceitos. Seus fragmentos de memória são a única bússola, além da curiosidade. Em um mundo onde todos possuem suas próprias cores, você assume o papel de um fragmento que busca entender sua origem.',
        mechanics: [
            { icon: 'fa-ghost', title: 'Troca de Almas', desc: 'Alterne entre diferentes essências e habilidades espectrais para superar obstáculos.' },
            { icon: 'fa-puzzle-piece', title: 'Puzzles Ambientais', desc: 'Desvende enigmas antigos integrados à arquitetura e iluminação da catedral.' },
            { icon: 'fa-eye', title: 'Visão de Memória', desc: 'Revele ecos do passado deixados nos cenários para desbloquear lembranças perdidas.' },
            { icon: 'fa-fist-raised', title: 'Combates Táticos', desc: 'Enfrente guardiões e sombras em batalhas fluidas baseadas em afinidade de cores.' }
        ],
        gallery: [
            { src: 'imagens/unique_soul_capa.png', caption: 'Capa Oficial' },
            { src: 'imagens/unique_soul_personagem.png', caption: 'Design do Protagonista' },
            { src: 'imagens/unique_soul_cenario.png', caption: 'A Catedral dos Vitrais' }
        ]
    },
    'catedral-almas': {
        id: 'catedral-almas',
        title: 'A Catedral das Cores',
        genre: 'Atmosfera & Cenários',
        version: 'Conceito Artístico',
        status: 'Em Produção',
        platforms: 'Cenários do Jogo',
        cover: 'imagens/unique_soul_cenario.png',
        banner: 'imagens/unique_soul_cenario.png',
        tagline: 'O santuário onde as cores e memórias perdidas convergem.',
        description: 'A Catedral dos Vitrais é o principal marco visual de Unique Soul. Cada vitral gótico emana um feixe de luz que reflete o estado das almas no universo, criando atmosferas contrastantes e segredos arquitetônicos exploráveis.',
        mechanics: [
            { icon: 'fa-archway', title: 'Arquitetura Gótica', desc: 'Cenários feitos à mão com estética imersiva e cores místicas.' },
            { icon: 'fa-sun', title: 'Luzes Dinâmicas', desc: 'Os reflexos dos vitrais afetam visibilidade e revelam caminhos ocultos.' }
        ],
        gallery: [
            { src: 'imagens/unique_soul_cenario.png', caption: 'Vitrais Principais' },
            { src: 'imagens/unique_soul_capa.png', caption: 'Capa Completa' }
        ]
    },
    'qualquer-coisa-quest': {
        id: 'qualquer-coisa-quest',
        title: 'Qualquer Coisa Quest',
        genre: 'Ação / Roguelite 2D',
        version: 'Protótipo',
        status: 'Projeto Paralelo',
        platforms: 'Web / PC',
        cover: 'imagens/Qualquer_coisa_corpo_inteiro.png',
        banner: 'imagens/Qualquer_coisa_corpo_inteiro.png',
        tagline: 'O mascote oficial do estúdio em uma missão caótica e divertida!',
        description: 'Um projeto spin-off estrelando o mascote da Qualquer Coisa Rápido! Combates rápidos, esquivas acrobáticas e muito humor com habilidades especiais inspiradas nos fundadores da equipe.',
        mechanics: [
            { icon: 'fa-bolt', title: 'Ritmo Acelerado', desc: 'Desvie de ataques e elimine inimigos com reflexos rápidos.' },
            { icon: 'fa-magic', title: 'Habilidades Especiais', desc: 'Disparos de energia e ataques de adaga com efeitos coloridos.' }
        ],
        gallery: [
            { src: 'imagens/Qualquer_coisa_corpo_inteiro.png', caption: 'Mascote Qualquer Coisa' },
            { src: 'imagens/Qualquer_coisa_tiro.png', caption: 'Ataque de Tiro' },
            { src: 'imagens/Qualquer_coisa_faquinha.png', caption: 'Mascote com Adaga' }
        ]
    },
    'soundtrack': {
        id: 'soundtrack',
        title: 'Unique Soul: Soundtrack',
        genre: 'Sound Design & Músicas',
        version: 'Volume 1',
        status: 'Composição Ativa',
        platforms: 'Spotify / YouTube',
        cover: 'imagens/preview.png',
        banner: 'imagens/unique_soul_cenario.png',
        tagline: 'Melodias etéreas e sintetizadores atmosféricos autorais.',
        description: 'A trilha sonora oficial de Unique Soul combina sintetizadores suaves, piano introspectivo e batidas marcantes de combate para acompanhar cada estágio emocional da narrativa.',
        mechanics: [
            { icon: 'fa-music', title: 'Trilhas Dinâmicas', desc: 'A música se transforma em tempo real com as ações do jogador.' },
            { icon: 'fa-headphones', title: 'Imersão Binaural', desc: 'Sons tridimensionais que enriquecem o suspense e a exploração.' }
        ],
        gallery: [
            { src: 'imagens/preview.png', caption: 'Arte Conceitual da Trilha' },
            { src: 'imagens/unique_soul_cenario.png', caption: 'Inspiração Sonora' }
        ]
    }
};

// --- CARROSSEL 3D FANNED ---
let carouselCurrentIndex = 0;
const carouselCards = [
    { id: 'unique-soul', title: 'Unique Soul', cat: 'RPG / INVESTIGAÇÃO', badge: 'DESTAQUE PRINCIPAL', bg: 'imagens/unique_soul_cenario.png', desc: 'Em um mundo onde todos possuem suas próprias cores, seus fragmentos de memória são a única bússola para desvendar sua origem.' },
    { id: 'catedral-almas', title: 'A Catedral das Cores', cat: 'ATMOSFERA & LORE', badge: 'ARTE CONCEITUAL', bg: 'imagens/unique_soul_cenario.png', desc: 'O santuário gótico onde as almas fragmentadas convergem e os vitrais revelam os mistérios do reino.' },
    { id: 'qualquer-coisa-quest', title: 'Qualquer Coisa Quest', cat: 'AÇÃO / ROGUELITE', badge: 'PROTÓTIPO INDIE', bg: 'imagens/Qualquer_coisa_corpo_inteiro.png', desc: 'O mascote oficial da Qualquer Coisa Rápido em uma aventura caótica e eletrizante cheia de habilidades únicas.' }
];

function initFannedCarousel() {
    const fannedCards = document.querySelectorAll('.fanned-card');
    const dots = document.querySelectorAll('.carousel-dot');
    if (!fannedCards.length) return;

    function updateCarousel() {
        const total = fannedCards.length;
        fannedCards.forEach((card, idx) => {
            card.classList.remove('card-active', 'card-prev', 'card-next', 'card-hidden');

            const diff = (idx - carouselCurrentIndex + total) % total;

            if (diff === 0) {
                card.classList.add('card-active');
            } else if (diff === 1 || (diff === -(total - 1))) {
                card.classList.add('card-next');
            } else if (diff === total - 1 || diff === -1) {
                card.classList.add('card-prev');
            } else {
                card.classList.add('card-hidden');
            }
        });

        dots.forEach((dot, idx) => {
            dot.classList.toggle('active', idx === carouselCurrentIndex);
        });
    }

    window.nextCarouselCard = function() {
        carouselCurrentIndex = (carouselCurrentIndex + 1) % fannedCards.length;
        updateCarousel();
    };

    window.prevCarouselCard = function() {
        carouselCurrentIndex = (carouselCurrentIndex - 1 + fannedCards.length) % fannedCards.length;
        updateCarousel();
    };

    window.goToCarouselCard = function(index) {
        carouselCurrentIndex = index;
        updateCarousel();
    };

    fannedCards.forEach((card, idx) => {
        card.addEventListener('click', () => {
            if (idx !== carouselCurrentIndex) {
                goToCarouselCard(idx);
            }
        });
    });

    // Suporte a gestos de deslize por toque (Swipe Mobile)
    const carouselElem = document.querySelector('.fanned-carousel-container') || document.querySelector('.fanned-carousel');
    if (carouselElem) {
        let touchStartX = 0;
        let touchStartY = 0;
        let touchEndX = 0;
        let touchEndY = 0;

        carouselElem.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
            touchStartY = e.changedTouches[0].screenY;
        }, { passive: true });

        carouselElem.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            touchEndY = e.changedTouches[0].screenY;
            const diffX = touchEndX - touchStartX;
            const diffY = touchEndY - touchStartY;

            // Se o movimento horizontal for maior que o vertical e maior que 40px
            if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 40) {
                if (diffX < 0) {
                    window.nextCarouselCard();
                } else {
                    window.prevCarouselCard();
                }
            }
        }, { passive: true });
    }

    updateCarousel();
}

// --- MODAL DE DETALHES DO JOGO ---
window.openGameModal = function(gameId) {
    const data = GAMES_DATA[gameId] || GAMES_DATA['unique-soul'];
    const modal = document.getElementById('gameModal');
    if (!modal) {
        // Redireciona para jogo.html com parâmetro se estiver em outra página
        window.location.href = `jogo.html?game=${gameId}`;
        return;
    }

    // Preenche dados do modal
    const banner = modal.querySelector('#modalBannerImg');
    const cover = modal.querySelector('#modalCoverImg');
    const title = modal.querySelector('#modalTitle');
    const genre = modal.querySelector('#modalGenre');
    const status = modal.querySelector('#modalStatus');
    const platforms = modal.querySelector('#modalPlatforms');
    const tagline = modal.querySelector('#modalTagline');
    const desc = modal.querySelector('#modalDesc');
    const mechanicsGrid = modal.querySelector('#modalMechanicsGrid');
    const galleryGrid = modal.querySelector('#modalGalleryGrid');
    const actionBtn = modal.querySelector('#modalActionBtn');

    if (banner) banner.src = data.banner;
    if (cover) cover.src = data.cover;
    if (title) title.textContent = data.title;
    if (genre) genre.textContent = data.genre;
    if (status) status.textContent = data.status;
    if (platforms) platforms.textContent = data.platforms;
    if (tagline) tagline.textContent = data.tagline;
    if (desc) desc.textContent = data.description;

    if (actionBtn) {
        actionBtn.href = `jogo.html?game=${data.id}`;
    }

    if (mechanicsGrid) {
        mechanicsGrid.innerHTML = data.mechanics.map(m => `
            <div class="modal-mechanic-card">
                <i class="fas ${m.icon}" aria-hidden="true"></i>
                <h4>${m.title}</h4>
                <p style="font-size: 0.8rem; opacity: 0.8;">${m.desc}</p>
            </div>
        `).join('');
    }

    if (galleryGrid) {
        galleryGrid.innerHTML = data.gallery.map(g => `
            <div class="modal-gallery-item">
                <img src="${g.src}" alt="${g.caption}" loading="lazy">
            </div>
        `).join('');
    }

    // Reseta abas para a primeira
    switchModalTab('tabOverview');

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
};

window.closeGameModal = function() {
    const modal = document.getElementById('gameModal');
    if (!modal) return;
    modal.classList.remove('active');
    document.body.style.overflow = '';
};

window.switchModalTab = function(tabId) {
    document.querySelectorAll('.modal-tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-tab') === tabId);
    });
    document.querySelectorAll('.modal-tab-content').forEach(content => {
        content.classList.toggle('active', content.id === tabId);
    });
};

// --- FILTRO E BUSCA DO CATÁLOGO ---
function initCatalogFilters() {
    const searchInput = document.getElementById('catalogSearch');
    const tabs = document.querySelectorAll('.catalog-tab');
    const cards = document.querySelectorAll('.catalog-game-card');

    let currentCategory = 'all';
    let searchQuery = '';

    function filterCards() {
        cards.forEach(card => {
            const cardCat = card.getAttribute('data-category') || '';
            const cardTitle = (card.querySelector('.card-game-title')?.textContent || '').toLowerCase();
            const cardDesc = (card.querySelector('.card-game-desc')?.textContent || '').toLowerCase();

            const matchesCategory = currentCategory === 'all' || cardCat.includes(currentCategory);
            const matchesSearch = !searchQuery || cardTitle.includes(searchQuery) || cardDesc.includes(searchQuery);

            if (matchesCategory && matchesSearch) {
                card.style.display = 'flex';
            } else {
                card.style.display = 'none';
            }
        });
    }

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            searchQuery = e.target.value.toLowerCase().trim();
            filterCards();
        });
    }

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            currentCategory = tab.getAttribute('data-filter') || 'all';
            filterCards();
        });
    });
}

// --- SISTEMA DE FAVORITOS / WISHLIST ---
let wishlist = JSON.parse(localStorage.getItem('qc_wishlist') || '[]');

function updateWishlistBadge() {
    const badge = document.getElementById('wishlistCount');
    if (badge) {
        badge.textContent = wishlist.length;
        badge.style.display = wishlist.length > 0 ? 'inline-block' : 'none';
    }
}

window.toggleWishlist = function(gameId, buttonElement) {
    const index = wishlist.indexOf(gameId);
    if (index > -1) {
        wishlist.splice(index, 1);
        if (buttonElement) buttonElement.classList.remove('favorited');
    } else {
        wishlist.push(gameId);
        if (buttonElement) buttonElement.classList.add('favorited');
    }
    localStorage.setItem('qc_wishlist', JSON.stringify(wishlist));
    updateWishlistBadge();
};

// --- TOGGLE SIDEBAR MOBILE (COM BACKDROP E BLOQUEIO DE SCROLL) ---
window.toggleMobileSidebar = function(forceState) {
    const sidebar = document.querySelector('.gamestore-sidebar');
    if (!sidebar) return;

    // Desativa modo bolinha imediatamente no mobile
    sidebar.classList.remove('sidebar-orb-mode');

    let backdrop = document.querySelector('.sidebar-mobile-backdrop');
    if (!backdrop) {
        backdrop = document.createElement('div');
        backdrop.className = 'sidebar-mobile-backdrop';
        backdrop.setAttribute('aria-hidden', 'true');
        backdrop.addEventListener('click', () => window.toggleMobileSidebar(false));
        // Insere o backdrop antes da sidebar para compartilharem exatamente o mesmo stacking context
        if (sidebar.parentElement) {
            sidebar.parentElement.insertBefore(backdrop, sidebar);
        } else {
            document.body.appendChild(backdrop);
        }
    }

    const isCurrentlyOpen = sidebar.classList.contains('mobile-open');
    const shouldOpen = typeof forceState === 'boolean' ? forceState : !isCurrentlyOpen;

    if (shouldOpen) {
        sidebar.classList.add('mobile-open');
        backdrop.classList.add('active');
        document.body.classList.add('mobile-drawer-open');
    } else {
        sidebar.classList.remove('mobile-open');
        backdrop.classList.remove('active');
        document.body.classList.remove('mobile-drawer-open');
    }
};

// Fecha gaveta ou modal com tecla ESC
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        window.toggleMobileSidebar(false);
        window.closeGameModal();
    }
});

// --- TROCA DE VISUALIZAÇÃO INTERNA (INÍCIO / CATÁLOGO / SOBRE NÓS) ---
window.switchGameStoreView = function(viewName, event) {
    const views = document.querySelectorAll('.gamestore-view');
    const targetView = document.getElementById(`view-${viewName}`);

    if (targetView && views.length > 0) {
        if (event) event.preventDefault();

        views.forEach(v => {
            v.style.display = 'none';
            v.classList.remove('active-view');
        });

        targetView.style.display = 'flex';
        targetView.classList.add('active-view');

        document.querySelectorAll('.sidebar-link[data-view]').forEach(l => {
            l.classList.toggle('active', l.getAttribute('data-view') === viewName);
        });

        // Fecha sidebar no mobile se estiver aberta
        const sidebar = document.querySelector('.gamestore-sidebar');
        if (sidebar && sidebar.classList.contains('mobile-open')) {
            sidebar.classList.remove('mobile-open');
        }

        window.scrollTo({ top: 0, behavior: 'smooth' });
        return false;
    }
    return true;
};

// --- TRANSIÇÃO MÓRFICA DA SIDEBAR (CARD <-> BOLINHA BRILHANTE AZUL) ---
function initMorphingSidebar() {
    const sidebar = document.querySelector('.gamestore-sidebar');
    if (!sidebar) return;

    // Remove qualquer orb antigo do cursor caso exista
    const oldOrb = document.getElementById('cursorOrb');
    if (oldOrb) oldOrb.remove();

    let scrollTimeout = null;
    let isHovered = false;

    sidebar.addEventListener('mouseenter', () => { isHovered = true; });
    sidebar.addEventListener('mouseleave', () => { isHovered = false; });

    window.addEventListener('scroll', () => {
        // Ignora em tablets e smartphones (<= 860px), onde funciona como gaveta off-canvas
        if (window.innerWidth <= 860) {
            sidebar.classList.remove('sidebar-orb-mode');
            return;
        }

        const currentScrollY = window.scrollY;

        // Se rolou mais de 50px a partir do topo:
        if (currentScrollY > 50) {
            // Se o usuário não estiver com o mouse em cima:
            if (!isHovered && !sidebar.classList.contains('sidebar-orb-mode')) {
                // O card vira suavemente a bolinha brilhante no canto
                sidebar.classList.add('sidebar-orb-mode');
            }

            // Cancela expansão enquanto a rolagem continua
            clearTimeout(scrollTimeout);

            // Quando parar de rolar a página:
            scrollTimeout = setTimeout(() => {
                // A bolinha se transforma de volta no card com a animação elástica!
                sidebar.classList.remove('sidebar-orb-mode');
            }, 380);
        } else {
            // No topo da página: sempre aberto como card completo
            clearTimeout(scrollTimeout);
            sidebar.classList.remove('sidebar-orb-mode');
        }
    }, { passive: true });

    // Clicar na bolinha abre imediatamente o card
    sidebar.addEventListener('click', () => {
        if (sidebar.classList.contains('sidebar-orb-mode')) {
            clearTimeout(scrollTimeout);
            sidebar.classList.remove('sidebar-orb-mode');
        }
    });
}

// Inicia quando o DOM carregar
document.addEventListener('DOMContentLoaded', () => {
    initFannedCarousel();
    initCatalogFilters();
    updateWishlistBadge();
    initMorphingSidebar();

    // Fecha modal clicando fora
    const modal = document.getElementById('gameModal');
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeGameModal();
            }
        });
    }

    // Verifica se há visualização específica na URL (?view=about ou ?view=catalog)
    const urlParams = new URLSearchParams(window.location.search);
    const viewParam = urlParams.get('view');
    if (viewParam) {
        switchGameStoreView(viewParam);
    }

    // Verifica se há jogo específico na URL (?game=unique-soul)
    const targetGame = urlParams.get('game');
    if (targetGame && GAMES_DATA[targetGame]) {
        // Se estiver em jogo.html, seleciona o jogo no inspetor
        if (window.selectGameInInspector) {
            window.selectGameInInspector(targetGame);
        } else {
            // Se estiver na home, abre o modal do jogo
            setTimeout(() => {
                openGameModal(targetGame);
            }, 300);
        }
    }
});

