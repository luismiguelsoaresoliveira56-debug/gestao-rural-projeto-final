const express = require("express");
const router = express.Router();
const db = require("../db");

//lista todas as propriedades
router.get("/", (req, res) => {
  const propriedades = db.prepare("SELECT * FROM propriedades").all();
  res.json(propriedades);
});

//busca uma propriedade específica
router.get("/:id", (req, res) => {
  const propriedade = db
    .prepare("SELECT * FROM propriedades WHERE id = ?")
    .get(req.params.id);

  if (!propriedade) {
    return res.status(404).json({ error: "Propriedade não encontrada" });
  }
  res.json(propriedade);
});

//cadastra uma nova propriedade
router.post("/", (req, res) => {
  const { nome, localizacao, area } = req.body;

  if (!nome || !area || area <= 0) {
    return res
      .status(400)
      .json({ error: "Nome e área (maior que zero) são obrigatórios" });
  }

  const result = db
    .prepare("INSERT INTO propriedades (nome, localizacao, area) VALUES (?, ?, ?)")
    .run(nome, localizacao, area);

  const nova = db
    .prepare("SELECT * FROM propriedades WHERE id = ?")
    .get(result.lastInsertRowid);

  res.status(201).json(nova);
});

//atualiza uma propriedade existente
router.put("/:id", (req, res) => {
  const { nome, localizacao, area } = req.body;

  if (!nome || !area || area <= 0) {
    return res
      .status(400)
      .json({ error: "Nome e área (maior que zero) são obrigatórios" });
  }

  const result = db
    .prepare("UPDATE propriedades SET nome = ?, localizacao = ?, area = ? WHERE id = ?")
    .run(nome, localizacao, area, req.params.id);

  if (result.changes === 0) {
    return res.status(404).json({ error: "Propriedade não encontrada" });
  }

  const atualizada = db
    .prepare("SELECT * FROM propriedades WHERE id = ?")
    .get(req.params.id);

  res.json(atualizada);
});

//remove uma propriedade
router.delete("/:id", (req, res) => {
  const result = db
    .prepare("DELETE FROM propriedades WHERE id = ?")
    .run(req.params.id);

  if (result.changes === 0) {
    return res.status(404).json({ error: "Propriedade não encontrada" });
  }

  res.status(204).send();
});

module.exports = router;
