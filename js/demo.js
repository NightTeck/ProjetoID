/**
 * demo.js — Simula, inteiramente no navegador, o comportamento do back-end
 * PHP + MySQL (sessão de usuário, perfis master/comum, 2FA, CRUD de
 * usuários e log de autenticação), para que o site fique 100% clicável
 * sem precisar de servidor. A versão real (com PHP/MySQL de verdade) está
 * nos arquivos .php / sql/schema.sql deste mesmo projeto.
 */

/* ============================================================
   "BANCO DE DADOS" EM MEMÓRIA
   ============================================================ */
let USUARIOS = [
  {
    id: 1, nome: 'Administrador Master do Sistema', data_nascimento: '1990-01-01', sexo: 'Outro',
    nome_materno: 'Maria Aparecida Souza', cpf: '00000000000', email: 'admin@petid.app',
    telefone_celular: '(+55)21-999999999', telefone_fixo: '(+55)21-33334444', cep: '22000000',
    logradouro: 'Rua Central', numero: '1', complemento: 'Sala 1', bairro: 'Centro',
    cidade: 'Rio de Janeiro', uf: 'RJ', login: 'master', senha: 'master12', perfil: 'master',
    criado_em: '01/01/2026',
  },
  {
    id: 2, nome: 'Ana Beatriz Ferreira Lima', data_nascimento: '1995-04-12', sexo: 'Feminino',
    nome_materno: 'Carla Ferreira Lima', cpf: '44380755568', email: 'ana@email.com',
    telefone_celular: '(+55)21-988887777', telefone_fixo: '(+55)21-22223333', cep: '22041001',
    logradouro: 'Av. Nossa Senhora de Copacabana', numero: '500', complemento: 'Apto 302', bairro: 'Copacabana',
    cidade: 'Rio de Janeiro', uf: 'RJ', login: 'anabea', senha: 'oitoletr', perfil: 'comum',
    criado_em: '15/03/2026',
  },
  {
    id: 3, nome: 'Carlos Eduardo Souza Pinto', data_nascimento: '1988-09-23', sexo: 'Masculino',
    nome_materno: 'Regina Souza Pinto', cpf: '92467963810', email: 'carlos@email.com',
    telefone_celular: '(+55)21-977776666', telefone_fixo: '(+55)21-24445555', cep: '20040020',
    logradouro: 'Rua da Assembleia', numero: '77', complemento: '', bairro: 'Centro',
    cidade: 'Rio de Janeiro', uf: 'RJ', login: 'carlosp', senha: 'senhaoit', perfil: 'comum',
    criado_em: '02/06/2026',
  },
];

let LOGS = [
  { nome: 'Ana Beatriz Ferreira Lima', cpf: '44380755568', segundo_fator: 'Nome da mãe', sucesso: true, data_hora: '28/08/2026 09:14:02' },
  { nome: 'Carlos Eduardo Souza Pinto', cpf: '92467963810', segundo_fator: 'CEP do endereço', sucesso: false, data_hora: '27/08/2026 18:40:11' },
  { nome: 'Carlos Eduardo Souza Pinto', cpf: '92467963810', segundo_fator: 'Data de nascimento', sucesso: true, data_hora: '27/08/2026 18:41:03' },
  { nome: 'Administrador Master do Sistema', cpf: '00000000000', segundo_fator: 'Nome da mãe', sucesso: true, data_hora: '26/08/2026 08:02:47' },
];

/* ============================================================
   ESTADO DE SESSÃO (equivalente ao $_SESSION do PHP)
   ============================================================ */
let sessao = { autenticado: false, usuarioId: null };
let pendente2FA = null; // { usuarioId, chave, pergunta, tentativas }
let filtroLogAtual = 'todos';

function usuarioLogado() {
  return USUARIOS.find((u) => u.id === sessao.usuarioId) || null;
}

/* ============================================================
   ROTEADOR DE TELAS
   ============================================================ */
function go(view) {
  // guarda de acesso, igual exigirLogin()/exigirPerfil() do PHP
  // (a Tela Principal é pública — só as áreas internas exigem sessão)
  const protegidas = ['consulta', 'log', 'alterar-senha', 'modelo-bd'];
  if (protegidas.includes(view) && !sessao.autenticado) {
    showToast('Você precisa entrar na sua conta para acessar esta página.', 'error');
    view = 'login';
  }
  if (view === 'consulta' || view === 'log') {
    const u = usuarioLogado();
    if (!u || u.perfil !== 'master') {
      mostrarErro('Você não tem permissão para acessar esta página.', 'home');
      view = 'erro';
    }
  }
  if (view === 'alterar-senha') {
    const u = usuarioLogado();
    if (!u || u.perfil !== 'comum') {
      mostrarErro('Somente usuários comuns podem alterar a própria senha por aqui.', 'home');
      view = 'erro';
    }
  }

  document.querySelectorAll('.view').forEach((v) => v.classList.remove('active'));
  document.getElementById('view-' + view).classList.add('active');
  window.scrollTo({ top: 0 });
  renderTopbar();

  if (view === 'home') renderHome();
  if (view === 'consulta') renderConsulta();
  if (view === 'log') renderLog();
}

