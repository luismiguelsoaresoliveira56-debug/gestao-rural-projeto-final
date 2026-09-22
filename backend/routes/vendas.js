const express = require("express");
const router = express.Router();
const db = require("../db");

//lista todas as vendas com filtro
router.get("/", (req, res) => {
  const { produto_id } = req.query;

  const baseQuery = `
    SELECT
      vendas.*,
      produtos.nome AS produto_nome
    FROM vendas
    JOIN produtos ON produtos.id = vendas.produto_id
  `;

  if (produto_id) {
    const filtradas = db
      .prepare(`${baseQuery} WHERE vendas.produto_id = ? ORDER BY vendas.data DESC`)
      .all(produto_id);
    return res.json(filtradas);
  }

  const todas = db.prepare(`${baseQuery} ORDER BY vendas.data DESC`).all();
  res.json(todas);
});

//busca uma venda específica
router.get("/:id", (req, res) => {
  const venda = db
    .prepare(
      `SELECT
         vendas.*,
         produtos.nome AS produto_nome
       FROM vendas
       JOIN produtos ON produtos.id = vendas.produto_id
       WHERE vendas.id = ?`
    )
    .get(req.params.id);

  if (!venda) {
    return res.status(404).json({ error: "Venda não encontrada" });
  }
  res.json(venda);
});

//registra uma nova venda
router.post("/", (req, res) => {
  const { produto_id, quantidade, valor_unitario, data, cliente, propriedade_id } = req.body;

  if (!produto_id || quantidade === undefined || valor_unitario === undefined || !data || !propriedade_id) {
    return res.status(400).json({
      error: "Produto, quantidade, valor unitário, data e propriedade são obrigatórios",
    });
  }

  if (quantidade <= 0 || valor_unitario <= 0) {
    return res
      .status(400)
      .json({ error: "Quantidade e valor unitário devem ser maiores que zero" });
  }

  const produto = db
    .prepare("SELECT id FROM produtos WHERE id = ?")
    .get(produto_id);

  if (!produto) {
    return res.status(400).json({ error: "Produto informado não existe" });
  }

  const propriedade = db
    .prepare("SELECT id FROM propriedades WHERE id = ?")
    .get(propriedade_id);

  if (!propriedade) {
    return res.status(400).json({ error: "Propriedade informada não existe" });
  }

  //o total é sempre calculado aqui
  const total = quantidade * valor_unitario;

  const result = db
    .prepare(
      `INSERT INTO vendas (produto_id, quantidade, valor_unitario, total, data, cliente, propriedade_id)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    )
    .run(produto_id, quantidade, valor_unitario, total, data, cliente, propriedade_id);

  const nova = db
    .prepare("SELECT * FROM vendas WHERE id = ?")
    .get(result.lastInsertRowid);

  res.status(201).json(nova);
});

//atualiza uma venda existente
router.put("/:id", (req, res) => {
  const { produto_id, quantidade, valor_unitario, data, cliente, propriedade_id } = req.body;

  if (!produto_id || quantidade === undefined || valor_unitario === undefined || !data || !propriedade_id) {
    return res.status(400).json({
      error: "Produto, quantidade, valor unitário, data e propriedade são obrigatórios",
    });
  }

  if (quantidade <= 0 || valor_unitario <= 0) {
    return res
      .status(400)
      .json({ error: "Quantidade e valor unitário devem ser maiores que zero" });
  }

  const produto = db
    .prepare("SELECT id FROM produtos WHERE id = ?")
    .get(produto_id);

  if (!produto) {
    return res.status(400).json({ error: "Produto informado não existe" });
  }

  const total = quantidade * valor_unitario;

  const result = db
    .prepare(
      `UPDATE vendas
       SET produto_id = ?, quantidade = ?, valor_unitario = ?, total = ?, data = ?, cliente = ?, propriedade_id = ?
       WHERE id = ?`
    )
    .run(produto_id, quantidade, valor_unitario, total, data, cliente, propriedade_id, req.params.id);

  if (result.changes === 0) {
    return res.status(404).json({ error: "Venda não encontrada" });
  }

  const atualizada = db
    .prepare("SELECT * FROM vendas WHERE id = ?")
    .get(req.params.id);

  res.json(atualizada);
});

//remove uma venda
router.delete("/:id", (req, res) => {
  const result = db
    .prepare("DELETE FROM vendas WHERE id = ?")
    .run(req.params.id);

  if (result.changes === 0) {
    return res.status(404).json({ error: "Venda não encontrada" });
  }

  res.status(204).send();
});

module.exports = router;
