"use client";

import { useState, useEffect } from "react";

const API_PRODUTOS = "http://localhost:3001/api/produtos";
const API_PROPRIEDADES = "http://localhost:3001/api/propriedades";

export default function ProdutosPage() {
  const [produtos, setProdutos] = useState([]);
  const [propriedades, setPropriedades] = useState([]);
  const [erro, setErro] = useState("");
  const [editandoId, setEditandoId] = useState(null);

  const [form, setForm] = useState({ nome: "", unidade: "", propriedade_id: "" });

  async function carregarProdutos() {
    try {
      const res = await fetch(API_PRODUTOS);
      const dados = await res.json();
      setProdutos(dados);
    } catch (err) {
      setErro("Não foi possível conectar à API. O back-end está rodando?");
    }
  }

  async function carregarPropriedades() {
    try {
      const res = await fetch(API_PROPRIEDADES);
      const dados = await res.json();
      setPropriedades(dados);
    } catch (err) {
      setErro("Não foi possível carregar as propriedades.");
    }
  }

  useEffect(() => {
    carregarProdutos();
    carregarPropriedades();
  }, []);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErro("");

    const payload = {
      nome: form.nome,
      unidade: form.unidade,
      propriedade_id: Number(form.propriedade_id),
    };

    try {
      const url = editandoId ? `${API_PRODUTOS}/${editandoId}` : API_PRODUTOS;
      const method = editandoId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const dados = await res.json();

      if (!res.ok) {
        setErro(dados.error || "Erro ao salvar produto");
        return;
      }

      setForm({ nome: "", unidade: "", propriedade_id: "" });
      setEditandoId(null);
      carregarProdutos();
    } catch (err) {
      setErro("Não foi possível conectar à API.");
    }
  }

  function iniciarEdicao(produto) {
    setEditandoId(produto.id);
    setForm({
      nome: produto.nome,
      unidade: produto.unidade,
      propriedade_id: produto.propriedade_id,
    });
  }

  function cancelarEdicao() {
    setEditandoId(null);
    setForm({ nome: "", unidade: "", propriedade_id: "" });
  }

  async function handleExcluir(id) {
    if (!confirm("Tem certeza que deseja excluir este produto?")) return;

    try {
      const res = await fetch(`${API_PRODUTOS}/${id}`, { method: "DELETE" });

      if (!res.ok) {
        const dados = await res.json();
        setErro(dados.error || "Erro ao excluir produto");
        return;
      }

      carregarProdutos();
    } catch (err) {
      setErro("Não foi possível conectar à API.");
    }
  }

  // Traduz o propriedade_id (número) para o nome, na hora de exibir a tabela
  function nomePropriedade(id) {
    const p = propriedades.find((prop) => prop.id === id);
    return p ? p.nome : "—";
  }

  return (
    <div>
      <h1 className="mb-4">Produtos</h1>

      {erro && <div className="alert alert-danger">{erro}</div>}

      {propriedades.length === 0 && (
        <div className="alert alert-warning">
          Cadastre pelo menos uma propriedade antes de criar produtos.
        </div>
      )}

      <div className="card mb-4">
        <div className="card-body">
          <h5 className="card-title">
            {editandoId ? "Editar produto" : "Novo produto"}
          </h5>

          <form onSubmit={handleSubmit}>
            <div className="row g-3">
              <div className="col-md-4">
                <label className="form-label">Nome</label>
                <input
                  type="text"
                  name="nome"
                  className="form-control"
                  value={form.nome}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-md-3">
                <label className="form-label">Unidade</label>
                <input
                  type="text"
                  name="unidade"
                  className="form-control"
                  placeholder="ex: unidade, kg, dúzia"
                  value={form.unidade}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-md-5">
                <label className="form-label">Propriedade</label>
                <select
                  name="propriedade_id"
                  className="form-select"
                  value={form.propriedade_id}
                  onChange={handleChange}
                  required
                >
                  <option value="">Selecione...</option>
                  {propriedades.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nome}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-3">
              <button type="submit" className="btn btn-success me-2">
                {editandoId ? "Salvar alterações" : "Cadastrar"}
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
            <th>Nome</th>
            <th>Unidade</th>
            <th>Propriedade</th>
            <th style={{ width: "160px" }}>Ações</th>
          </tr>
        </thead>
        <tbody>
          {produtos.length === 0 && (
            <tr>
              <td colSpan={4} className="text-center text-muted">
                Nenhum produto cadastrado ainda.
              </td>
            </tr>
          )}

          {produtos.map((produto) => (
            <tr key={produto.id}>
              <td>{produto.nome}</td>
              <td>{produto.unidade}</td>
              <td>{nomePropriedade(produto.propriedade_id)}</td>
              <td>
                <button
                  className="btn btn-sm btn-outline-primary me-2"
                  onClick={() => iniciarEdicao(produto)}
                >
                  Editar
                </button>
                <button
                  className="btn btn-sm btn-outline-danger"
                  onClick={() => handleExcluir(produto.id)}
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
