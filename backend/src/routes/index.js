// ============================================================
// backend/src/routes/index.js
// Roteador principal — centraliza todas as rotas da API
// ============================================================

const express = require("express");
const router = express.Router();

const contactRoutes = require("./contact");

/**
 * Rota de saúde (health check).
 * Útil para verificar se a API está no ar sem chamar as rotas de negócio.
 */
router.get("/health", (req, res) => {
    res.json({
        success: true,
        message: "API está no ar",
        timestamp: new Date().toISOString(),
    });
});

/**
 * Rotas de contato: /api/contact
 */
router.use("/contact", contactRoutes);

/**
 * Futuras rotas (descomentar quando forem criadas):
 *
 * router.use("/auth", require("./auth"));      // login / cadastro
 * router.use("/games", require("./games"));    // jogos interativos
 * router.use("/admin", require("./admin"));    // painel administrativo
 */

module.exports = router;