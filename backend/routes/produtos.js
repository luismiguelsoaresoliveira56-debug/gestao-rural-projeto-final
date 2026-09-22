const express = require("express");
const router = express.Router();
const db = require("../db");

//lista todos os produtos
router.get("/", (req, res) => {
  const produtos = db.prepare("SELECT * FROM produtos").all();
  res.json(produtos);
});

//busca um produto específico
router.get("/:id", (req, res) => {
  const produto = db
    .prepare("SELECT * FROM produtos WHERE id = ?")
    .get(req.params.id);

  if (!produto) {
    return res.status(404).json({ error: "Produto não encontrado" });
  }
  res.json(produto);
});

//cadastra um novo produto
router.post("/", (req, res) => {
  const { nome, unidade, propriedade_id } = req.body;

  if (!nome || !unidade || !propriedade_id) {
    return res
      .status(400)
      .json({ error: "Nome, unidade e propriedade são obrigatórios" });
  }

  const propriedade = db
    .prepare("SELECT id FROM propriedades WHERE id = ?")
    .get(propriedade_id);

  if (!propriedade) {
    return res.status(400).json({ error: "Propriedade informada não existe" });
  }

  const result = db
    .prepare("INSERT INTO produtos (nome, unidade, propriedade_id) VALUES (?, ?, ?)")
    .run(nome, unidade, propriedade_id);

  const novo = db
    .prepare("SELECT * FROM produtos WHERE id = ?")
    .get(result.lastInsertRowid);

  res.status(201).json(novo);
});

//atualiza um produto existente
router.put("/:id", (req, res) => {
  const { nome, unidade, propriedade_id } = req.body;

  if (!nome || !unidade || !propriedade_id) {
    return res
      .status(400)
      .json({ error: "Nome, unidade e propriedade são obrigatórios" });
  }

  const propriedade = db
    .prepare("SELECT id FROM propriedades WHERE id = ?")
    .get(propriedade_id);

  if (!propriedade) {
    return res.status(400).json({ error: "Propriedade informada não existe" });
  }

  const result = db
    .prepare("UPDATE produtos SET nome = ?, unidade = ?, propriedade_id = ? WHERE id = ?")
    .run(nome, unidade, propriedade_id, req.params.id);

  if (result.changes === 0) {
    return res.status(404).json({ error: "Produto não encontrado" });
  }

  const atualizado = db
    .prepare("SELECT * FROM produtos WHERE id = ?")
    .get(req.params.id);

  res.json(atualizado);
});

//remove um produto
router.delete("/:id", (req, res) => {
  const temVendas = db
    .prepare("SELECT id FROM vendas WHERE produto_id = ?")
    .get(req.params.id);

  if (temVendas) {
    return res
      .status(400)
      .json({ error: "Não é possível excluir: produto possui vendas registradas" });
  }

  const result = db
    .prepare("DELETE FROM produtos WHERE id = ?")
    .run(req.params.id);

  if (result.changes === 0) {
    return res.status(404).json({ error: "Produto não encontrado" });
  }

  res.status(204).send();
});

module.exports = router;
