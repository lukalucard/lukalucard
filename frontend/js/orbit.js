// ============================================================
// orbit.js — Orbit unificado (home + projetos)
// Substitui: hero.js + projetos-hero.js
// ============================================================

(function () {
    "use strict";

    // ================= CONFIGURAÇÕES =================

    const CONFIG = {
        ROTATION_DURATION: 25,      // segundos para uma volta completa
        MIN_RADIUS: 90,             // raio mínimo em telas pequenas
        RADIUS_FACTOR: 1,        // fator do raio em relação ao container
        MAX_RADIUS: 320,            // raio máximo para não estourar em telas grandes
    };


    // ================= CLASSE ORBIT =================

    class Orbit {
        constructor(container) {
            this.container = container;

            // Aceita tanto a estrutura nova quanto a antiga (compatibilidade)
            this.track =
                container.querySelector(".orbit") ||
                container.querySelector(".projetos-orbit");

            if (!this.track) return;

            this.items = Array.from(
                this.track.querySelectorAll(".orbit-item, .projetos-orbit_item")
            );

            this.links = this.items
                .map((it) => it.querySelector("a"))
                .filter(Boolean);

            if (this.items.length === 0) return;

            this.centerEl = container.querySelector(
                ".orbit-center, .projetos-orbit_center"
            );

            // Estado
            this.radius = 0;
            this.angle = 0;
            this.lastTime = performance.now();
            this.paused = false;
            this.degPerSec = 360 / CONFIG.ROTATION_DURATION;

            // Ângulos-base distribuídos igualmente
            this.baseAngles = this.items.map(
                (_, i) => i * (360 / this.items.length)
            );

            this._bindEvents();
            this._recalc();
            this._updatePositions();
            this._loop = this._loop.bind(this);
            requestAnimationFrame(this._loop);
        }

        // -------------------- CÁLCULOS --------------------

        _recalc() {
            const rect = this.container.getBoundingClientRect();

            // Pega o tamanho real de um botão pra não sair do container
            const sampleLink = this.links[0];
            const linkSize = sampleLink
                ? sampleLink.getBoundingClientRect().width
                : 80;

            const baseRadius = Math.min(rect.width, rect.height) / 2;

            // Raio = base * fator - metade do botão (pra ele não encostar na borda)
            let radius = baseRadius * CONFIG.RADIUS_FACTOR - linkSize / 2;

            // Respeita os limites
            radius = Math.max(radius, CONFIG.MIN_RADIUS);
            radius = Math.min(radius, CONFIG.MAX_RADIUS);

            this.radius = radius;
        }

        // -------------------- POSIÇÕES --------------------

        _updatePositions() {
            this.items.forEach((item, idx) => {
                const link = item.querySelector("a");
                if (!link) return;

                const totalDeg = this.baseAngles[idx] + this.angle;

                // translate(-50%, -50%) centraliza o botão
                link.style.transform =
                    `translate(-50%, -50%) ` +
                    `rotate(${totalDeg}deg) ` +
                    `translate(${this.radius}px) ` +
                    `rotate(${-totalDeg}deg)`;
            });
        }

        // -------------------- LOOP --------------------

        _loop(now) {
            const dt = (now - this.lastTime) / 1000;
            this.lastTime = now;

            if (!this.paused) {
                this.angle += this.degPerSec * dt;
                this._updatePositions();
            }

            requestAnimationFrame(this._loop);
        }

        // -------------------- EVENTOS --------------------

        _bindEvents() {
            // Pausa no hover de cada link
            this.links.forEach((link) => {
                link.addEventListener("mouseenter", () => {
                    this.paused = true;
                });

                link.addEventListener("mouseleave", () => {
                    this.paused = false;
                });

                link.addEventListener(
                    "touchstart",
                    () => {
                        this.paused = true;
                    },
                    { passive: true }
                );

                link.addEventListener(
                    "touchend",
                    () => {
                        this.paused = false;
                    },
                    { passive: true }
                );
            });

            // Pausa/retoma clicando no centro
            if (this.centerEl) {
                this.centerEl.addEventListener("click", () => {
                    this.paused = !this.paused;
                });
            }

            // Debounce no resize
            let resizeTimeout;
            window.addEventListener("resize", () => {
                clearTimeout(resizeTimeout);
                resizeTimeout = setTimeout(() => {
                    this._recalc();
                    this._updatePositions();
                }, 150);
            });
        }
    }


    // ================= INICIALIZAÇÃO =================

    function init() {
        // Nova estrutura (recomendada)
        const newOrbits = document.querySelectorAll("[data-orbit]");

        // Compatibilidade com a estrutura antiga
        const oldOrbits = document.querySelectorAll(
            "#hero-orbit, #projetos-hero_orbit"
        );

        const allOrbits = new Set([...newOrbits, ...oldOrbits]);

        allOrbits.forEach((container) => new Orbit(container));
    }

    // Roda quando o DOM estiver pronto
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();