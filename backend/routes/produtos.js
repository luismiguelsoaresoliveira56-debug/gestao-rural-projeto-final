const express = require("express");
const router = express.Router();
const db = require("../db");

// Unidades permitidas no sistema
const UNIDADES_PERMITIDAS = [
  "unidade",
  "kg",
  "g",
  "litro",
  "ml",
  "dúzia",
  "maço",
  "caixa",
  "saco",
  "arroba",
  "tonelada",
];

// Lista todos os produtos
router.get("/", (req, res) => {
  try {
    const produtos = db
      .prepare("SELECT * FROM produtos")
      .all();

    res.json(produtos);
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: "Erro ao buscar produtos",
    });
  }
});

// Busca um produto específico
router.get("/:id", (req, res) => {
  try {
    const produto = db
      .prepare(
        "SELECT * FROM produtos WHERE id = ?"
      )
      .get(req.params.id);

    if (!produto) {
      return res.status(404).json({
        error: "Produto não encontrado",
      });
    }

    res.json(produto);
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: "Erro ao buscar produto",
    });
  }
});

// Cadastra um novo produto
router.post("/", (req, res) => {
  try {
    const {
      nome,
      unidade,
      propriedade_id,
    } = req.body;

    if (
      !nome ||
      !unidade ||
      !propriedade_id
    ) {
      return res.status(400).json({
        error:
          "Nome, unidade e propriedade são obrigatórios",
      });
    }

    // Verifica se a unidade está na lista permitida
    if (
      !UNIDADES_PERMITIDAS.includes(unidade)
    ) {
      return res.status(400).json({
        error:
          "Unidade de medida inválida. Selecione uma unidade permitida.",
      });
    }

    // Verifica se a propriedade existe
    const propriedade = db
      .prepare(
        "SELECT id FROM propriedades WHERE id = ?"
      )
      .get(propriedade_id);

    if (!propriedade) {
      return res.status(400).json({
        error:
          "Propriedade informada não existe",
      });
    }

    const result = db
      .prepare(
        `
        INSERT INTO produtos
        (nome, unidade, propriedade_id)
        VALUES (?, ?, ?)
        `
      )
      .run(
        nome.trim(),
        unidade,
        propriedade_id
      );

    const novo = db
      .prepare(
        "SELECT * FROM produtos WHERE id = ?"
      )
      .get(result.lastInsertRowid);

    res.status(201).json(novo);
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: "Erro ao cadastrar produto",
    });
  }
});

// Atualiza um produto existente
router.put("/:id", (req, res) => {
  try {
    const {
      nome,
      unidade,
      propriedade_id,
    } = req.body;

    if (
      !nome ||
      !unidade ||
      !propriedade_id
    ) {
      return res.status(400).json({
        error:
          "Nome, unidade e propriedade são obrigatórios",
      });
    }

    // Verifica se a unidade está na lista permitida
    if (
      !UNIDADES_PERMITIDAS.includes(unidade)
    ) {
      return res.status(400).json({
        error:
          "Unidade de medida inválida. Selecione uma unidade permitida.",
      });
    }

    // Verifica se a propriedade existe
    const propriedade = db
      .prepare(
        "SELECT id FROM propriedades WHERE id = ?"
      )
      .get(propriedade_id);

    if (!propriedade) {
      return res.status(400).json({
        error:
          "Propriedade informada não existe",
      });
    }

    const result = db
      .prepare(
        `
        UPDATE produtos
        SET nome = ?, unidade = ?, propriedade_id = ?
        WHERE id = ?
        `
      )
      .run(
        nome.trim(),
        unidade,
        propriedade_id,
        req.params.id
      );

    if (result.changes === 0) {
      return res.status(404).json({
        error: "Produto não encontrado",
      });
    }

    const atualizado = db
      .prepare(
        "SELECT * FROM produtos WHERE id = ?"
      )
      .get(req.params.id);

    res.json(atualizado);
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: "Erro ao atualizar produto",
    });
  }
});

// Remove um produto
router.delete("/:id", (req, res) => {
  try {
    // Não permite excluir produto que possui vendas
    const temVendas = db
      .prepare(
        "SELECT id FROM vendas WHERE produto_id = ?"
      )
      .get(req.params.id);

    if (temVendas) {
      return res.status(400).json({
        error:
          "Não é possível excluir: produto possui vendas registradas",
      });
    }

    const result = db
      .prepare(
        "DELETE FROM produtos WHERE id = ?"
      )
      .run(req.params.id);

    if (result.changes === 0) {
      return res.status(404).json({
        error: "Produto não encontrado",
      });
    }

    res.status(204).send();
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: "Erro ao excluir produto",
    });
  }
});

module.exports = router;
