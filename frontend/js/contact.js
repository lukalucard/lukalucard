// ============================================================
// frontend/js/contact.js
// Envio do formulário de contato para a API
// ============================================================

(function () {
    "use strict";

    // ================= CONFIGURAÇÕES =================

    // Em produção, usa o mesmo domínio. Em dev local, aponta pra API local.
    const API_URL = "/api/contact";

    // Tempo máximo de espera da resposta (ms)
    const TIMEOUT_MS = 30000;


    // ================= ELEMENTOS =================

    const form = document.getElementById("contact-form");
    const submitBtn = document.getElementById("contact-submit");
    const feedback = document.getElementById("contact-feedback");
    const submitText = submitBtn?.querySelector(".submit-text");
    const submitLoading = submitBtn?.querySelector(".submit-loading");

    // Guard: se o formulário não existe nesta página, não roda nada
    if (!form || !submitBtn || !feedback) return;


    // ================= HELPERS =================

    /**
     * Mostra mensagem de feedback no formulário.
     * @param {string} message - Texto
     * @param {"success"|"error"} type - Tipo
     */
    function showFeedback(message, type) {
        feedback.textContent = message;
        feedback.className = `contact-form-feedback ${type}`;
    }

    /**
     * Limpa o feedback anterior.
     */
    function clearFeedback() {
        feedback.textContent = "";
        feedback.className = "contact-form-feedback";
    }

    /**
     * Coloca o botão em estado de "enviando".
     */
    function setLoading(isLoading) {
        submitBtn.disabled = isLoading;

        if (submitText && submitLoading) {
            submitText.hidden = isLoading;
            submitLoading.hidden = !isLoading;
        }
    }

    /**
     * Coleta os dados do formulário como objeto.
     */
    function getFormData() {
        const data = new FormData(form);
        return {
            name: (data.get("name") || "").toString().trim(),
            email: (data.get("email") || "").toString().trim(),
            subject: (data.get("subject") || "").toString().trim(),
            message: (data.get("message") || "").toString().trim(),
            website: (data.get("website") || "").toString().trim(), // honeypot
        };
    }


    // ================= VALIDAÇÃO CLIENT-SIDE =================

    /**
     * Valida os dados antes de enviar.
     * Retorna um objeto { valid: boolean, message: string }.
     */
    function validate(data) {
        if (data.name.length < 2) {
            return { valid: false, message: "Por favor, informe seu nome completo." };
        }

        if (data.email.length === 0) {
            return { valid: false, message: "Por favor, informe seu e-mail." };
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
            return { valid: false, message: "Informe um e-mail válido." };
        }

        if (data.message.length < 10) {
            return { valid: false, message: "A mensagem deve ter pelo menos 10 caracteres." };
        }

        return { valid: true, message: "" };
    }


    // ================= ENVIO =================

    /**
     * Envia os dados para a API com timeout.
     */
    async function sendToAPI(data) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

        try {
            const response = await fetch(API_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
                signal: controller.signal,
            });

            clearTimeout(timeoutId);

            const json = await response.json().catch(() => null);

            return {
                ok: response.ok,
                status: response.status,
                data: json,
            };
        } catch (err) {
            clearTimeout(timeoutId);

            if (err.name === "AbortError") {
                throw new Error("A requisição demorou demais. Verifique sua conexão e tente novamente.");
            }

            throw new Error("Não foi possível conectar ao servidor. Tente novamente em alguns minutos.");
        }
    }


    // ================= SUBMIT =================

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        clearFeedback();

        const data = getFormData();

        // Honeypot: se preenchido, é bot. Finge sucesso e ignora.
        if (data.website) {
            showFeedback("Mensagem enviada com sucesso!", "success");
            form.reset();
            return;
        }

        // Validação client-side
        const validation = validate(data);
        if (!validation.valid) {
            showFeedback(validation.message, "error");
            return;
        }

        // Envia
        setLoading(true);

        try {
            const result = await sendToAPI({
                name: data.name,
                email: data.email,
                subject: data.subject,
                message: data.message,
            });

            if (result.ok) {
                showFeedback(
                    result.data?.message || "Mensagem enviada com sucesso! Responderei em breve.",
                    "success"
                );
                form.reset();
            } else {
                // Erros da API (422, 429, 500, etc.)
                let message = result.data?.message || "Não foi possível enviar sua mensagem.";

                // Se a API retornou lista de erros de validação, junta
                if (Array.isArray(result.data?.errors) && result.data.errors.length > 0) {
                    message = result.data.errors.map((e) => e.message).join(" ");
                }

                showFeedback(message, "error");
            }
        } catch (err) {
            showFeedback(err.message || "Erro inesperado. Tente novamente.", "error");
        } finally {
            setLoading(false);
        }
    });


    // ================= LIMPEZA DE FEEDBACK =================

    // Limpa o feedback quando o usuário começa a digitar de novo
    form.addEventListener("input", () => {
        if (feedback.textContent) clearFeedback();
    });

})();