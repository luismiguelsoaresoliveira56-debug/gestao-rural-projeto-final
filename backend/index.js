const express = require("express");
const cors = require("cors");

const propriedadesRoutes = require("./routes/propriedades");
const produtosRoutes = require("./routes/produtos");
const producaoRoutes = require("./routes/producao");
const despesasRoutes = require("./routes/despesas");
const vendasRoutes = require("./routes/vendas");
const painelRoutes = require("./routes/painel");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "API Raiz funcionando!" });
});

app.use("/api/propriedades", propriedadesRoutes);
app.use("/api/produtos", produtosRoutes);
app.use("/api/producao", producaoRoutes);
app.use("/api/despesas", despesasRoutes);
app.use("/api/vendas", vendasRoutes);
app.use("/api/painel", painelRoutes);

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:3001`);
});
