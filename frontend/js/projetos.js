// ============================================================
// projetos.js — Carrossel de projetos (por card, independente)
// Recursos:
//  - Cada carrossel roda de forma isolada
//  - Navegação por botões, indicadores e teclado
//  - Pausa no hover e em aba inativa (visibilitychange)
//  - Suporte a swipe (touch) em mobile
//  - Guard clauses em tudo
// ============================================================

document.addEventListener("DOMContentLoaded", () => {
    // ================= CONFIGURAÇÕES =================

    const CONFIG = {
        AUTOPLAY_INTERVAL: 5000,   // tempo entre trocas automáticas (ms)
        SWIPE_THRESHOLD: 50,       // distância mínima para considerar swipe (px)
    };


    // ================= CLASSE CARROSSEL =================

    class Carousel {
        constructor(card) {
            this.card = card;

            this.slides = Array.from(card.querySelectorAll(".projetos-carousel_card"));
            this.indicators = Array.from(card.querySelectorAll(".projetos-indicator"));
            this.nextBtn = card.querySelector(".next");
            this.prevBtn = card.querySelector(".prev");
            this.carouselEl = card.querySelector(".projetos-carousel");

            // Guard: se não houver slides, não inicializa
            if (this.slides.length === 0) return;

            this.current = 0;
            this.interval = null;
            this.isPaused = false;

            // Touch
            this.touchStartX = 0;
            this.touchEndX = 0;

            this._bindEvents();
            this._startAutoplay();
        }

        // -------------------- NAVEGAÇÃO --------------------

        goTo(index) {
            this.slides[this.current].classList.remove("active");
            this.indicators[this.current]?.classList.remove("active");

            this.current = (index + this.slides.length) % this.slides.length;

            this.slides[this.current].classList.add("active");
            this.indicators[this.current]?.classList.add("active");
        }

        next() {
            this.goTo(this.current + 1);
        }

        prev() {
            this.goTo(this.current - 1);
        }

        // -------------------- AUTOPLAY --------------------

        _startAutoplay() {
            this._stopAutoplay();
            this.interval = setInterval(() => {
                if (!this.isPaused) this.next();
            }, CONFIG.AUTOPLAY_INTERVAL);
        }

        _stopAutoplay() {
            if (this.interval) {
                clearInterval(this.interval);
                this.interval = null;
            }
        }

        _restartAutoplay() {
            this._stopAutoplay();
            this._startAutoplay();
        }

        // -------------------- EVENTOS --------------------

        _bindEvents() {
            // Botões
            if (this.nextBtn) {
                this.nextBtn.addEventListener("click", () => {
                    this.next();
                    this._restartAutoplay();
                });
            }

            if (this.prevBtn) {
                this.prevBtn.addEventListener("click", () => {
                    this.prev();
                    this._restartAutoplay();
                });
            }

            // Indicadores
            this.indicators.forEach((indicator, idx) => {
                indicator.addEventListener("click", () => {
                    this.goTo(idx);
                    this._restartAutoplay();
                });
            });

            // Pausa no hover do carrossel
            if (this.carouselEl) {
                this.carouselEl.addEventListener("mouseenter", () => {
                    this.isPaused = true;
                });

                this.carouselEl.addEventListener("mouseleave", () => {
                    this.isPaused = false;
                });

                // Swipe (touch)
                this.carouselEl.addEventListener(
                    "touchstart",
                    (e) => {
                        this.touchStartX = e.changedTouches[0].screenX;
                        this.isPaused = true;
                    },
                    { passive: true }
                );

                this.carouselEl.addEventListener(
                    "touchend",
                    (e) => {
                        this.touchEndX = e.changedTouches[0].screenX;
                        this._handleSwipe();
                        this.isPaused = false;
                    },
                    { passive: true }
                );
            }

            // Navegação por setas do teclado (só quando o card está em foco via click)
            this.card.addEventListener("keydown", (e) => {
                if (e.key === "ArrowRight") this.next();
                if (e.key === "ArrowLeft") this.prev();
            });
        }

        _handleSwipe() {
            const diff = this.touchStartX - this.touchEndX;

            if (Math.abs(diff) < CONFIG.SWIPE_THRESHOLD) return;

            if (diff > 0) {
                this.next();  // deslizou para a esquerda → próximo
            } else {
                this.prev();  // deslizou para a direita → anterior
            }

            this._restartAutoplay();
        }
    }


    // ================= INICIALIZAÇÃO =================

    const cards = document.querySelectorAll(".box-projetos_card");
    const instances = [];

    cards.forEach((card) => {
        const instance = new Carousel(card);
        // Só guarda se realmente foi inicializada
        if (instance.slides?.length > 0) {
            instances.push(instance);
        }
    });


    // ================= PAUSA GLOBAL EM ABA INATIVA =================

    document.addEventListener("visibilitychange", () => {
        if (document.hidden) {
            instances.forEach((c) => c._stopAutoplay());
        } else {
            instances.forEach((c) => c._restartAutoplay());
        }
    });
});