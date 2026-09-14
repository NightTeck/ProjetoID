<?php
require_once __DIR__ . '/php/auth.php';
exigirPerfil('master');

$tituloPagina = 'Log de Autenticação';
$paginaAtual  = 'log';
require __DIR__ . '/php/header.php';
?>

<div class="wrap">
  <div class="page-hero">
    <span class="eyebrow"><span class="dot"></span>Administração</span>
    <h1>Log de autenticação</h1>
    <p>Acompanhe as entradas dos usuários no sistema, com o segundo fator utilizado, em ordem cronológica decrescente.</p>
  </div>

  <div class="toolbar">
    <div class="search-box">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>
      <input id="buscaLog" placeholder="Pesquisar por nome ou CPF...">
    </div>
    <div class="chip-group">
      <button class="chip active" data-filtro="todos">Todos</button>
      <button class="chip" data-filtro="nome">Por nome</button>
      <button class="chip" data-filtro="cpf">Por CPF</button>
    </div>
  </div>

  <div id="listaLogs" style="margin:20px 0 90px;"></div>
</div>

<script src="js/log.js"></script>
<?php require __DIR__ . '/php/footer.php'; ?>
