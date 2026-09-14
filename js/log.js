/**
 * log.js — Filtro de logs de autenticação por nome, CPF ou todos
 * (Tela de Log — acesso exclusivo do perfil master).
 */

let filtroAtual = 'todos';
let timeoutLog = null;

function iniciarTelaLog() {
  const area = document.getElementById('listaLogs');
  if (!area) return;

  carregarLogs('');

  const input = document.getElementById('buscaLog');
  if (input) {
    input.addEventListener('input', () => {
      clearTimeout(timeoutLog);
      timeoutLog = setTimeout(() => carregarLogs(input.value.trim()), 300);
    });
  }

  document.querySelectorAll('.chip[data-filtro]').forEach((chip) => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('.chip[data-filtro]').forEach((c) => c.classList.remove('active'));
      chip.classList.add('active');
      filtroAtual = chip.dataset.filtro;
      const inputBusca = document.getElementById('buscaLog');
      carregarLogs(inputBusca ? inputBusca.value.trim() : '');
    });
  });
}

async function carregarLogs(termo) {
  const area = document.getElementById('listaLogs');
  area.innerHTML = '<div class="skeleton-row"></div><div class="skeleton-row"></div><div class="skeleton-row"></div>';

  try {
    const resp = await fetch(`php/log_ajax.php?filtro=${encodeURIComponent(filtroAtual)}&termo=${encodeURIComponent(termo)}`);
    const dados = await resp.json();

    if (!dados.sucesso) {
      showToast(dados.mensagem || 'Erro ao consultar logs.', 'error');
      area.innerHTML = '';
      return;
    }

    renderizarLogs(dados.logs);
  } catch (e) {
    area.innerHTML = '';
    showToast('Não foi possível consultar os logs agora.', 'error');
  }
}

function renderizarLogs(logs) {
  const area = document.getElementById('listaLogs');

  if (logs.length === 0) {
    area.innerHTML = `
      <div class="empty-state">
        <div class="icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 8v4l3 3"/><circle cx="12" cy="12" r="9"/></svg>
        </div>
        <h3>Nenhum registro encontrado</h3>
        <p>Ajuste o filtro ou o termo de busca.</p>
      </div>`;
    return;
  }

  const linhas = logs.map((l) => `
    <tr>
      <td>${l.data_hora}</td>
      <td><b>${l.nome}</b></td>
      <td class="mono">${l.cpf}</td>
      <td>${l.segundo_fator}</td>
      <td>${l.sucesso == 1 ? '<span class="badge badge-ok">Sucesso</span>' : '<span class="badge badge-fail">Falha</span>'}</td>
    </tr>
  `).join('');

  area.innerHTML = `
    <div class="table-wrap">
      <table class="data-table">
        <thead>
          <tr><th>Dia e hora</th><th>Nome</th><th>CPF</th><th>2FA utilizado</th><th>Resultado</th></tr>
        </thead>
        <tbody>${linhas}</tbody>
      </table>
    </div>`;
}

document.addEventListener('DOMContentLoaded', iniciarTelaLog);
