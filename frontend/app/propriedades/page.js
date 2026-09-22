"use client";

import { useState, useEffect } from "react";

const API_URL = "http://localhost:3001/api/propriedades";

export default function PropriedadesPage() {
  const [propriedades, setPropriedades] = useState([]);
  const [erro, setErro] = useState("");
  const [editandoId, setEditandoId] = useState(null);

  // Estado do formulário (usado tanto para cadastrar quanto para editar)
  const [form, setForm] = useState({ nome: "", localizacao: "", area: "" });

  // Busca a lista de propriedades no back-end
  async function carregarPropriedades() {
    try {
      const res = await fetch(API_URL);
      const dados = await res.json();
      setPropriedades(dados);
    } catch (err) {
      setErro("Não foi possível conectar à API. O back-end está rodando?");
    }
  }

  // Roda uma única vez, quando a página é carregada
  useEffect(() => {
    carregarPropriedades();
  }, []);

  // Atualiza o estado do formulário conforme o usuário digita
  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  // Envia o formulário: cria uma nova propriedade OU atualiza uma existente
  async function handleSubmit(e) {
    e.preventDefault();
    setErro("");

    const payload = {
      nome: form.nome,
      localizacao: form.localizacao,
      area: Number(form.area),
    };

    try {
      const url = editandoId ? `${API_URL}/${editandoId}` : API_URL;
      const method = editandoId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const dados = await res.json();

      if (!res.ok) {
        setErro(dados.error || "Erro ao salvar propriedade");
        return;
      }

      // Limpa o formulário e recarrega a lista
      setForm({ nome: "", localizacao: "", area: "" });
      setEditandoId(null);
      carregarPropriedades();
    } catch (err) {
      setErro("Não foi possível conectar à API.");
    }
  }

  // Preenche o formulário com os dados de uma propriedade para editar
  function iniciarEdicao(propriedade) {
    setEditandoId(propriedade.id);
    setForm({
      nome: propriedade.nome,
      localizacao: propriedade.localizacao || "",
      area: propriedade.area,
    });
  }

  function cancelarEdicao() {
    setEditandoId(null);
    setForm({ nome: "", localizacao: "", area: "" });
  }

  // Exclui uma propriedade, com confirmação antes
  async function handleExcluir(id) {
    if (!confirm("Tem certeza que deseja excluir esta propriedade?")) return;

    try {
      const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });

      if (!res.ok) {
        const dados = await res.json();
        setErro(dados.error || "Erro ao excluir propriedade");
        return;
      }

      carregarPropriedades();
    } catch (err) {
      setErro("Não foi possível conectar à API.");
    }
  }

  return (
    <div>
      <h1 className="mb-4">Propriedades</h1>

      {erro && <div className="alert alert-danger">{erro}</div>}

      {/* Formulário de cadastro/edição */}
      <div className="card mb-4">
        <div className="card-body">
          <h5 className="card-title">
            {editandoId ? "Editar propriedade" : "Nova propriedade"}
          </h5>

          <form onSubmit={handleSubmit}>
            <div className="row g-3">
              <div className="col-md-5">
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

              <div className="col-md-4">
                <label className="form-label">Localização</label>
                <input
                  type="text"
                  name="localizacao"
                  className="form-control"
                  value={form.localizacao}
                  onChange={handleChange}
                />
              </div>

              <div className="col-md-3">
                <label className="form-label">Área (hectares)</label>
                <input
                  type="number"
                  step="0.01"
                  name="area"
                  className="form-control"
                  value={form.area}
                  onChange={handleChange}
                  required
                />
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

      {/* Lista de propriedades cadastradas */}
      <table className="table table-striped">
        <thead>
          <tr>
            <th>Nome</th>
            <th>Localização</th>
            <th>Área (ha)</th>
            <th style={{ width: "160px" }}>Ações</th>
          </tr>
        </thead>
        <tbody>
          {propriedades.length === 0 && (
            <tr>
              <td colSpan={4} className="text-center text-muted">
                Nenhuma propriedade cadastrada ainda.
              </td>
            </tr>
          )}

          {propriedades.map((p) => (
            <tr key={p.id}>
              <td>{p.nome}</td>
              <td>{p.localizacao || "-"}</td>
              <td>{p.area}</td>
              <td>
                <button
                  className="btn btn-sm btn-outline-primary me-2"
                  onClick={() => iniciarEdicao(p)}
                >
                  Editar
                </button>
                <button
                  className="btn btn-sm btn-outline-danger"
                  onClick={() => handleExcluir(p.id)}
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
