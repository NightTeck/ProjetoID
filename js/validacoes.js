/**
 * validacoes.js — Validações e máscaras de campo usadas nas telas de
 * Cadastro de Usuário, Login, 2FA e Alteração de Senha.
 * A validação real e definitiva sempre ocorre também no servidor (PHP).
 */

/* ============================================================
   HELPERS DE CAMPO
   ============================================================ */
function marcarInvalido(input, mensagem) {
  const field = input.closest('.field');
  if (!field) return;
  field.classList.add('invalido');
  const erroEl = field.querySelector('.erro-msg');
  if (erroEl) erroEl.textContent = mensagem;
}

function marcarValido(input) {
  const field = input.closest('.field');
  if (!field) return;
  field.classList.remove('invalido');
}

/* ============================================================
   VALIDAÇÃO DE CPF (dígito verificador)
   ============================================================ */
function somenteNumeros(valor) {
  return (valor || '').replace(/\D/g, '');
}

function validarCPF(cpfOriginal) {
  const cpf = somenteNumeros(cpfOriginal);
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;

  let soma = 0;
  for (let i = 0; i < 9; i++) soma += parseInt(cpf[i], 10) * (10 - i);
  let resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpf[9], 10)) return false;

  soma = 0;
  for (let i = 0; i < 10; i++) soma += parseInt(cpf[i], 10) * (11 - i);
  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpf[10], 10)) return false;

  return true;
}