function mostrarErro(mensagem, voltarPara) {
  document.getElementById('erroMensagemTexto').textContent = mensagem;
  document.getElementById('btnErroVoltar').setAttribute('onclick', `go('${voltarPara}')`);
}

/* ============================================================
   TOPBAR DINÂMICA (conforme sessão/perfil)
   ============================================================ */
function renderTopbar() {
  const inner = document.getElementById('topbarInner');
  const mobile = document.getElementById('mobileMenu');
  const logado = sessao.autenticado;
  const u = usuarioLogado();

  const logoHtml = `
    <a href="javascript:void(0)" onclick="go('home')" class="brand">
      <span class="brand-mark"><svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2 4 6v6c0 5 3.4 8.4 8 10 4.6-1.6 8-5 8-10V6l-8-4Z"/><circle cx="9.5" cy="10.5" r="1"/><circle cx="14.5" cy="10.5" r="1"/><path d="M9 14.5c.8.7 1.9.7 3 0"/></svg></span>
      PetID
    </a>`;

  let menuLinks = '';
  let mobileLinks = '';

  if (logado) {
    menuLinks += `<a href="javascript:void(0)" onclick="go('home')">Início</a>`;
    menuLinks += `<a href="javascript:void(0)" onclick="go('lost-list')">Pets perdidos</a>`;
    menuLinks += `<a href="javascript:void(0)" onclick="go('modelo-bd')">Modelo do BD</a>`;
    mobileLinks += `<a href="javascript:void(0)" onclick="go('home');toggleMobileMenu()">Início</a>`;
    mobileLinks += `<a href="javascript:void(0)" onclick="go('lost-list');toggleMobileMenu()">Pets perdidos</a>`;
    mobileLinks += `<a href="javascript:void(0)" onclick="go('modelo-bd');toggleMobileMenu()">Modelo do BD</a>`;
    if (u.perfil === 'master') {
      menuLinks += `<a href="javascript:void(0)" onclick="go('consulta')">Consulta de Usuários</a>`;
      menuLinks += `<a href="javascript:void(0)" onclick="go('log')">Log</a>`;
      mobileLinks += `<a href="javascript:void(0)" onclick="go('consulta');toggleMobileMenu()">Consulta de Usuários</a>`;
      mobileLinks += `<a href="javascript:void(0)" onclick="go('log');toggleMobileMenu()">Log</a>`;
    } else {
      menuLinks += `<a href="javascript:void(0)" onclick="go('alterar-senha')">Alterar Senha</a>`;
      mobileLinks += `<a href="javascript:void(0)" onclick="go('alterar-senha');toggleMobileMenu()">Alterar Senha</a>`;
    }
  } else {
    menuLinks += `<a href="javascript:void(0)" onclick="go('home')">Início</a>`;
    menuLinks += `<a href="javascript:void(0)" onclick="go('lost-list')">Pets perdidos</a>`;
    mobileLinks += `<a href="javascript:void(0)" onclick="go('home');toggleMobileMenu()">Início</a>`;
    mobileLinks += `<a href="javascript:void(0)" onclick="go('lost-list');toggleMobileMenu()">Pets perdidos</a>`;
  }

  let actionsHtml = '';
  if (logado) {
    actionsHtml = `
      <div class="user-chip">
        <span class="avatar">${u.login.charAt(0).toUpperCase()}</span>
        <span>${u.login}<br><span class="perfil-tag">${u.perfil}</span></span>
      </div>
      <a href="javascript:void(0)" class="btn btn-outline btn-sm" onclick="sair()">Sair</a>`;
    mobileLinks += `<a href="javascript:void(0)" onclick="sair();toggleMobileMenu()">Sair (${u.login})</a>`;
  } else {
    actionsHtml = `
      <a href="javascript:void(0)" class="btn btn-outline btn-sm" onclick="go('login')">Entrar</a>
      <a href="javascript:void(0)" class="btn btn-primary btn-sm" onclick="go('cadastro')">Cadastre-se</a>`;
    mobileLinks += `<a href="javascript:void(0)" onclick="go('cadastro');toggleMobileMenu()">Cadastre-se</a>`;
  }

  inner.innerHTML = `
    ${logoHtml}
    <nav class="menu">${menuLinks}</nav>
    <div class="topbar-actions">
      ${actionsHtml}
      <button class="hamburger" onclick="toggleMobileMenu()" aria-label="Menu"><span></span></button>
    </div>`;
  mobile.innerHTML = mobileLinks;
}

