const express = require("express");
const router = express.Router();
const db = require("../db");

//soma das despesas agrupada por categoria
router.get("/resumo", (req, res) => {
  const resumo = db
    .prepare(
      `SELECT categoria, SUM(valor) AS total
       FROM despesas
       GROUP BY categoria
       ORDER BY total DESC`
    )
    .all();

  res.json(resumo);
});

//lista despesas (com filtro de  categoria())
router.get("/", (req, res) => {
  const { categoria } = req.query;

  if (categoria) {
    const filtradas = db
      .prepare("SELECT * FROM despesas WHERE categoria = ? ORDER BY data DESC")
      .all(categoria);
    return res.json(filtradas);
  }

  const despesas = db
    .prepare("SELECT * FROM despesas ORDER BY data DESC")
    .all();

  res.json(despesas);
});

//busca uma despesa específica
router.get("/:id", (req, res) => {
  const despesa = db
    .prepare("SELECT * FROM despesas WHERE id = ?")
    .get(req.params.id);

  if (!despesa) {
    return res.status(404).json({ error: "Despesa não encontrada" });
  }
  res.json(despesa);
});

//registra uma nova despesa
router.post("/", (req, res) => {
  const { descricao, categoria, valor, data, propriedade_id } = req.body;

  if (!descricao || !categoria || valor === undefined || !data || !propriedade_id) {
    return res.status(400).json({
      error: "Descrição, categoria, valor, data e propriedade são obrigatórios",
    });
  }

  if (valor <= 0) {
    return res.status(400).json({ error: "O valor deve ser maior que zero" });
  }

  const propriedade = db
    .prepare("SELECT id FROM propriedades WHERE id = ?")
    .get(propriedade_id);

  if (!propriedade) {
    return res.status(400).json({ error: "Propriedade informada não existe" });
  }

  const result = db
    .prepare(
      `INSERT INTO despesas (descricao, categoria, valor, data, propriedade_id)
       VALUES (?, ?, ?, ?, ?)`
    )
    .run(descricao, categoria, valor, data, propriedade_id);

  const nova = db
    .prepare("SELECT * FROM despesas WHERE id = ?")
    .get(result.lastInsertRowid);

  res.status(201).json(nova);
});

//atualiza uma despesa existente
router.put("/:id", (req, res) => {
  const { descricao, categoria, valor, data, propriedade_id } = req.body;

  if (!descricao || !categoria || valor === undefined || !data || !propriedade_id) {
    return res.status(400).json({
      error: "Descrição, categoria, valor, data e propriedade são obrigatórios",
    });
  }

  if (valor <= 0) {
    return res.status(400).json({ error: "O valor deve ser maior que zero" });
  }

  const propriedade = db
    .prepare("SELECT id FROM propriedades WHERE id = ?")
    .get(propriedade_id);

  if (!propriedade) {
    return res.status(400).json({ error: "Propriedade informada não existe" });
  }

  const result = db
    .prepare(
      `UPDATE despesas
       SET descricao = ?, categoria = ?, valor = ?, data = ?, propriedade_id = ?
       WHERE id = ?`
    )
    .run(descricao, categoria, valor, data, propriedade_id, req.params.id);

  if (result.changes === 0) {
    return res.status(404).json({ error: "Despesa não encontrada" });
  }

  const atualizada = db
    .prepare("SELECT * FROM despesas WHERE id = ?")
    .get(req.params.id);

  res.json(atualizada);
});

//remove uma despesa
router.delete("/:id", (req, res) => {
  const result = db
    .prepare("DELETE FROM despesas WHERE id = ?")
    .run(req.params.id);

  if (result.changes === 0) {
    return res.status(404).json({ error: "Despesa não encontrada" });
  }

  res.status(204).send();
});

module.exports = router;
