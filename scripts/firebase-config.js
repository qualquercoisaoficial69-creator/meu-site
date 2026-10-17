// ============================================================
// CONFIGURAÇÃO DO FIREBASE (AUTH COM GOOGLE & FIRESTORE)
// Portal Qualquer Coisa Rápido
// ============================================================

// Cole aqui as configurações do seu projeto do Firebase Console:
// (Vá em Console do Firebase > Configurações do Projeto > Seus Aplicativos > Web)
const firebaseConfig = {
  apiKey: "AIzaSyDvT5k1sdN_Pa9nhg-iBJrDmIo00mk8JZ8",
  authDomain: "qualquer-coisa-oficial.firebaseapp.com",
  projectId: "qualquer-coisa-oficial",
  storageBucket: "qualquer-coisa-oficial.firebasestorage.app",
  messagingSenderId: "336827977956",
  appId: "1:336827977956:web:ca30a2a28e9124a7eadcf1",
  measurementId: "G-N5X21NHP72"
};

const FIREBASE_CONFIG = firebaseConfig;

// Lista de e-mails da equipe autorizados a postar, editar e excluir no CMS:
const AUTHORIZED_CREATOR_EMAILS = [
    'qualquercoisaoficial69@gmail.com',
    'brennofirminodejesus@gmail.com',
    'izam20027@gmail.com',
    'gtofrazatto@gmail.com'
];

let isFirebaseInitialized = false;
let auth = null;
let googleProvider = null;
let currentUserProfile = null;

// Inicializa o Firebase
try {
    const configToUse = typeof firebaseConfig !== 'undefined' ? firebaseConfig : (typeof FIREBASE_CONFIG !== 'undefined' ? FIREBASE_CONFIG : null);
    if (typeof firebase !== 'undefined' && configToUse && configToUse.apiKey && configToUse.apiKey !== "SUA_API_KEY_DO_FIREBASE") {
        firebase.initializeApp(configToUse);
        auth = firebase.auth();
        googleProvider = new firebase.auth.GoogleAuthProvider();
        googleProvider.setCustomParameters({ prompt: 'select_account' });
        isFirebaseInitialized = true;
        console.log("🔥 Firebase inicializado com sucesso!");
    } else {
        console.log("ℹ️ Firebase rodando em modo Simulação/Local. Configure suas credenciais em scripts/firebase-config.js quando criar seu projeto!");
    }
} catch (e) {
    console.warn("Aviso na inicialização do Firebase:", e);
}

// ==========================================
// FUNÇÕES DE AUTENTICAÇÃO COM O GOOGLE
// ==========================================

// Login com Google Popup
window.loginWithGoogle = async function() {
    if (isFirebaseInitialized && auth && googleProvider) {
        try {
            const result = await auth.signInWithPopup(googleProvider);
            const user = result.user;
            await saveUserProfileToDatabase(user);
            return user;
        } catch (error) {
            console.error("Erro no login com Google:", error);
            if (error.code !== 'auth/popup-closed-by-user') {
                alert("Erro ao conectar com o Google: " + error.message);
            }
            return null;
        }
    } else {
        alert('O login está indisponível. Verifique a configuração do Firebase e tente novamente.');
        return null;
    }
};

// Logout
window.logoutUser = async function() {
    if (isFirebaseInitialized && auth) {
        try {
            await auth.signOut();
        } catch (error) {
            console.error("Erro ao sair:", error);
        }
    }
    localStorage.removeItem('qc_current_user');
    window.updateAuthUI(null);
    window.dispatchEvent(new CustomEvent('qc_auth_changed', { detail: null }));
};

// Salva os dados básicos do perfil (Nome, Foto, E-mail) no Firestore
async function saveUserProfileToDatabase(user) {
    if (!user) return;
    const isCreator = window.isUserCreator(user);
    const profile = {
        uid: user.uid,
        name: user.displayName || 'Usuário Sem Nome',
        email: user.email,
        photoURL: user.photoURL || 'imagens/Logo_colorida.png',
        emailVerified: user.emailVerified || false,
        role: isCreator ? 'creator' : 'member',
        lastLogin: new Date().toISOString()
    };

    localStorage.setItem('qc_current_user', JSON.stringify(profile));

}

// Verifica se o usuário logado tem permissão para postar no CMS
window.isUserCreator = function(user) {
    const targetUser = user || window.getCurrentUser();
    if (!targetUser || !targetUser.email) return false;
    
    // É criador se o e-mail estiver na lista de autorizados e for verificado
    return AUTHORIZED_CREATOR_EMAILS.some(e => e.toLowerCase() === targetUser.email.toLowerCase());
};

// Retorna o usuário logado atualmente
window.getCurrentUser = function() {
    if (auth?.currentUser) return auth.currentUser;
    if (isFirebaseInitialized) return null;
    try {
        const stored = localStorage.getItem('qc_current_user');
        if (stored) return JSON.parse(stored);
    } catch {}
    return null;
};