/* ============================================================
   HELPERS DE VALIDAÇÃO (equivalentes às regras do PHP)
   ============================================================ */
function somenteNumeros(v) { return (v || '').replace(/\D/g, ''); }

function validarCPF(cpfOriginal) {
  const cpf = somenteNumeros(cpfOriginal);
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;
  let soma = 0;
  for (let i = 0; i < 9; i++) soma += parseInt(cpf[i], 10) * (10 - i);
  let resto = (soma * 10) % 11; if (resto >= 10) resto = 0;
  if (resto !== parseInt(cpf[9], 10)) return false;
  soma = 0;
  for (let i = 0; i < 10; i++) soma += parseInt(cpf[i], 10) * (11 - i);
  resto = (soma * 10) % 11; if (resto >= 10) resto = 0;
  return resto === parseInt(cpf[10], 10);
}
function mascararCPF(v) {
  return somenteNumeros(v).slice(0, 11)
    .replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}
function mascararTelefone(v) {
  let n = somenteNumeros(v).replace(/^55/, '').slice(0, 11);
  let r = '(+55)';
  if (n.length > 0) r += n.slice(0, 2);
  if (n.length > 2) r += '-' + n.slice(2);
  return r;
}
function validarTelefone(v) { return /^\(\+55\)\d{2}-\d{8,9}$/.test(v); }
function mascararCEP(v) { return somenteNumeros(v).slice(0, 8).replace(/(\d{5})(\d)/, '$1-$2'); }
function validarNome(v) { const l = v.trim(); return l.length >= 15 && l.length <= 80 && /^[A-Za-zÀ-ÖØ-öø-ÿ\s]+$/.test(l); }
function validarLogin(v) { return /^[A-Za-z]{6}$/.test(v); }
function validarSenhaCampo(v) { return /^[A-Za-z]{8}$/.test(v); }
function validarEmailCampo(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }

function marcarInvalido(input, msg) {
  const field = input.closest('.field'); if (!field) return;
  field.classList.add('invalido');
  const erro = field.querySelector('.erro-msg'); if (erro && msg) erro.textContent = msg;
}
function marcarValido(input) { const f = input.closest('.field'); if (f) f.classList.remove('invalido'); }

/* ============================================================
   LOGIN
   ============================================================ */
function limparLogin() {
  document.getElementById('formLogin').reset();
  document.querySelectorAll('#view-login .field.invalido').forEach((f) => f.classList.remove('invalido'));
}

document.getElementById('formLogin').addEventListener('submit', (e) => {
  e.preventDefault();
  const loginInput = document.getElementById('loginUser');
  const senhaInput = document.getElementById('loginSenha');
  let valido = true;

  if (!loginInput.value.trim()) { marcarInvalido(loginInput); valido = false; } else marcarValido(loginInput);
  if (!senhaInput.value.trim()) { marcarInvalido(senhaInput); valido = false; } else marcarValido(senhaInput);
  if (!valido) { showToast('Preencha login e senha.', 'error'); return; }

  const usuario = USUARIOS.find((u) => u.login === loginInput.value.trim());
  if (!usuario || usuario.senha !== senhaInput.value) {
    mostrarErro('Login ou senha incorretos. Verifique seus dados e tente novamente.', 'login');
    document.getElementById('formLogin').reset();
    go('erro');
    return;
  }

  // login/senha corretos -> aciona 2FA
  const perguntas = [
    { chave: 'nome_materno', pergunta: 'Qual o nome da sua mãe?' },
    { chave: 'data_nascimento', pergunta: 'Qual a data do seu nascimento? (dd/mm/aaaa)' },
    { chave: 'cep', pergunta: 'Qual o CEP do seu endereço?' },
  ];
  const sorteada = perguntas[Math.floor(Math.random() * perguntas.length)];
  pendente2FA = { usuarioId: usuario.id, chave: sorteada.chave, pergunta: sorteada.pergunta, tentativas: 0 };

  document.getElementById('labelPergunta2FA').textContent = sorteada.pergunta;
  document.getElementById('tentativasRestantes').textContent = 'Tentativas restantes: 3';
  document.getElementById('form2FA').reset();
  document.querySelectorAll('#view-2fa .field.invalido').forEach((f) => f.classList.remove('invalido'));
  go('2fa');
});

/* ============================================================
   2FA
   ============================================================ */
function cancelar2FA() {
  pendente2FA = null;
  go('login');
}

function conferirResposta2FA(chave, resposta, usuario) {
  resposta = resposta.trim();
  if (chave === 'nome_materno') return resposta.toLowerCase() === usuario.nome_materno.toLowerCase();
  if (chave === 'data_nascimento') {
    const partes = resposta.split('/');
    if (partes.length === 3) {
      const iso = `${partes[2]}-${partes[1].padStart(2, '0')}-${partes[0].padStart(2, '0')}`;
      return iso === usuario.data_nascimento;
    }
    return resposta === usuario.data_nascimento;
  }
  if (chave === 'cep') return somenteNumeros(resposta) === usuario.cep;
  return false;
}

