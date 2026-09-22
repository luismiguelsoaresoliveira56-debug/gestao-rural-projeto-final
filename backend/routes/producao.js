const express = require("express");
const router = express.Router();
const db = require("../db");

//lista todos os registros de produção
router.get("/", (req, res) => {
  const registros = db
    .prepare(
      `SELECT
         producao.*,
         produtos.nome AS produto_nome,
         produtos.unidade AS produto_unidade
       FROM producao
       JOIN produtos ON produtos.id = producao.produto_id
       ORDER BY producao.data DESC`
    )
    .all();

  res.json(registros);
});

//busca um registro específico
router.get("/:id", (req, res) => {
  const registro = db
    .prepare(
      `SELECT
         producao.*,
         produtos.nome AS produto_nome,
         produtos.unidade AS produto_unidade
       FROM producao
       JOIN produtos ON produtos.id = producao.produto_id
       WHERE producao.id = ?`
    )
    .get(req.params.id);

  if (!registro) {
    return res.status(404).json({ error: "Registro de produção não encontrado" });
  }
  res.json(registro);
});

//registra uma nova produção
router.post("/", (req, res) => {
  const { produto_id, data, quantidade } = req.body;

  if (!produto_id || !data || quantidade === undefined) {
    return res
      .status(400)
      .json({ error: "Produto, data e quantidade são obrigatórios" });
  }

  if (quantidade <= 0) {
    return res.status(400).json({ error: "A quantidade deve ser maior que zero" });
  }

  const produto = db
    .prepare("SELECT id FROM produtos WHERE id = ?")
    .get(produto_id);

  if (!produto) {
    return res.status(400).json({ error: "Produto informado não existe" });
  }

  const result = db
    .prepare("INSERT INTO producao (produto_id, data, quantidade) VALUES (?, ?, ?)")
    .run(produto_id, data, quantidade);

  const novoRegistro = db
    .prepare("SELECT * FROM producao WHERE id = ?")
    .get(result.lastInsertRowid);

  res.status(201).json(novoRegistro);
});

//atualiza um registro de produção
router.put("/:id", (req, res) => {
  const { produto_id, data, quantidade } = req.body;

  if (!produto_id || !data || quantidade === undefined) {
    return res
      .status(400)
      .json({ error: "Produto, data e quantidade são obrigatórios" });
  }

  if (quantidade <= 0) {
    return res.status(400).json({ error: "A quantidade deve ser maior que zero" });
  }

  const produto = db
    .prepare("SELECT id FROM produtos WHERE id = ?")
    .get(produto_id);

  if (!produto) {
    return res.status(400).json({ error: "Produto informado não existe" });
  }

  const result = db
    .prepare("UPDATE producao SET produto_id = ?, data = ?, quantidade = ? WHERE id = ?")
    .run(produto_id, data, quantidade, req.params.id);

  if (result.changes === 0) {
    return res.status(404).json({ error: "Registro de produção não encontrado" });
  }

  const atualizado = db
    .prepare("SELECT * FROM producao WHERE id = ?")
    .get(req.params.id);

  res.json(atualizado);
});

//remove um registro de produção
router.delete("/:id", (req, res) => {
  const result = db
    .prepare("DELETE FROM producao WHERE id = ?")
    .run(req.params.id);

  if (result.changes === 0) {
    return res.status(404).json({ error: "Registro de produção não encontrado" });
  }

  res.status(204).send();
});

module.exports = router;
