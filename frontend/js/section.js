// ============================================================
// section.js — Animações de entrada com ScrollReveal
// Recursos:
//  - Guard clause: não quebra se ScrollReveal não carregar
//  - Detecta mobile para reduzir distância/tempo das animações
//  - Respeita prefers-reduced-motion (acessibilidade)
//  - Animações mais ágeis (durations + intervals menores)
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
        distance: isMobile ? "30px" : "60px",   // percurso curto
        duration: isMobile ? 450 : 650,          // animação ágil
        easing: "ease-out",                      // entrada mais natural
        opacity: 0,
        reset: false,
        mobile: true,
        viewOffset: { top: 150 },                // dispara ANTES de aparecer
    });


    // ================= HERO =================

    sr.reveal(".hero-txt", {
        origin: "right",
        distance: isMobile ? "30px" : "60px",
        duration: 700,
        delay: 100,
    });


    // ================= SOBRE =================

    sr.reveal(".sobre-card", {
        origin: "bottom",
        distance: isMobile ? "30px" : "60px",
        duration: 650,
        interval: 80,   // cascata sutil, sem delay perceptível
    });


    // ================= ESPECIALIDADES =================

    sr.reveal(".web-designer, .editor-video, .modelador-3d", {
        origin: "left",
        distance: isMobile ? "30px" : "60px",
        duration: 550,
        interval: 80,
    });

    sr.reveal(".designer-grafico, .motion-designer", {
        origin: "right",
        distance: isMobile ? "30px" : "60px",
        duration: 550,
        interval: 80,
    });

    sr.reveal(".titulo", {
        origin: "bottom",
        distance: "30px",
        duration: 500,
    });


    // ================= PROJETOS =================

    sr.reveal(".box-projetos_card", {
        origin: "bottom",
        distance: isMobile ? "30px" : "50px",
        duration: 550,
        interval: 60,   // efeito cascata quase simultâneo
    });

    sr.reveal(".projetos-btn_principal", {
        origin: "bottom",
        distance: "30px",
        duration: 500,
        delay: 100,
    });


    // ================= CONTATO =================

    sr.reveal(".contato-principal", {
        origin: "left",
        distance: isMobile ? "30px" : "60px",
        duration: 650,
        delay: 80,
    });

    sr.reveal(".social", {
        origin: "right",
        distance: isMobile ? "30px" : "60px",
        duration: 650,
        delay: 80,
    });


    // ================= PROJETOS (PÁGINA projetos.html) =================

    sr.reveal(".categoria-projeto .titulo", {
        origin: "top",
        distance: "30px",
        duration: 500,
    });

    sr.reveal(".categoria-projeto .box-projetos_card", {
        origin: "bottom",
        distance: isMobile ? "30px" : "50px",
        duration: 550,
        interval: 60,
    });

})();