const rotulo2FA = { nome_materno: 'Nome da mãe', data_nascimento: 'Data de nascimento', cep: 'CEP do endereço' };

document.getElementById('form2FA').addEventListener('submit', (e) => {
  e.preventDefault();
  if (!pendente2FA) { go('login'); return; }

  const respostaInput = document.getElementById('resposta2FA');
  if (!respostaInput.value.trim()) {
    marcarInvalido(respostaInput);
    showToast('Informe a resposta para continuar.', 'error');
    return;
  }
  marcarValido(respostaInput);

  const usuario = USUARIOS.find((u) => u.id === pendente2FA.usuarioId);

  if (conferirResposta2FA(pendente2FA.chave, respostaInput.value, usuario)) {
    LOGS.unshift({ nome: usuario.nome, cpf: usuario.cpf, segundo_fator: rotulo2FA[pendente2FA.chave], sucesso: true, data_hora: agora() });
    sessao = { autenticado: true, usuarioId: usuario.id };
    pendente2FA = null;
    showToast(`Bem-vindo(a) de volta, ${usuario.nome}!`, 'success');
    go('home');
  } else {
    LOGS.unshift({ nome: usuario.nome, cpf: usuario.cpf, segundo_fator: rotulo2FA[pendente2FA.chave], sucesso: false, data_hora: agora() });
    pendente2FA.tentativas++;

    if (pendente2FA.tentativas >= 3) {
      pendente2FA = null;
      mostrarErro('3 tentativas sem sucesso! Favor realizar Login novamente.', 'login');
      go('erro');
    } else {
      marcarInvalido(respostaInput, 'Resposta incorreta.');
      document.getElementById('tentativasRestantes').textContent = `Tentativas restantes: ${3 - pendente2FA.tentativas}`;
      showToast(`Resposta incorreta. Tentativa ${pendente2FA.tentativas} de 3.`, 'error');
      respostaInput.value = '';
    }
  }
});

function agora() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

/* ============================================================
   LOGOUT
   ============================================================ */
function sair() {
  sessao = { autenticado: false, usuarioId: null };
  showToast('Sessão encerrada com sucesso. Até logo!', 'success');
  go('home');
}

/* ============================================================
   TELA PRINCIPAL
   ============================================================ */
function renderHome() {
  const u = usuarioLogado();
  const noteWrap = document.getElementById('sessionNoteWrap');
  const ctaSecundario = document.getElementById('homeCtaSecundario');
  const ctaBand = document.getElementById('homeCtaBand');

  if (!u) {
    // visitante não autenticado: home pública, chamando para criar identidade ou entrar
    noteWrap.style.display = 'none';
    ctaSecundario.textContent = 'Entrar';
    ctaSecundario.setAttribute('onclick', "go('login')");
    ctaBand.textContent = 'Criar identidade do meu pet';
    ctaBand.setAttribute('onclick', "go('cadastro')");
    return;
  }

  noteWrap.style.display = '';
  document.getElementById('homeUserNome').textContent = u.nome;
  document.getElementById('homeUserLogin').textContent = u.login;
  document.getElementById('homeUserPerfil').textContent = u.perfil;

  const destino = u.perfil === 'comum' ? 'alterar-senha' : 'consulta';
  const rotulo = u.perfil === 'comum' ? 'Minha conta' : 'Painel administrativo';
  const rotuloBand = u.perfil === 'comum' ? 'Gerenciar minha conta' : 'Ver usuários cadastrados';

  ctaSecundario.textContent = rotulo;
  ctaSecundario.setAttribute('onclick', `go('${destino}')`);
  ctaBand.textContent = rotuloBand;
  ctaBand.setAttribute('onclick', `go('${destino}')`);
}

/* ============================================================
   CADASTRO
   ============================================================ */
function limparCadastro() {
  document.getElementById('formCadastro').reset();
  document.querySelectorAll('#view-cadastro .field.invalido').forEach((f) => f.classList.remove('invalido'));
  showToast('Formulário limpo.', 'success');
}

document.getElementById('c-cpf').addEventListener('input', (e) => (e.target.value = mascararCPF(e.target.value)));
document.getElementById('c-celular').addEventListener('input', (e) => (e.target.value = mascararTelefone(e.target.value)));
document.getElementById('c-fixo').addEventListener('input', (e) => (e.target.value = mascararTelefone(e.target.value)));
document.getElementById('c-cep').addEventListener('input', (e) => (e.target.value = mascararCEP(e.target.value)));
document.getElementById('c-login').addEventListener('input', (e) => (e.target.value = e.target.value.replace(/[^A-Za-z]/g, '').slice(0, 6)));
document.getElementById('c-senha').addEventListener('input', (e) => (e.target.value = e.target.value.replace(/[^A-Za-z]/g, '').slice(0, 8)));
document.getElementById('c-confirma').addEventListener('input', (e) => (e.target.value = e.target.value.replace(/[^A-Za-z]/g, '').slice(0, 8)));

