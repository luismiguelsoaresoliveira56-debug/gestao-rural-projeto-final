const express = require("express");
const router = express.Router();
const db = require("../db");

// Lista todas as vendas
router.get("/", (req, res) => {
  try {
    const { produto_id } = req.query;

    const baseQuery = `
      SELECT
        vendas.*,
        produtos.nome AS produto_nome
      FROM vendas
      JOIN produtos
        ON produtos.id = vendas.produto_id
    `;

    if (produto_id) {
      const filtradas = db
        .prepare(
          `
          ${baseQuery}
          WHERE vendas.produto_id = ?
          ORDER BY vendas.data DESC
          `
        )
        .all(produto_id);

      return res.json(filtradas);
    }

    const todas = db
      .prepare(
        `
        ${baseQuery}
        ORDER BY vendas.data DESC
        `
      )
      .all();

    res.json(todas);
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: "Erro ao buscar vendas",
    });
  }
});

// Busca uma venda específica
router.get("/:id", (req, res) => {
  try {
    const venda = db
      .prepare(
        `
        SELECT
          vendas.*,
          produtos.nome AS produto_nome
        FROM vendas
        JOIN produtos
          ON produtos.id = vendas.produto_id
        WHERE vendas.id = ?
        `
      )
      .get(req.params.id);

    if (!venda) {
      return res.status(404).json({
        error: "Venda não encontrada",
      });
    }

    res.json(venda);
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: "Erro ao buscar venda",
    });
  }
});

// Registra uma nova venda
router.post("/", (req, res) => {
  try {
    const {
      produto_id,
      quantidade,
      valor_unitario,
      data,
      cliente,
      propriedade_id,
    } = req.body;

    if (
      !produto_id ||
      quantidade === undefined ||
      valor_unitario === undefined ||
      !data ||
      !propriedade_id
    ) {
      return res.status(400).json({
        error:
          "Produto, quantidade, valor unitário, data e propriedade são obrigatórios",
      });
    }

    if (
      Number(quantidade) <= 0 ||
      Number(valor_unitario) <= 0
    ) {
      return res.status(400).json({
        error:
          "Quantidade e valor unitário devem ser maiores que zero",
      });
    }

    // Busca o produto e sua propriedade
    const produto = db
      .prepare(
        `
        SELECT
          id,
          propriedade_id
        FROM produtos
        WHERE id = ?
        `
      )
      .get(produto_id);

    if (!produto) {
      return res.status(400).json({
        error:
          "Produto informado não existe",
      });
    }

    // REGRA PRINCIPAL:
    // a propriedade da venda deve ser a mesma
    // propriedade cadastrada no produto.
    if (
      Number(propriedade_id) !==
      Number(produto.propriedade_id)
    ) {
      return res.status(400).json({
        error:
          "A propriedade selecionada não pertence ao produto informado",
      });
    }

    // Confirma que a propriedade realmente existe
    const propriedade = db
      .prepare(
        `
        SELECT id
        FROM propriedades
        WHERE id = ?
        `
      )
      .get(propriedade_id);

    if (!propriedade) {
      return res.status(400).json({
        error:
          "Propriedade informada não existe",
      });
    }

    // O total é sempre calculado no servidor
    const total =
      Number(quantidade) *
      Number(valor_unitario);

    const result = db
      .prepare(
        `
        INSERT INTO vendas
        (
          produto_id,
          quantidade,
          valor_unitario,
          total,
          data,
          cliente,
          propriedade_id
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
        `
      )
      .run(
        produto_id,
        quantidade,
        valor_unitario,
        total,
        data,
        cliente || "",
        propriedade_id
      );

    const nova = db
      .prepare(
        "SELECT * FROM vendas WHERE id = ?"
      )
      .get(result.lastInsertRowid);

    res.status(201).json(nova);
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: "Erro ao registrar venda",
    });
  }
});

// Atualiza uma venda existente
router.put("/:id", (req, res) => {
  try {
    const {
      produto_id,
      quantidade,
      valor_unitario,
      data,
      cliente,
      propriedade_id,
    } = req.body;

    if (
      !produto_id ||
      quantidade === undefined ||
      valor_unitario === undefined ||
      !data ||
      !propriedade_id
    ) {
      return res.status(400).json({
        error:
          "Produto, quantidade, valor unitário, data e propriedade são obrigatórios",
      });
    }

    if (
      Number(quantidade) <= 0 ||
      Number(valor_unitario) <= 0
    ) {
      return res.status(400).json({
        error:
          "Quantidade e valor unitário devem ser maiores que zero",
      });
    }

    // Busca o produto e sua propriedade
    const produto = db
      .prepare(
        `
        SELECT
          id,
          propriedade_id
        FROM produtos
        WHERE id = ?
        `
      )
      .get(produto_id);

    if (!produto) {
      return res.status(400).json({
        error:
          "Produto informado não existe",
      });
    }

    // REGRA PRINCIPAL:
    // mesmo na edição, a propriedade deve
    // pertencer ao produto escolhido.
    if (
      Number(propriedade_id) !==
      Number(produto.propriedade_id)
    ) {
      return res.status(400).json({
        error:
          "A propriedade selecionada não pertence ao produto informado",
      });
    }

    // Confirma que a propriedade existe
    const propriedade = db
      .prepare(
        `
        SELECT id
        FROM propriedades
        WHERE id = ?
        `
      )
      .get(propriedade_id);

    if (!propriedade) {
      return res.status(400).json({
        error:
          "Propriedade informada não existe",
      });
    }

    // Calcula novamente o total
    const total =
      Number(quantidade) *
      Number(valor_unitario);

    const result = db
      .prepare(
        `
        UPDATE vendas
        SET
          produto_id = ?,
          quantidade = ?,
          valor_unitario = ?,
          total = ?,
          data = ?,
          cliente = ?,
          propriedade_id = ?
        WHERE id = ?
        `
      )
      .run(
        produto_id,
        quantidade,
        valor_unitario,
        total,
        data,
        cliente || "",
        propriedade_id,
        req.params.id
      );

    if (result.changes === 0) {
      return res.status(404).json({
        error: "Venda não encontrada",
      });
    }

    const atualizada = db
      .prepare(
        "SELECT * FROM vendas WHERE id = ?"
      )
      .get(req.params.id);

    res.json(atualizada);
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: "Erro ao atualizar venda",
    });
  }
});

// Remove uma venda
router.delete("/:id", (req, res) => {
  try {
    const result = db
      .prepare(
        "DELETE FROM vendas WHERE id = ?"
      )
      .run(req.params.id);

    if (result.changes === 0) {
      return res.status(404).json({
        error: "Venda não encontrada",
      });
    }

    res.status(204).send();
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: "Erro ao excluir venda",
    });
  }
});

module.exports = router;