// Atualiza a barra de navegação com o botão de Google ou o perfil
window.updateAuthUI = function(user) {
    const profileContainers = document.querySelectorAll('.topbar-profile-container');
    const u = user || window.getCurrentUser();

    profileContainers.forEach(container => {
        if (!u) {
            // Não logado: Mostra botão de login com Google
            container.innerHTML = `
                <button type="button" class="btn-google-login" onclick="loginWithGoogle()" aria-label="Entrar com o Google">
                    <svg class="google-icon" viewBox="0 0 24 24" width="18" height="18">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                    </svg>
                    <span>Entrar com Google</span>
                </button>
            `;
        } else {
            // Logado: Mostra avatar, nome e menu dropdown de perfil
            const firstName = (u.name || u.displayName || 'Jogador').split(' ')[0];
            const isCreator = window.isUserCreator(u);
            const photo = u.photoURL || 'imagens/Logo_colorida.png';

            container.innerHTML = `
                <div class="user-profile-badge" onclick="toggleUserProfileDropdown(event)">
                    <img src="${photo}" alt="Foto de ${firstName}" class="profile-avatar">
                    <span class="profile-name">${firstName}</span>
                    <i class="fas fa-chevron-down profile-dropdown-arrow"></i>
                </div>

                <div class="user-profile-dropdown" id="userProfileDropdown">
                    <div class="profile-dropdown-header">
                        <img src="${photo}" alt="Avatar" class="profile-dropdown-avatar">
                        <div class="profile-dropdown-user-info">
                            <strong>${u.name || u.displayName}</strong>
                            <small>${u.email}</small>
                            <span class="user-role-badge ${isCreator ? 'creator' : 'member'}">
                                ${isCreator ? '👑 Criador / Equipe' : '👾 Membro da Comunidade'}
                            </span>
                        </div>
                    </div>
                    
                    <div class="profile-dropdown-menu">
                        ${isCreator ? `
                            <a href="cms.html" class="profile-dropdown-item creator-link">
                                <i class="fas fa-feather-alt"></i> Painel CMS
                            </a>
                        ` : ''}
                        <a href="javascript:void(0)" onclick="alert('Suas curtidas: ' + (JSON.parse(localStorage.getItem('qc_liked_posts')||'[]').length) + ' publicações favoritadas!')" class="profile-dropdown-item">
                            <i class="fas fa-heart"></i> Minhas Curtidas
                        </a>
                        <button type="button" class="profile-dropdown-item logout-btn" onclick="logoutUser()">
                            <i class="fas fa-sign-out-alt"></i> Sair da Conta
                        </button>
                    </div>
                </div>
            `;
        }
    });

    // Controla visibilidade de todos os elementos exclusivos de criadores/admins no site
    const isCreator = window.isUserCreator(u);
    document.querySelectorAll('.creator-only, .creator-only-nav').forEach(el => {
        el.style.display = isCreator ? '' : 'none';
    });

    // Se estiver na página do CMS, executa verificação de segurança
    if (typeof window.verifyCmsAccess === 'function') {
        window.verifyCmsAccess();
    }

    if (typeof window.renderCmsCarousel === 'function') window.renderCmsCarousel();

    // Se estiver na home com feed de posts, atualiza para refletir permissões
    if (typeof window.renderHomeFeed === 'function' && document.getElementById('homeFeedPosts')) {
        const activeTab = document.querySelector('.catalog-filter-tabs .catalog-tab.active');
        const cat = activeTab ? activeTab.getAttribute('data-filter') : 'all';
        const searchInput = document.getElementById('catalogSearch');
        window.renderHomeFeed(cat, searchInput ? searchInput.value : '');
    }
};

window.toggleUserProfileDropdown = function(e) {
    if (e) e.stopPropagation();
    const dropdown = document.getElementById('userProfileDropdown');
    if (dropdown) dropdown.classList.toggle('active');
};

document.addEventListener('click', (e) => {
    if (!e.target.closest('.topbar-profile-container')) {
        const dropdown = document.getElementById('userProfileDropdown');
        if (dropdown) dropdown.classList.remove('active');
    }
});

// Listener de estado de autenticação real do Firebase
if (isFirebaseInitialized && auth) {
    auth.onAuthStateChanged(async (user) => {
        if (user) {
            window.updateAuthUI(user);
        } else {
            window.updateAuthUI(null);
        }
    });
} else {
    document.addEventListener('DOMContentLoaded', () => {
        window.updateAuthUI(null);
    });
}

// ==========================================
// ACESSO A PUBLICAÇÕES PELA API DE SERVIDOR
// ==========================================
async function requestPostsApi(method, body, authenticated = true) {
    const activeUser = auth?.currentUser;
    const headers = { 'Content-Type': 'application/json' };
    if (authenticated && activeUser) headers.Authorization = `Bearer ${await activeUser.getIdToken()}`;
    const response = await fetch('/api/posts', {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.error || 'Falha ao acessar as publicações.');
    return result;
}

window.savePostToFirestore = post => {
    if (!post?.id) throw new Error('Publicação inválida.');
    return requestPostsApi('POST', { post });
};

window.deletePostFromFirestore = postId => postId
    ? requestPostsApi('DELETE', { postId })
    : Promise.resolve();

window.updatePostLikesInFirestore = postId => postId
    ? requestPostsApi('PATCH', { postId })
    : Promise.resolve();

window.loadPostsFromApi = async function() {
    const posts = await requestPostsApi('GET', null, false);
    if (!Array.isArray(posts)) throw new Error('Resposta inválida do servidor.');
    window.dispatchEvent(new CustomEvent('qc_posts_loaded', { detail: posts }));
    return posts;
};