document.getElementById('c-cep').addEventListener('blur', async () => {
  const cep = somenteNumeros(document.getElementById('c-cep').value);
  const status = document.getElementById('cepStatus');
  if (cep.length !== 8) return;
  status.textContent = 'Buscando endereço...';
  try {
    const resp = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
    const dados = await resp.json();
    if (dados.erro) { status.textContent = 'CEP não encontrado. Preencha manualmente.'; return; }
    document.getElementById('c-logradouro').value = dados.logradouro || '';
    document.getElementById('c-bairro').value = dados.bairro || '';
    document.getElementById('c-cidade').value = dados.localidade || '';
    document.getElementById('c-uf').value = dados.uf || '';
    status.textContent = 'Endereço preenchido automaticamente.';
    document.getElementById('c-numero').focus();
  } catch (err) {
    status.textContent = 'Sem conexão com o serviço de CEP. Preencha manualmente.';
  }
});

document.getElementById('formCadastro').addEventListener('submit', (e) => {
  e.preventDefault();
  const campo = (id) => document.getElementById(id);
  let valido = true;

  const nome = campo('c-nome'), data = campo('c-data'), sexo = campo('c-sexo'), mae = campo('c-mae'),
    cpf = campo('c-cpf'), email = campo('c-email'), celular = campo('c-celular'), fixo = campo('c-fixo'),
    cep = campo('c-cep'), numero = campo('c-numero'), login = campo('c-login'), senha = campo('c-senha'),
    confirma = campo('c-confirma');

  const checar = (input, ok, msg) => { if (!ok) { marcarInvalido(input, msg); valido = false; } else marcarValido(input); };

  checar(nome, validarNome(nome.value));
  checar(data, !!data.value.trim());
  checar(sexo, !!sexo.value.trim());
  checar(mae, !!mae.value.trim());
  checar(cpf, validarCPF(cpf.value));
  checar(email, validarEmailCampo(email.value));
  checar(celular, validarTelefone(celular.value));
  checar(fixo, validarTelefone(fixo.value));
  checar(cep, /^\d{5}-\d{3}$/.test(cep.value));
  checar(numero, !!numero.value.trim());
  checar(login, validarLogin(login.value) && !USUARIOS.some((u) => u.login === login.value), 'Login inválido ou já em uso.');
  checar(senha, validarSenhaCampo(senha.value));
  checar(confirma, senha.value === confirma.value && validarSenhaCampo(confirma.value));

  if (!valido) {
    showToast('Revise os campos destacados em vermelho.', 'error');
    const primeiro = document.querySelector('#view-cadastro .field.invalido input, #view-cadastro .field.invalido select');
    if (primeiro) primeiro.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return;
  }

  if (USUARIOS.some((u) => u.cpf === somenteNumeros(cpf.value) || u.email === email.value)) {
    showToast('Já existe um usuário cadastrado com este CPF ou e-mail.', 'error');
    return;
  }

  const novoId = Math.max(...USUARIOS.map((u) => u.id)) + 1;
  const hoje = new Date();
  const pad = (n) => String(n).padStart(2, '0');

  USUARIOS.push({
    id: novoId, nome: nome.value.trim(), data_nascimento: data.value, sexo: sexo.value,
    nome_materno: mae.value.trim(), cpf: somenteNumeros(cpf.value), email: email.value.trim(),
    telefone_celular: celular.value, telefone_fixo: fixo.value, cep: somenteNumeros(cep.value),
    logradouro: campo('c-logradouro').value, numero: numero.value, complemento: campo('c-complemento').value,
    bairro: campo('c-bairro').value, cidade: campo('c-cidade').value, uf: campo('c-uf').value,
    login: login.value, senha: senha.value, perfil: 'comum',
    criado_em: `${pad(hoje.getDate())}/${pad(hoje.getMonth() + 1)}/${hoje.getFullYear()}`,
  });

  showToast('Cadastro realizado com sucesso! Faça login para continuar.', 'success');
  document.getElementById('formCadastro').reset();
  go('login');
});

/* ============================================================
   CONSULTA DE USUÁRIO (master)
   ============================================================ */
