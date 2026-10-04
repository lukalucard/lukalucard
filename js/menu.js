// ============================================================
// menu.js — Menu hamburguer + Scroll ativo + Fechar em resize
// ============================================================

const menuIcon = document.querySelector("#menu-icon");
const navbar = document.querySelector(".navbar");
const overlay = document.querySelector(".menu-overlay");

const sections = document.querySelectorAll("section");
const navLinks = document.querySelectorAll("header nav a");


// ================= FUNÇÕES AUXILIARES =================

function openMenu() {
    if (!menuIcon || !navbar || !overlay) return;
    menuIcon.classList.add("bx-x");
    navbar.classList.add("active");
    overlay.classList.add("active");
}

function closeMenu() {
    if (!menuIcon || !navbar || !overlay) return;
    menuIcon.classList.remove("bx-x");
    navbar.classList.remove("active");
    overlay.classList.remove("active");
}

function toggleMenu() {
    if (!navbar) return;
    if (navbar.classList.contains("active")) {
        closeMenu();
    } else {
        openMenu();
    }
}


// ================= SCROLL ATIVO (IntersectionObserver) =================

if (sections.length > 0 && navLinks.length > 0) {

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;

                const id = entry.target.getAttribute("id");
                if (!id) return;

                // Remove ativo de todos
                navLinks.forEach((link) => link.classList.remove("active"));

                // Marca o link correspondente
                const activeLink = document.querySelector(
                    `header nav a[href*="${id}"]`
                );

                if (activeLink) activeLink.classList.add("active");
            });
        },
        {
            // A seção é considerada "ativa" quando cruza o meio da tela
            rootMargin: "-50% 0px -50% 0px",
            threshold: 0,
        }
    );

    sections.forEach((sec) => observer.observe(sec));
}


// ================= MENU HAMBURGUER =================

if (menuIcon) {
    menuIcon.addEventListener("click", toggleMenu);
}

if (overlay) {
    overlay.addEventListener("click", closeMenu);
}

// Fecha o menu ao clicar em qualquer link de navegação
navLinks.forEach((link) => {
    link.addEventListener("click", closeMenu);
});


// ================= FECHAR MENU AO REDIMENSIONAR =================

// Se o usuário abrir o menu no mobile e girar/redimensionar
// para desktop, o menu "fantasma" não fica pendurado.
let resizeMenuTimeout;

window.addEventListener("resize", () => {
    clearTimeout(resizeMenuTimeout);

    resizeMenuTimeout = setTimeout(() => {
        const isDesktop = window.innerWidth > 910;

        // Em projetos.html o breakpoint é diferente (1320px)
        const isDesktopProjetos =
            document.body.classList.contains("pg-projetos") &&
            window.innerWidth > 1320;

        if (isDesktop || isDesktopProjetos) {
            closeMenu();
        }
    }, 150);
});


// ================= FECHAR MENU COM TECLA ESC =================

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
        closeMenu();
    }
});