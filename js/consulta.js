/**
 * consulta.js — Busca por substring e exclusão de usuários comuns
 * (Tela de Consulta de Usuário — acesso exclusivo do perfil master).
 */

let timeoutBusca = null;

function iniciarConsultaUsuarios() {
  const input = document.getElementById('buscaUsuario');
  const area = document.getElementById('listaUsuarios');
  if (!input || !area) return;

  carregarUsuarios('');

  input.addEventListener('input', () => {
    clearTimeout(timeoutBusca);
    timeoutBusca = setTimeout(() => carregarUsuarios(input.value.trim()), 300);
  });
}

async function carregarUsuarios(termo) {
  const area = document.getElementById('listaUsuarios');
  area.innerHTML = '<div class="skeleton-row"></div><div class="skeleton-row"></div><div class="skeleton-row"></div>';

  try {
    const resp = await fetch('php/consulta_ajax.php?acao=buscar&termo=' + encodeURIComponent(termo));
    const dados = await resp.json();

    if (!dados.sucesso) {
      showToast(dados.mensagem || 'Erro ao consultar usuários.', 'error');
      area.innerHTML = '';
      return;
    }

    renderizarTabela(dados.usuarios);
  } catch (e) {
    area.innerHTML = '';
    showToast('Não foi possível consultar os usuários agora.', 'error');
  }
}

function renderizarTabela(usuarios) {
  const area = document.getElementById('listaUsuarios');

  if (usuarios.length === 0) {
    area.innerHTML = `
      <div class="empty-state">
        <div class="icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>
        </div>
        <h3>Nenhum usuário encontrado</h3>
        <p>Tente pesquisar por outro trecho do nome.</p>
      </div>`;
    return;
  }

  const linhas = usuarios.map((u) => `
    <tr>
      <td><b>${u.nome}</b></td>
      <td class="mono">${u.login}</td>
      <td>${u.email}</td>
      <td class="mono">${u.cpf}</td>
      <td>${u.cidade || '—'} / ${u.uf || '—'}</td>
      <td>${u.criado_em}</td>
      <td>
        <button class="btn btn-danger btn-sm" onclick="confirmarExclusao(${u.id}, '${u.nome.replace(/'/g, "\\'")}')">Excluir</button>
      </td>
    </tr>
  `).join('');

  area.innerHTML = `
    <div class="table-wrap">
      <table class="data-table">
        <thead>
          <tr>
            <th>Nome</th><th>Login</th><th>E-mail</th><th>CPF</th><th>Cidade / UF</th><th>Cadastrado em</th><th>Ação</th>
          </tr>
        </thead>
        <tbody>${linhas}</tbody>
      </table>
    </div>`;
}

function confirmarExclusao(id, nome) {
  abrirModalConfirmacao({
    titulo: 'Excluir usuário?',
    mensagem: `Tem certeza que deseja excluir o usuário <b>${nome}</b>? Esta ação não pode ser desfeita.`,
    textoConfirmar: 'Sim, excluir',
    perigoso: true,
    aoConfirmar: () => excluirUsuario(id),
  });
}

async function excluirUsuario(id) {
  try {
    const resp = await fetch('php/consulta_ajax.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: 'acao=excluir&id=' + encodeURIComponent(id),
    });
    const dados = await resp.json();

    if (dados.sucesso) {
      showToast('Usuário excluído com sucesso.', 'success');
      const input = document.getElementById('buscaUsuario');
      carregarUsuarios(input ? input.value.trim() : '');
    } else {
      showToast(dados.mensagem || 'Não foi possível excluir o usuário.', 'error');
    }
  } catch (e) {
    showToast('Erro de comunicação ao excluir usuário.', 'error');
  }
}

document.addEventListener('DOMContentLoaded', iniciarConsultaUsuarios);