function renderConsulta() {
  const termo = (document.getElementById('buscaUsuario').value || '').trim().toLowerCase();
  const area = document.getElementById('listaUsuarios');
  const lista = USUARIOS.filter((u) => u.perfil === 'comum' && u.nome.toLowerCase().includes(termo))
    .sort((a, b) => a.nome.localeCompare(b.nome));

  if (lista.length === 0) {
    area.innerHTML = `
      <div class="empty-state">
        <div class="icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg></div>
        <h3>Nenhum usuário encontrado</h3>
        <p>Tente pesquisar por outro trecho do nome.</p>
      </div>`;
    return;
  }

  area.innerHTML = `
    <div class="table-wrap"><table class="data-table">
      <thead><tr><th>Nome</th><th>Login</th><th>E-mail</th><th>CPF</th><th>Cidade / UF</th><th>Cadastrado em</th><th>Ação</th></tr></thead>
      <tbody>
        ${lista.map((u) => `
          <tr>
            <td><b>${u.nome}</b></td>
            <td class="mono">${u.login}</td>
            <td>${u.email}</td>
            <td class="mono">${mascararCPF(u.cpf)}</td>
            <td>${u.cidade || '—'} / ${u.uf || '—'}</td>
            <td>${u.criado_em}</td>
            <td><button class="btn btn-danger btn-sm" onclick="confirmarExclusao(${u.id})">Excluir</button></td>
          </tr>`).join('')}
      </tbody>
    </table></div>`;
}

function confirmarExclusao(id) {
  const u = USUARIOS.find((x) => x.id === id);
  abrirModalConfirmacao({
    titulo: 'Excluir usuário?',
    mensagem: `Tem certeza que deseja excluir o usuário <b>${u.nome}</b>? Esta ação não pode ser desfeita.`,
    textoConfirmar: 'Sim, excluir',
    perigoso: true,
    aoConfirmar: () => {
      USUARIOS = USUARIOS.filter((x) => x.id !== id);
      showToast('Usuário excluído com sucesso.', 'success');
      renderConsulta();
    },
  });
}

function baixarListaPDF() {
  showToast('Gerando PDF... use a janela de impressão para salvar como PDF.', 'success');
  setTimeout(() => window.print(), 400);
}

/* ============================================================
   LOG (master)
   ============================================================ */
function setFiltroLog(filtro, botao) {
  filtroLogAtual = filtro;
  document.querySelectorAll('#view-log .chip').forEach((c) => c.classList.remove('active'));
  botao.classList.add('active');
  renderLog();
}

function renderLog() {
  const termo = (document.getElementById('buscaLog').value || '').trim().toLowerCase();
  const area = document.getElementById('listaLogs');

  let lista = LOGS.filter((l) => {
    if (!termo) return true;
    if (filtroLogAtual === 'cpf') return l.cpf.includes(somenteNumeros(termo));
    if (filtroLogAtual === 'nome') return l.nome.toLowerCase().includes(termo);
    return l.nome.toLowerCase().includes(termo) || l.cpf.includes(somenteNumeros(termo));
  });

  if (lista.length === 0) {
    area.innerHTML = `
      <div class="empty-state">
        <div class="icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 8v4l3 3"/><circle cx="12" cy="12" r="9"/></svg></div>
        <h3>Nenhum registro encontrado</h3>
        <p>Ajuste o filtro ou o termo de busca.</p>
      </div>`;
    return;
  }

  area.innerHTML = `
    <div class="table-wrap"><table class="data-table">
      <thead><tr><th>Dia e hora</th><th>Nome</th><th>CPF</th><th>2FA utilizado</th><th>Resultado</th></tr></thead>
      <tbody>
        ${lista.map((l) => `
          <tr>
            <td>${l.data_hora}</td>
            <td><b>${l.nome}</b></td>
            <td class="mono">${mascararCPF(l.cpf)}</td>
            <td>${l.segundo_fator}</td>
            <td>${l.sucesso ? '<span class="badge badge-ok">Sucesso</span>' : '<span class="badge badge-fail">Falha</span>'}</td>
          </tr>`).join('')}
      </tbody>
    </table></div>`;
}

/* ============================================================
   ALTERAR SENHA (comum)
   ============================================================ */
document.getElementById('novaSenha').addEventListener('input', (e) => (e.target.value = e.target.value.replace(/[^A-Za-z]/g, '').slice(0, 8)));
document.getElementById('confirmaNovaSenha').addEventListener('input', (e) => (e.target.value = e.target.value.replace(/[^A-Za-z]/g, '').slice(0, 8)));

document.getElementById('formAlterarSenha').addEventListener('submit', (e) => {
  e.preventDefault();
  const u = usuarioLogado();
  const atual = document.getElementById('senhaAtual');
  const nova = document.getElementById('novaSenha');
  const confirma = document.getElementById('confirmaNovaSenha');
  let valido = true;

  if (atual.value !== u.senha) { marcarInvalido(atual); valido = false; } else marcarValido(atual);
  if (!validarSenhaCampo(nova.value)) { marcarInvalido(nova); valido = false; } else marcarValido(nova);
  if (nova.value !== confirma.value) { marcarInvalido(confirma); valido = false; } else marcarValido(confirma);

  if (!valido) { showToast('Revise os campos destacados.', 'error'); return; }

  u.senha = nova.value;
  showToast('Senha alterada com sucesso!', 'success');
  document.getElementById('formAlterarSenha').reset();
});

