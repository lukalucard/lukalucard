// ============================================================
// section.js — Animações de entrada com ScrollReveal
// Recursos:
//  - Guard clause: não quebra se ScrollReveal não carregar
//  - Configurações centralizadas por seção
//  - Detecta mobile para reduzir distância/tempo das animações
//  - Respeita prefers-reduced-motion (acessibilidade)
//  - Durações mais enxutas (antes tinham 2000ms)
// ============================================================

(function () {
    "use strict";

    // Guard: se ScrollReveal não carregou (CDN caiu, offline, etc.), sai
    if (typeof ScrollReveal === "undefined") {
        console.warn("[section.js] ScrollReveal não encontrado. Animações desativadas.");
        return;
    }


    // ================= DETECÇÃO DE AMBIENTE =================

    const isMobile = window.innerWidth < 768;
    const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    ).matches;

    // Se o usuário prefere menos movimento, não anima nada
    if (prefersReducedMotion) {
        console.info("[section.js] prefers-reduced-motion ativo. Animações desativadas.");
        return;
    }


    // ================= CONFIGURAÇÕES GLOBAIS =================

    const sr = ScrollReveal({
        // Distâncias e durações ajustadas para mobile
        distance: isMobile ? "40px" : "100px",
        duration: isMobile ? 500 : 800,
        easing: "ease-in-out",
        reset: false,     // antes era true — reexecutava toda hora ao rolar
        mobile: true,     // permite animações em telas pequenas
        viewOffset: {
            top: 80,
        },
    });


    // ================= HERO =================

    sr.reveal(".hero-txt", {
        origin: "right",
        distance: isMobile ? "40px" : "100px",
        duration: 800,
        delay: 200,
    });


    // ================= SOBRE =================

    sr.reveal(".sobre-card", {
        distance: isMobile ? "40px" : "100px",
        duration: 800,
        interval: 200,   // antes era 500 — muito lento
    });


    // ================= ESPECIALIDADES =================

    // Cards da esquerda
    sr.reveal(".web-designer, .editor-video, .modelador-3d", {
        origin: "left",
        distance: isMobile ? "40px" : "100px",
        duration: 600,
        delay: 100,
    });

    // Cards da direita
    sr.reveal(".designer-grafico, .motion-designer", {
        origin: "right",
        distance: isMobile ? "40px" : "100px",
        duration: 600,
        delay: 100,
    });

    // Títulos (entram por baixo, mais sutil)
    sr.reveal(".titulo", {
        origin: "bottom",
        distance: "40px",
        duration: 500,
    });


    // ================= PROJETOS =================

    sr.reveal(".box-projetos_card", {
        origin: "bottom",
        distance: isMobile ? "40px" : "80px",
        duration: 700,
        interval: 150,
    });

    sr.reveal(".projetos-btn_principal", {
        origin: "bottom",
        distance: "40px",
        duration: 600,
        delay: 200,
    });


    // ================= CONTATO =================

    sr.reveal(".contato-principal", {
        origin: "left",
        distance: isMobile ? "40px" : "120px",
        duration: 800,
        delay: 100,
    });

    sr.reveal(".social", {
        origin: "right",
        distance: isMobile ? "40px" : "120px",
        duration: 800,
        delay: 100,
    });


    // ================= PROJETOS (PÁGINA projetos.html) =================

    sr.reveal(".categoria-projeto .titulo", {
        origin: "top",
        distance: "40px",
        duration: 500,
    });

    sr.reveal(".categoria-projeto .box-projetos_card", {
        origin: "bottom",
        distance: isMobile ? "40px" : "80px",
        duration: 700,
        interval: 150,
    });

})();