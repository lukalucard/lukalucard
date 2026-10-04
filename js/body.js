// ============================================================
// body.js — Barra de scroll + Fundo espacial animado
// ============================================================

// ================= BARRA DE SCROLL =================

const scrollBar = document.querySelector(".scroll-bar");

window.addEventListener("scroll", () => {
    const scrollTop = document.documentElement.scrollTop;
    const scrollHeight =
        document.documentElement.scrollHeight -
        document.documentElement.clientHeight;

    const progress = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;

    if (scrollBar) {
        scrollBar.style.width = progress + "%";
    }
});

// Impede o navegador de lembrar a posição do scroll
if ("scrollRestoration" in history) {
    history.scrollRestoration = "manual";
}

// Garante que a página sempre comece no topo (sem sobrescrever outros loads)
window.addEventListener("load", () => {
    window.scrollTo(0, 0);
});


// ================= FUNDO ESPACIAL =================

const canvas = document.getElementById("space-bg");

// Guard clause: se não existir canvas na página, não roda nada
if (canvas) {
    const ctx = canvas.getContext("2d");

    // Configurações globais
    const CONFIG = {
        MAX_SCROLL_SPEED: 50,
        MOUSE_RADIUS: 120,
        STAR_RETURN_FORCE: 0.008,   // velocidade de volta ao lugar
        MOUSE_PUSH_FORCE: 0.01,     // força de empurrão
        NEBULA_COUNT: 5,
        SHOOTING_STAR_CHANCE: 0.002,
    };

    let shootingStar = null;
    let starsFar = [];
    let starsNear = [];
    let nebulas = [];
    let scrollSpeed = 0;

    const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    ).matches;

    // ================= MOUSE =================

    const mouse = { x: null, y: null };

    window.addEventListener("mousemove", (event) => {
        mouse.x = event.clientX;
        mouse.y = event.clientY;
    });

    // Reseta o mouse ao sair da janela (evita posição fantasma)
    document.addEventListener("mouseleave", () => {
        mouse.x = null;
        mouse.y = null;
    });

    // Scroll influencia a velocidade das estrelas
    window.addEventListener(
        "wheel",
        (event) => {
            scrollSpeed += event.deltaY * 0.1;

            // Limita para não causar saltos absurdos
            scrollSpeed = Math.max(
                -CONFIG.MAX_SCROLL_SPEED,
                Math.min(CONFIG.MAX_SCROLL_SPEED, scrollSpeed)
            );
        },
        { passive: true }
    );


    // ================= CANVAS SIZE =================

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    let resizeTimeout;

    window.addEventListener("resize", () => {
        clearTimeout(resizeTimeout);

        resizeTimeout = setTimeout(() => {
            resizeCanvas();
            createStars();
            createNebulas();
        }, 200);
    });

    resizeCanvas();


    // ================= NEBULOSAS =================

    function createNebulas() {
        nebulas = [];

        for (let i = 0; i < CONFIG.NEBULA_COUNT; i++) {
            nebulas.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                size: 300 + Math.random() * 300,
                color: `hsla(${Math.random() * 360}, 80%, 60%, 0.08)`,
                speedX: (Math.random() - 0.5) * 0.1,
                speedY: (Math.random() - 0.5) * 0.1,
            });
        }
    }


    // ================= ESTRELA CADENTE =================

    function createShootingStar() {
        shootingStar = {
            x: Math.random() * canvas.width,
            y: -50,
            length: 200,
            speed: 8 + Math.random() * 4,
            opacity: 1,
        };
    }


    // ================= ESTRELAS =================

    function createStars() {
        starsFar = [];
        starsNear = [];

        let farCount;
        let nearCount;

        if (window.innerWidth < 600) {
            farCount = 300;
            nearCount = 100;
        } else if (window.innerWidth < 1000) {
            farCount = 500;
            nearCount = 200;
        } else {
            farCount = 700;
            nearCount = 300;
        }

        for (let i = 0; i < farCount; i++) {
            const x = Math.random() * canvas.width;
            const y = Math.random() * canvas.height;

            starsFar.push({
                x,
                y,
                baseX: x,   // posição "de casa" (pra voltar depois do empurrão)
                baseY: y,
                size: Math.random() * 1.2,
                speed: Math.random() * 0.15,
                opacity: Math.random(),
                twinkle: Math.random() * 0.02,
            });
        }

        for (let i = 0; i < nearCount; i++) {
            const x = Math.random() * canvas.width;
            const y = Math.random() * canvas.height;

            starsNear.push({
                x,
                y,
                baseX: x,
                baseY: y,
                size: 1 + Math.random() * 2,
                speed: 0.2 + Math.random() * 0.4,
                opacity: Math.random(),
                twinkle: Math.random() * 0.03,
            });
        }
    }


    // ================= DESENHAR =================

    function drawStars() {
        scrollSpeed *= 0.97;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // ===== NEBULOSAS =====
        nebulas.forEach((nebula) => {
            nebula.x += nebula.speedX;
            nebula.y += nebula.speedY;

            if (mouse.x !== null) {
                const dx = mouse.x - nebula.x;
                const dy = mouse.y - nebula.y;

                nebula.x += dx * 0.0002;
                nebula.y += dy * 0.0002;
            }

            const gradient = ctx.createRadialGradient(
                nebula.x,
                nebula.y,
                0,
                nebula.x,
                nebula.y,
                nebula.size
            );

            gradient.addColorStop(0, nebula.color);
            gradient.addColorStop(1, "transparent");

            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(nebula.x, nebula.y, nebula.size, 0, Math.PI * 2);
            ctx.fill();
        });

        // ===== ESTRELA CADENTE =====
        if (shootingStar) {
            shootingStar.x += shootingStar.speed;
            shootingStar.y += shootingStar.speed;
            shootingStar.opacity -= 0.01;

            const gradient = ctx.createLinearGradient(
                shootingStar.x,
                shootingStar.y,
                shootingStar.x - shootingStar.length,
                shootingStar.y - shootingStar.length
            );

            gradient.addColorStop(
                0,
                `rgba(255,255,255,${shootingStar.opacity})`
            );
            gradient.addColorStop(1, "transparent");

            ctx.strokeStyle = gradient;
            ctx.lineWidth = 2;

            ctx.beginPath();
            ctx.moveTo(shootingStar.x, shootingStar.y);
            ctx.lineTo(
                shootingStar.x - shootingStar.length,
                shootingStar.y - shootingStar.length
            );
            ctx.stroke();

            if (shootingStar.opacity <= 0) {
                shootingStar = null;
            }
        }

        // ===== ESTRELAS (função interna pra evitar duplicação) =====
        function renderStars(collection, scrollMultiplier) {
            collection.forEach((star) => {
                star.y += star.speed + scrollSpeed * scrollMultiplier;

                // Twinkle
                star.opacity += star.twinkle;
                if (star.opacity >= 1 || star.opacity <= 0.2) {
                    star.twinkle *= -1;
                }

                // Reação ao mouse (empurra)
                if (mouse.x !== null && mouse.y !== null) {
                    const dx = mouse.x - star.x;
                    const dy = mouse.y - star.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < CONFIG.MOUSE_RADIUS) {
                        star.x -= dx * CONFIG.MOUSE_PUSH_FORCE;
                        star.y -= dy * CONFIG.MOUSE_PUSH_FORCE;
                    }
                }

                // Volta gradual pra posição original
                star.x += (star.baseX - star.x) * CONFIG.STAR_RETURN_FORCE;
                star.y += (star.baseY - star.y) * CONFIG.STAR_RETURN_FORCE;

                // Wrap vertical
                if (star.y > canvas.height) {
                    star.y = 0;
                    star.x = Math.random() * canvas.width;
                    star.baseX = star.x;
                    star.baseY = star.y;
                }

                if (star.y < 0) {
                    star.y = canvas.height;
                    star.x = Math.random() * canvas.width;
                    star.baseX = star.x;
                    star.baseY = star.y;
                }

                // Wrap horizontal (pra estrelas empurradas pra fora)
                if (star.x > canvas.width) star.x = 0;
                if (star.x < 0) star.x = canvas.width;

                ctx.beginPath();
                ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255,255,255,${star.opacity})`;
                ctx.fill();
            });
        }

        renderStars(starsFar, 0.10);
        renderStars(starsNear, 0.05);

        // Cria estrela cadente aleatoriamente (respeitando reduced-motion)
        if (
            !shootingStar &&
            !prefersReducedMotion &&
            Math.random() < CONFIG.SHOOTING_STAR_CHANCE
        ) {
            createShootingStar();
        }

        // Só continua o loop se a aba estiver visível
        if (!document.hidden) {
            requestAnimationFrame(drawStars);
        } else {
            // Quando a aba voltar, retoma
            document.addEventListener(
                "visibilitychange",
                () => {
                    if (!document.hidden) {
                        requestAnimationFrame(drawStars);
                    }
                },
                { once: true }
            );
        }
    }


    // ================= START =================

    createNebulas();
    createStars();

    // Se o usuário prefere menos movimento, só desenha uma vez (estático)
    if (prefersReducedMotion) {
        // Desenha estático, sem loop
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        starsFar.forEach((s) => {
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255,255,255,${s.opacity})`;
            ctx.fill();
        });
    } else {
        drawStars();
    }
}