/* ============================================================
   PETS PERDIDOS (extraído do originalPetid.html — página pública)
   ============================================================ */
const PETS_PUBLICOS = [
  { id: 'luna', code: 'PET-84921', name: 'Luna', species: 'Cão', breed: 'Golden Retriever', color: 'Dourado', traits: 'Mancha branca no peito, coleira azul', city: 'Rio de Janeiro - RJ', neighborhood: 'Copacabana', status: 'lost', photo: 'https://images.unsplash.com/photo-1633722715463-d30f4f325e24?q=80&w=800&auto=format&fit=crop', lastSeen: { local: 'Copacabana — Rio de Janeiro', date: '19/08/2026', time: '18:30', desc: 'Luna saiu correndo durante um susto com fogos de artifício. Estava sem coleira.' }, lat: 38, lng: 56 },
  { id: 'thor', code: 'PET-11024', name: 'Thor', species: 'Cão', breed: 'Bulldog Francês', color: 'Preto e branco', traits: 'Orelha esquerda caída, ronca bastante', city: 'Rio de Janeiro - RJ', neighborhood: 'Tijuca', status: 'lost', photo: 'https://images.unsplash.com/photo-1583512603805-3cc6b41f3edb?q=80&w=800&auto=format&fit=crop', lastSeen: { local: 'Praça Saens Peña — Tijuca', date: '18/08/2026', time: '07:15', desc: 'Fugiu pelo portão durante a entrega de encomenda.' }, lat: 22, lng: 30 },
  { id: 'nina', code: 'PET-55302', name: 'Nina', species: 'Gato', breed: 'Siamês', color: 'Creme com pontas escuras', traits: 'Olhos azuis, muito arisca com estranhos', city: 'Rio de Janeiro - RJ', neighborhood: 'Ipanema', status: 'lost', photo: 'https://images.unsplash.com/photo-1592194996308-7b43878e84a6?q=80&w=800&auto=format&fit=crop', lastSeen: { local: 'Rua Visconde de Pirajá — Ipanema', date: '17/08/2026', time: '21:00', desc: 'Escapou pela janela do apartamento térreo.' }, lat: 70, lng: 70 },
];

let filtrosPerdidos = { species: 'all', sort: 'recent' };

function setFiltroPerdido(chave, valor, botao) {
  filtrosPerdidos[chave] = valor;
  document.querySelectorAll(`.lost-filter-chip[data-f="${chave}"]`).forEach((b) => b.classList.toggle('active', b.dataset.v === valor));
  renderLostGrid();
}

function renderLostGrid() {
  const grid = document.getElementById('lostGrid');
  const empty = document.getElementById('lostEmpty');
  const q = (document.getElementById('lostSearch')?.value || '').toLowerCase();

  let lista = PETS_PUBLICOS.filter((p) => p.status === 'lost');
  if (filtrosPerdidos.species !== 'all') lista = lista.filter((p) => p.species === filtrosPerdidos.species);
  if (q) lista = lista.filter((p) => p.name.toLowerCase().includes(q) || p.city.toLowerCase().includes(q) || p.neighborhood.toLowerCase().includes(q));
  if (filtrosPerdidos.sort === 'near') lista = [...lista].sort((a, b) => a.lat - b.lat);

  grid.style.display = lista.length ? 'grid' : 'none';
  empty.style.display = lista.length ? 'none' : 'block';

  grid.innerHTML = lista.map((p) => `
    <div class="lost-card" onclick="goLostAlert('${p.id}')">
      <div class="ph">
        <img src="${p.photo}" alt="${p.name}">
        <span class="code-tag">${p.code}</span>
      </div>
      <div class="body">
        <div class="top-row">
          <b>${p.name} ${p.species === 'Cão' ? '🐶' : '🐱'}</b>
          <span class="badge-flame"><span class="dot"></span>Pet perdido</span>
        </div>
        <div class="breed">${p.breed}</div>
        <div class="meta-row">
          <span>📍 ${p.neighborhood} · ${p.city.split(' - ')[1] || ''}</span>
          <span>🕐 Visto em ${p.lastSeen?.date || '—'}</span>
        </div>
      </div>
    </div>
  `).join('');

  renderMapaPerdidos(lista);
}

function renderMapaPerdidos(lista) {
  const wrap = document.getElementById('lostMapMarkers');
  if (!wrap) return;
  wrap.innerHTML = lista.map((p) => `
    <div class="lost-marker" style="left:${p.lng}%; top:${p.lat}%;" onclick="abrirPopupMapa('${p.id}')">${p.species === 'Cão' ? '🐶' : '🐱'}</div>
  `).join('');
}

