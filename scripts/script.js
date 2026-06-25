// ============================================================
// 1. INICIALIZAÇÃO DO FIREBASE (Sempre no topo para evitar erros de ordem)
// ============================================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
    getAuth, 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    GoogleAuthProvider, 
    signInWithCredential 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyCJ2aVTkgS6-AG14pnE4zEkvN1p0WK1ZxY",
    authDomain: "unique-soul-tcc.firebaseapp.com",
    projectId: "1:595912682768:web:c6b7bc1efd17aa0a74c995",
    storageBucket: "unique-soul-tcc.firebasestorage.app",
    messagingSenderId: "595912682768",
    appId: "1:595912682768:web:c6b7bc1efd17aa0a74c995",
    measurementId: "G-EMPK7LGQH6"
};

const app = initializeApp(firebaseConfig);
window.auth = getAuth(app);

// ==========================================
// 2. COMPORTAMENTO APÓS CARREGAR A PÁGINA
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    // --- GERENCIAMENTO DE TEMA (CLARO/ESCURO) ---
    const themeToggle = document.getElementById('themeToggle') || document.getElementById('theme-toggle');
    const htmlElement = document.documentElement;
    const icon = themeToggle ? themeToggle.querySelector('i') : null;

    const savedTheme = localStorage.getItem('theme') || 'dark';
    htmlElement.setAttribute('data-theme', savedTheme);
    updateIcon(savedTheme);

    if (themeToggle) {
        themeToggle.addEventListener('click', (e) => {
            const currentTheme = htmlElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

            htmlElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            updateIcon(newTheme);
        });
    }

    function updateIcon(theme) {
        if (!icon) return;
        icon.className = theme === 'light' ? 'fas fa-sun' : 'fas fa-moon';
    }

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

    // --- VERIFICAÇÃO DE SESSÃO ATIVA ---
    const isLogged = localStorage.getItem('userLogged');
    const savedPhoto = localStorage.getItem('userPhoto');
    const savedName = localStorage.getItem('userName');
    const currentPage = window.location.pathname.split("/").pop();

    if ((currentPage === 'index.html' || currentPage === '') && isLogged === 'true') {
        window.location.href = 'home.html';
        return;
    }

    if (isLogged !== 'true' && currentPage !== 'index.html' && currentPage !== '') {
        window.location.href = 'index.html';
        return;
    }

    if (isLogged === 'true' && savedPhoto) {
        mostrarFotoUsuario(savedPhoto, savedName);
    } else {
        const btnContainer = document.getElementById('google-btn-container');
        if (btnContainer) {
            btnContainer.innerHTML = `<div class="g_id_signin" data-type="icon" data-size="large"></div>`;
            
            const renderizarBotaoGoogle = () => {
                if (typeof google !== 'undefined' && google.accounts && google.accounts.id) {
                    google.accounts.id.initialize({
                        client_id: "826067624292-nqa43nnrhurekir5nhkrr0ti0jt7lbur.apps.googleusercontent.com",
                        callback: window.handleGoogleLogin
                    });
                    
                    google.accounts.id.renderButton(
                        document.querySelector('.g_id_signin'),
                        { type: "icon", size: "large" }
                    );
                }
            };

            if (typeof google !== 'undefined') {
                renderizarBotaoGoogle();
            } else {
                window.addEventListener('load', renderizarBotaoGoogle);
            }
        }
    }
});

// ==========================================
// 3. COMPORTAMENTO DO CABEÇALHO AO ROLAR
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

// ============================================================
// 4. FUNÇÕES DE AUTENTICAÇÃO E LOGIN (GOOGLE / EMAIL)
// ============================================================

function parseJwt(token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
}

window.handleGoogleLogin = function(response) {
    const credential = GoogleAuthProvider.credential(response.credential);
    
    signInWithCredential(window.auth, credential)
        .then((result) => {
            const user = result.user;
            localStorage.setItem('userLogged', 'true');
            localStorage.setItem('userPhoto', user.photoURL || 'imagens/logo-s.png');
            localStorage.setItem('userName', user.displayName || 'Jogador');
            window.location.href = 'home.html';
        })
        .catch((error) => {
            console.error("Erro ao autenticar no Firebase com o Google:", error);
            alert("Erro ao conectar com o servidor do Google.");
        });
};

window.handleCredentialResponse = window.handleGoogleLogin;

function mostrarFotoUsuario(url, nome) {
    const btnContainer = document.getElementById('google-btn-container');
    if (btnContainer && url) {
        btnContainer.innerHTML = `
            <img src="${url}" 
                 alt="${nome}" 
                 class="user-profile-avatar" 
                 id="profile-trigger"
                 title="Ver meu perfil">
        `;

        const fotoBtn = document.getElementById('profile-trigger');
        if (fotoBtn) {
            fotoBtn.addEventListener('click', () => {
                window.location.href = 'perfil.html'; 
            });
        }
    }
}

window.isRegisterMode = false;

window.toggleFormMode = function() {
    window.isRegisterMode = !window.isRegisterMode;
    const title = document.getElementById('card-title');
    const desc = document.getElementById('card-desc');
    const submitBtn = document.getElementById('submitBtn');
    const toggleBtn = document.getElementById('toggleFormBtn');

    if (!title || !desc || !submitBtn || !toggleBtn) return;

    if (window.isRegisterMode) {
        title.innerHTML = "Criar <span>Conta</span>";
        desc.innerText = "Cadastre seu e-mail para liberar seu acesso.";
        submitBtn.innerText = "CONFIRMAR CADASTRO";
        toggleBtn.innerText = "Já tem uma conta? Faça Login";
    } else {
        title.innerHTML = "Acessar <span>Painel</span>";
        desc.innerText = "Conecte sua conta para acessar o Unique Soul.";
        submitBtn.innerText = "ENTRAR NO SITE";
        toggleBtn.innerText = "Não tem conta? Cadastre-se";
    }
};

window.handleEmailAuth = function(event) {
    event.preventDefault();
    
    const emailField = document.getElementById('email');
    const passwordField = document.getElementById('password');

    if (!emailField || !passwordField) return;

    const emailInput = emailField.value;
    const passwordInput = passwordField.value;

    if (window.isRegisterMode) {
        createUserWithEmailAndPassword(window.auth, emailInput, passwordInput)
            .then((userCredential) => {
                alert("Conta criada com sucesso no Firebase!");
                window.toggleFormMode();
            })
            .catch((error) => {
                if (error.code === 'auth/email-already-in-use') {
                    alert("Este e-mail já está cadastrado!");
                } else if (error.code === 'auth/weak-password') {
                    alert("A senha precisa ter no mínimo 6 caracteres!");
                } else {
                    alert("Erro ao cadastrar: " + error.message);
                }
            });
    } else {
        signInWithEmailAndPassword(window.auth, emailInput, passwordInput)
            .then((userCredential) => {
                localStorage.setItem('userLogged', 'true');
                localStorage.setItem('userName', emailInput.split('@')[0]);
                localStorage.setItem('userPhoto', 'imagens/logo-s.png');
                window.location.href = 'home.html';
            })
            .catch((error) => {
                alert("E-mail ou senha incorretos, ou usuário não existe!");
            });
    }
};