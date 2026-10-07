// ============================================================
// backend/src/routes/contact.js
// Rotas do formulário de contato
// ============================================================

const express = require("express");
const router = express.Router();

const { contactLimiter } = require("../middlewares/rateLimiter");
const { validateContact } = require("../middlewares/validator");
const { sendContact } = require("../controllers/contactController");

/**
 * POST /api/contact
 *
 * Middlewares na ordem correta:
 *  1. contactLimiter → bloqueia spam antes de fazer qualquer trabalho
 *  2. validateContact → valida os dados do formulário
 *  3. sendContact → executa a lógica de envio de e-mail
 */
router.post("/", contactLimiter, validateContact, sendContact);

module.exports = router;