/**
 * app.js — Comportamentos globais compartilhados por todas as telas:
 * barra de acessibilidade (contraste + tamanho de fonte), menu mobile,
 * toasts e modais.
 */

/* ============================================================
   ACESSIBILIDADE (Desafio Plus 2.1 e 2.2)
   ============================================================ */
(function initAcessibilidade() {
  const CONTRASTE_KEY = 'petid_contraste_alto';
  const FONTE_KEY = 'petid_escala_fonte';

  function aplicarContraste(ativo) {
    document.body.classList.toggle('contraste-alto', ativo);
    localStorage.setItem(CONTRASTE_KEY, ativo ? '1' : '0');
  }

  function aplicarEscalaFonte(escala) {
    escala = Math.min(1.3, Math.max(0.85, escala));
    document.documentElement.style.setProperty('--font-scale', escala);
    localStorage.setItem(FONTE_KEY, String(escala));
    return escala;
  }

  document.addEventListener('DOMContentLoaded', () => {
    const contrasteSalvo = localStorage.getItem(CONTRASTE_KEY) === '1';
    aplicarContraste(contrasteSalvo);

    const fonteSalva = parseFloat(localStorage.getItem(FONTE_KEY)) || 1;
    aplicarEscalaFonte(fonteSalva);

    const btnContraste = document.getElementById('a11y-contraste');
    if (btnContraste) {
      btnContraste.addEventListener('click', () => {
        aplicarContraste(!document.body.classList.contains('contraste-alto'));
      });
    }

    const btnMais = document.getElementById('a11y-fonte-mais');
    const btnMenos = document.getElementById('a11y-fonte-menos');
    if (btnMais) {
      btnMais.addEventListener('click', () => {
        const atual = parseFloat(localStorage.getItem(FONTE_KEY)) || 1;
        aplicarEscalaFonte(atual + 0.1);
      });
    }
    if (btnMenos) {
      btnMenos.addEventListener('click', () => {
        const atual = parseFloat(localStorage.getItem(FONTE_KEY)) || 1;
        aplicarEscalaFonte(atual - 0.1);
      });
    }
  });
})();

/* ============================================================
   MENU MOBILE
   ============================================================ */
function toggleMobileMenu() {
  const menu = document.getElementById('mobileMenu');
  if (menu) menu.classList.toggle('open');
}

/* ============================================================
   TOASTS — feedback elegante (sem uso de alert())
   ============================================================ */
function garantirToastStack() {
  let stack = document.getElementById('toastStack');
  if (!stack) {
    stack = document.createElement('div');
    stack.id = 'toastStack';
    stack.className = 'toast-stack';
    document.body.appendChild(stack);
  }
  return stack;
}

function showToast(mensagem, tipo) {
  const stack = garantirToastStack();
  const t = document.createElement('div');
  t.className = 'toast' + (tipo === 'error' ? ' error' : tipo === 'success' ? ' success' : '');
  const icone = tipo === 'error' ? '⚠️' : '✅';
  t.innerHTML = icone + ' ' + mensagem;
  stack.appendChild(t);
  setTimeout(() => {
    t.style.opacity = '0';
    t.style.transition = 'opacity .3s';
    setTimeout(() => t.remove(), 300);
  }, 4200);
}

/* Exibe toasts vindos do PHP via atributo data-flash no body (flash messages) */
document.addEventListener('DOMContentLoaded', () => {
  const body = document.body;
  const flashMsg = body.dataset.flashMsg;
  const flashTipo = body.dataset.flashTipo;
  if (flashMsg) {
    showToast(flashMsg, flashTipo || 'success');
  }
});

/* ============================================================
   MODAL genérico de confirmação
   ============================================================ */
function abrirModalConfirmacao({ titulo, mensagem, textoConfirmar, perigoso, aoConfirmar }) {
  const overlay = document.getElementById('modalOverlay');
  const box = document.getElementById('modalContent');
  if (!overlay || !box) return;

  box.innerHTML = `
    <div class="modal-icon ${perigoso ? 'danger' : ''}">${perigoso ? '⚠️' : 'ℹ️'}</div>
    <h3>${titulo}</h3>
    <p>${mensagem}</p>
    <div class="modal-actions">
      <button class="btn btn-outline" id="modalCancelar">Cancelar</button>
      <button class="btn ${perigoso ? 'btn-danger' : 'btn-primary'}" id="modalConfirmar">${textoConfirmar || 'Confirmar'}</button>
    </div>
  `;
  overlay.classList.add('open');

  document.getElementById('modalCancelar').onclick = fecharModal;
  document.getElementById('modalConfirmar').onclick = () => {
    fecharModal();
    if (typeof aoConfirmar === 'function') aoConfirmar();
  };
}

function fecharModal() {
  const overlay = document.getElementById('modalOverlay');
  if (overlay) overlay.classList.remove('open');
}

document.addEventListener('click', (e) => {
  if (e.target && e.target.id === 'modalOverlay') fecharModal();
});
