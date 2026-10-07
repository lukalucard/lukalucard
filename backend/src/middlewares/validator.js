// ============================================================
// backend/src/middlewares/validator.js
// Validação dos campos do formulário de contato
// ============================================================

const { body } = require("express-validator");

/**
 * Regras de validação para o formulário de contato.
 *
 * Cada campo tem suas regras específicas:
 *  - name:    2 a 100 caracteres, apenas letras e espaços
 *  - email:   formato válido, normalizado
 *  - subject: opcional, até 150 caracteres
 *  - message: 10 a 2000 caracteres
 */
const validateContact = [
    // ================= NOME =================
    body("name")
        .trim()
        .notEmpty()
        .withMessage("O nome é obrigatório.")
        .isLength({ min: 2, max: 100 })
        .withMessage("O nome deve ter entre 2 e 100 caracteres.")
        .matches(/^[A-Za-zÀ-ÿ\s'-]+$/)
        .withMessage("O nome contém caracteres inválidos.")
        .escape(),

    // ================= EMAIL =================
    body("email")
        .trim()
        .notEmpty()
        .withMessage("O e-mail é obrigatório.")
        .isEmail()
        .withMessage("Informe um e-mail válido.")
        .isLength({ max: 254 })
        .withMessage("O e-mail é muito longo.")
        .normalizeEmail(),

    // ================= ASSUNTO =================
    body("subject")
        .optional({ values: "falsy" })
        .trim()
        .isLength({ max: 150 })
        .withMessage("O assunto deve ter até 150 caracteres.")
        .escape(),

    // ================= MENSAGEM =================
    body("message")
        .trim()
        .notEmpty()
        .withMessage("A mensagem é obrigatória.")
        .isLength({ min: 10, max: 2000 })
        .withMessage("A mensagem deve ter entre 10 e 2000 caracteres.")
        .escape(),
];

module.exports = {
    validateContact,
};