function mascararCPF(valor) {
  const v = somenteNumeros(valor).slice(0, 11);
  return v
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

/* ============================================================
   MÁSCARA DE TELEFONE: (+55)XX-XXXXXXXX
   ============================================================ */
function mascararTelefone(valor) {
  let v = somenteNumeros(valor);
  v = v.replace(/^55/, ''); // remove DDI se o usuário digitar
  v = v.slice(0, 11);
  let resultado = '(+55)';
  if (v.length > 0) resultado += v.slice(0, 2);
  if (v.length > 2) resultado += '-' + v.slice(2);
  return resultado;
}

function validarTelefone(valor) {
  return /^\(\+55\)\d{2}-\d{8,9}$/.test(valor);
}

/* ============================================================
   MÁSCARA DE CEP: 00000-000
   ============================================================ */
function mascararCEP(valor) {
  const v = somenteNumeros(valor).slice(0, 8);
  return v.replace(/(\d{5})(\d)/, '$1-$2');
}

/* ============================================================
   AUTOCOMPLETAR ENDEREÇO VIA CEP (ViaCEP)
   ============================================================ */
async function buscarEnderecoPorCEP(cep, campos) {
  const cepLimpo = somenteNumeros(cep);
  if (cepLimpo.length !== 8) return;

  campos.status && (campos.status.textContent = 'Buscando endereço...');

  try {
    const resp = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
    if (!resp.ok) throw new Error('Falha na consulta');
    const dados = await resp.json();

    if (dados.erro) {
      campos.status && (campos.status.textContent = 'CEP não encontrado. Preencha o endereço manualmente.');
      liberarCamposManual(campos);
      return;
    }

    if (campos.logradouro) campos.logradouro.value = dados.logradouro || '';
    if (campos.bairro) campos.bairro.value = dados.bairro || '';
    if (campos.cidade) campos.cidade.value = dados.localidade || '';
    if (campos.uf) campos.uf.value = dados.uf || '';
    campos.status && (campos.status.textContent = 'Endereço preenchido automaticamente.');
    campos.numero && campos.numero.focus();
  } catch (erro) {
    campos.status && (campos.status.textContent = 'Sem conexão com o serviço de CEP. Preencha o endereço manualmente.');
    liberarCamposManual(campos);
  }
}

function liberarCamposManual(campos) {
  ['logradouro', 'bairro', 'cidade', 'uf'].forEach((k) => {
    if (campos[k]) campos[k].readOnly = false;
  });
}

/* ============================================================
   OUTRAS VALIDAÇÕES DE CAMPO
   ============================================================ */
function validarNome(nome) {
  const limpo = nome.trim();
  return limpo.length >= 15 && limpo.length <= 80 && /^[A-Za-zÀ-ÖØ-öø-ÿ\s]+$/.test(limpo);
}

function validarLoginCampo(login) {
  return /^[A-Za-z]{6}$/.test(login);
}

function validarSenhaCampo(senha) {
  return /^[A-Za-z]{8}$/.test(senha);
}

function validarEmailCampo(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/* ============================================================
   INICIALIZAÇÃO — TELA DE CADASTRO
   ============================================================ */
function initFormularioCadastro() {
  const form = document.getElementById('formCadastro');
  if (!form) return;

  const nome = form.querySelector('#nome');
  const cpf = form.querySelector('#cpf');
  const celular = form.querySelector('#telefone_celular');
  const fixo = form.querySelector('#telefone_fixo');
  const cep = form.querySelector('#cep');
  const login = form.querySelector('#login');
  const senha = form.querySelector('#senha');
  const confirmaSenha = form.querySelector('#confirma_senha');
  const email = form.querySelector('#email');

  const campos = {
    logradouro: form.querySelector('#logradouro'),
    bairro: form.querySelector('#bairro'),
    cidade: form.querySelector('#cidade'),
    uf: form.querySelector('#uf'),
    numero: form.querySelector('#numero'),
    status: form.querySelector('#cepStatus'),
  };

  cpf.addEventListener('input', () => (cpf.value = mascararCPF(cpf.value)));
  celular.addEventListener('input', () => (celular.value = mascararTelefone(celular.value)));
  fixo.addEventListener('input', () => (fixo.value = mascararTelefone(fixo.value)));
  login.addEventListener('input', () => (login.value = login.value.replace(/[^A-Za-z]/g, '').slice(0, 6)));
  senha.addEventListener('input', () => (senha.value = senha.value.replace(/[^A-Za-z]/g, '').slice(0, 8)));
  confirmaSenha.addEventListener('input', () => (confirmaSenha.value = confirmaSenha.value.replace(/[^A-Za-z]/g, '').slice(0, 8)));

  cep.addEventListener('input', () => (cep.value = mascararCEP(cep.value)));
  cep.addEventListener('blur', () => buscarEnderecoPorCEP(cep.value, campos));

  form.addEventListener('submit', (e) => {
    let valido = true;

    if (!validarNome(nome.value)) {
      marcarInvalido(nome, 'Informe entre 15 e 80 caracteres, apenas letras.');
      valido = false;
    } else marcarValido(nome);

    if (!validarCPF(cpf.value)) {
      marcarInvalido(cpf, 'CPF inválido. Confira os dígitos.');
      valido = false;
    } else marcarValido(cpf);

    if (!validarEmailCampo(email.value)) {
      marcarInvalido(email, 'Informe um e-mail válido.');
      valido = false;
    } else marcarValido(email);

    if (!validarTelefone(celular.value)) {
      marcarInvalido(celular, 'Formato esperado: (+55)XX-XXXXXXXXX');
      valido = false;
    } else marcarValido(celular);

    if (!validarTelefone(fixo.value)) {
      marcarInvalido(fixo, 'Formato esperado: (+55)XX-XXXXXXXX');
      valido = false;
    } else marcarValido(fixo);

    if (!/^\d{5}-\d{3}$/.test(cep.value)) {
      marcarInvalido(cep, 'CEP inválido.');
      valido = false;
    } else marcarValido(cep);

    if (!validarLoginCampo(login.value)) {
      marcarInvalido(login, 'O login deve ter exatamente 6 letras.');
      valido = false;
    } else marcarValido(login);

    if (!validarSenhaCampo(senha.value)) {
      marcarInvalido(senha, 'A senha deve ter exatamente 8 letras.');
      valido = false;
    } else marcarValido(senha);

    if (senha.value !== confirmaSenha.value || !validarSenhaCampo(confirmaSenha.value)) {
      marcarInvalido(confirmaSenha, 'As senhas não coincidem.');
      valido = false;
    } else marcarValido(confirmaSenha);

    ['data_nascimento', 'sexo', 'nome_materno', 'numero'].forEach((id) => {
      const el = form.querySelector('#' + id);
      if (el && !el.value.trim()) {
        marcarInvalido(el, 'Campo obrigatório.');
        valido = false;
      } else if (el) marcarValido(el);
    });

    if (!valido) {
      e.preventDefault();
      showToast('Revise os campos destacados em vermelho.', 'error');
      const primeiroInvalido = form.querySelector('.field.invalido input, .field.invalido select');
      if (primeiroInvalido) primeiroInvalido.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  });

  const btnLimpar = form.querySelector('#btnLimparCadastro');
  if (btnLimpar) {
    btnLimpar.addEventListener('click', () => {
      form.reset();
      form.querySelectorAll('.field.invalido').forEach((f) => f.classList.remove('invalido'));
      liberarCamposManual(campos);
      showToast('Formulário limpo.', 'success');
    });
  }
}

/* ============================================================
   INICIALIZAÇÃO — TELA DE LOGIN
   ============================================================ */
function initFormularioLogin() {
  const form = document.getElementById('formLogin');
  if (!form) return;

  const login = form.querySelector('#login');
  const senha = form.querySelector('#senha');

  form.addEventListener('submit', (e) => {
    let valido = true;
    if (!login.value.trim()) {
      marcarInvalido(login, 'Informe o login.');
      valido = false;
    } else marcarValido(login);

    if (!senha.value.trim()) {
      marcarInvalido(senha, 'Informe a senha.');
      valido = false;
    } else marcarValido(senha);

    if (!valido) {
      e.preventDefault();
      showToast('Preencha login e senha.', 'error');
    }
  });

  const btnLimpar = form.querySelector('#btnLimparLogin');
  if (btnLimpar) {
    btnLimpar.addEventListener('click', () => {
      form.reset();
      form.querySelectorAll('.field.invalido').forEach((f) => f.classList.remove('invalido'));
    });
  }
}

/* ============================================================
   INICIALIZAÇÃO — TELA DE ALTERAÇÃO DE SENHA
   ============================================================ */
function initFormularioAlterarSenha() {
  const form = document.getElementById('formAlterarSenha');
  if (!form) return;

  const novaSenha = form.querySelector('#nova_senha');
  const confirmaSenha = form.querySelector('#confirma_nova_senha');

  novaSenha.addEventListener('input', () => (novaSenha.value = novaSenha.value.replace(/[^A-Za-z]/g, '').slice(0, 8)));
  confirmaSenha.addEventListener('input', () => (confirmaSenha.value = confirmaSenha.value.replace(/[^A-Za-z]/g, '').slice(0, 8)));

  form.addEventListener('submit', (e) => {
    let valido = true;

    if (!validarSenhaCampo(novaSenha.value)) {
      marcarInvalido(novaSenha, 'A senha deve ter exatamente 8 letras.');
      valido = false;
    } else marcarValido(novaSenha);

    if (novaSenha.value !== confirmaSenha.value) {
      marcarInvalido(confirmaSenha, 'As senhas não coincidem.');
      valido = false;
    } else marcarValido(confirmaSenha);

    if (!valido) {
      e.preventDefault();
      showToast('Revise os campos destacados.', 'error');
    }
  });
}

/* ============================================================
   INICIALIZAÇÃO — TELA 2FA
   ============================================================ */
function initFormulario2FA() {
  const form = document.getElementById('form2FA');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    const resposta = form.querySelector('#resposta');
    if (!resposta.value.trim()) {
      marcarInvalido(resposta, 'A resposta é obrigatória.');
      e.preventDefault();
      showToast('Informe a resposta para continuar.', 'error');
    } else {
      marcarValido(resposta);
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initFormularioCadastro();
  initFormularioLogin();
  initFormularioAlterarSenha();
  initFormulario2FA();
});
