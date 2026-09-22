"use client";

import { useState, useEffect } from "react";

const API_PRODUCAO = "http://localhost:3001/api/producao";
const API_PRODUTOS = "http://localhost:3001/api/produtos";

export default function ProducaoPage() {
  const [registros, setRegistros] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [erro, setErro] = useState("");
  const [editandoId, setEditandoId] = useState(null);

  const [form, setForm] = useState({ produto_id: "", data: "", quantidade: "" });

  async function carregarRegistros() {
    try {
      const res = await fetch(API_PRODUCAO);
      const dados = await res.json();
      setRegistros(dados);
    } catch (err) {
      setErro("Não foi possível conectar à API. O back-end está rodando?");
    }
  }

  async function carregarProdutos() {
    try {
      const res = await fetch(API_PRODUTOS);
      const dados = await res.json();
      setProdutos(dados);
    } catch (err) {
      setErro("Não foi possível carregar os produtos.");
    }
  }

  useEffect(() => {
    carregarRegistros();
    carregarProdutos();
  }, []);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErro("");

    const payload = {
      produto_id: Number(form.produto_id),
      data: form.data,
      quantidade: Number(form.quantidade),
    };

    try {
      const url = editandoId ? `${API_PRODUCAO}/${editandoId}` : API_PRODUCAO;
      const method = editandoId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const dados = await res.json();

      if (!res.ok) {
        setErro(dados.error || "Erro ao salvar registro de produção");
        return;
      }

      setForm({ produto_id: "", data: "", quantidade: "" });
      setEditandoId(null);
      carregarRegistros();
    } catch (err) {
      setErro("Não foi possível conectar à API.");
    }
  }

  function iniciarEdicao(registro) {
    setEditandoId(registro.id);
    setForm({
      produto_id: registro.produto_id,
      data: registro.data,
      quantidade: registro.quantidade,
    });
  }

  function cancelarEdicao() {
    setEditandoId(null);
    setForm({ produto_id: "", data: "", quantidade: "" });
  }

  async function handleExcluir(id) {
    if (!confirm("Tem certeza que deseja excluir este registro?")) return;

    try {
      const res = await fetch(`${API_PRODUCAO}/${id}`, { method: "DELETE" });

      if (!res.ok) {
        const dados = await res.json();
        setErro(dados.error || "Erro ao excluir registro");
        return;
      }

      carregarRegistros();
    } catch (err) {
      setErro("Não foi possível conectar à API.");
    }
  }

  return (
    <div>
      <h1 className="mb-4">Produção</h1>

      {erro && <div className="alert alert-danger">{erro}</div>}

      {produtos.length === 0 && (
        <div className="alert alert-warning">
          Cadastre pelo menos um produto antes de registrar produção.
        </div>
      )}

      <div className="card mb-4">
        <div className="card-body">
          <h5 className="card-title">
            {editandoId ? "Editar registro" : "Novo registro de produção"}
          </h5>

          <form onSubmit={handleSubmit}>
            <div className="row g-3">
              <div className="col-md-5">
                <label className="form-label">Produto</label>
                <select
                  name="produto_id"
                  className="form-select"
                  value={form.produto_id}
                  onChange={handleChange}
                  required
                >
                  <option value="">Selecione...</option>
                  {produtos.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-md-4">
                <label className="form-label">Data</label>
                <input
                  type="date"
                  name="data"
                  className="form-control"
                  value={form.data}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-md-3">
                <label className="form-label">Quantidade</label>
                <input
                  type="number"
                  step="0.01"
                  name="quantidade"
                  className="form-control"
                  value={form.quantidade}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="mt-3">
              <button type="submit" className="btn btn-success me-2">
                {editandoId ? "Salvar alterações" : "Registrar"}
              </button>

              {editandoId && (
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={cancelarEdicao}
                >
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      <table className="table table-striped">
        <thead>
          <tr>
            <th>Produto</th>
            <th>Data</th>
            <th>Quantidade</th>
            <th style={{ width: "160px" }}>Ações</th>
          </tr>
        </thead>
        <tbody>
          {registros.length === 0 && (
            <tr>
              <td colSpan={4} className="text-center text-muted">
                Nenhuma produção registrada ainda.
              </td>
            </tr>
          )}

          {registros.map((registro) => (
            <tr key={registro.id}>
              <td>{registro.produto_nome}</td>
              <td>{registro.data}</td>
              <td>
                {registro.quantidade} {registro.produto_unidade}
              </td>
              <td>
                <button
                  className="btn btn-sm btn-outline-primary me-2"
                  onClick={() => iniciarEdicao(registro)}
                >
                  Editar
                </button>
                <button
                  className="btn btn-sm btn-outline-danger"
                  onClick={() => handleExcluir(registro.id)}
                >
                  Excluir
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