function abrirPopupMapa(id) {
  const p = PETS_PUBLICOS.find((x) => x.id === id);
  if (!p) return;
  const overlay = document.getElementById('modalOverlay');
  const box = document.getElementById('modalContent');
  box.innerHTML = `
    <img src="${p.photo}" alt="${p.name}" style="width:100%;height:130px;object-fit:cover;border-radius:16px;margin-bottom:12px;">
    <h3 style="font-family:'Fraunces',serif;">${p.name} ${p.species === 'Cão' ? '🐶' : '🐱'}</h3>
    <p style="font-size:12.5px;color:var(--ink-faint);margin:4px 0 14px;">${p.neighborhood} · Visto em ${p.lastSeen?.date}</p>
    <button class="btn btn-primary btn-block" onclick="fecharModal();goLostAlert('${p.id}')">Ver alerta</button>
  `;
  overlay.classList.add('open');
}

function goLostAlert(id) {
  const p = PETS_PUBLICOS.find((x) => x.id === id);
  const content = document.getElementById('lostAlertContent');

  if (!p) {
    content.innerHTML = `
      <div style="text-align:center;padding:80px 20px;">
        <p style="font-size:44px;margin-bottom:10px;">🐾</p>
        <p style="font-family:'Fraunces',serif;font-weight:600;font-size:19px;">Este alerta não está mais ativo</p>
        <p style="color:var(--ink-soft);font-size:13.5px;margin-top:4px;">O pet já foi encontrado ou o link é inválido.</p>
        <button class="btn btn-primary" style="margin-top:22px;" onclick="go('lost-list')">Ver outros pets perdidos</button>
      </div>`;
    go('lost-alert');
    return;
  }

  content.innerHTML = `
    <div style="text-align:center;margin-bottom:24px;">
      <span class="lost-hero-flag">🚨 PET PERDIDO</span>
      <h1 style="font-family:'Fraunces',serif;font-weight:600;font-size:clamp(26px,3.4vw,36px);margin-top:14px;">${p.name}</h1>
      <p style="color:var(--ink-soft);margin-top:4px;">Ajude a encontrar ${p.name.endsWith('a') ? 'a' : 'o'} ${p.name}</p>
    </div>
    <img src="${p.photo}" alt="${p.name}" style="width:100%;height:280px;object-fit:cover;border-radius:26px;margin-bottom:22px;">
    <div class="form-row" style="margin-bottom:16px;">
      <div class="info-cell"><span>Última localização</span><b>${p.lastSeen.local}</b></div>
      <div class="info-cell"><span>Última vez vista</span><b>${p.lastSeen.date} às ${p.lastSeen.time}</b></div>
    </div>
    <div class="card" style="padding:20px;margin-bottom:22px;">
      <span style="font-family:var(--font-mono);font-size:10.5px;text-transform:uppercase;color:var(--ink-faint);">Descrição</span>
      <p style="font-size:14px;margin-top:4px;line-height:1.6;">${p.lastSeen.desc}</p>
      <span style="font-family:var(--font-mono);font-size:10.5px;text-transform:uppercase;color:var(--ink-faint);display:block;margin-top:14px;">Raça / características</span>
      <p style="font-size:14px;margin-top:4px;">${p.breed} · ${p.traits}</p>
    </div>
    <div class="lost-map" style="height:190px;display:flex;align-items:center;justify-content:center;margin-bottom:22px;">
      <div class="lost-marker" style="left:${p.lng}%; top:${p.lat}%;">${p.species === 'Cão' ? '🐶' : '🐱'}</div>
      <span style="position:relative;z-index:1;background:rgba(255,255,255,.92);padding:6px 14px;border-radius:99px;font-size:12px;color:var(--ink-soft);">Mapa ilustrativo da região</span>
    </div>
    <div style="display:flex;gap:12px;flex-wrap:wrap;">
      <button class="btn" style="flex:1;background:var(--flame-500);color:#fff;border-radius:99px;padding:15px;" onclick="showToast('Obrigado! O tutor de ${p.name} foi notificado que alguém viu o pet.', 'success')">Eu vi este pet</button>
      <button class="btn btn-outline" style="flex:1;border-radius:99px;" onclick="showToast('Link do alerta copiado para compartilhar.', 'success')">Compartilhar alerta</button>
    </div>
  `;
  go('lost-alert');
}

function reportarPetPerdido() {
  if (!sessao.autenticado) {
    showToast('Você precisa entrar na sua conta para reportar seu pet como perdido.', 'error');
    go('login');
    return;
  }
  showToast('Em breve: reportar pets perdidos direto do seu painel.', 'success');
}

/* ============================================================
   INICIALIZAÇÃO
   ============================================================ */
renderTopbar();
renderHome();
renderLostGrid();
