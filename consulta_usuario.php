<?php
require_once __DIR__ . '/php/auth.php';
exigirPerfil('master');

$tituloPagina = 'Consulta de Usuários';
$paginaAtual  = 'consulta';
require __DIR__ . '/php/header.php';
?>

<div class="wrap">
  <div class="page-hero">
    <span class="eyebrow"><span class="dot"></span>Administração</span>
    <h1>Consulta de usuários</h1>
    <p>Pesquise por qualquer trecho do nome para localizar usuários comuns cadastrados no sistema.</p>
  </div>

  <div class="toolbar">
    <div class="search-box">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>
      <input id="buscaUsuario" placeholder="Pesquisar por nome (ex: Ana, Carlos...)">
    </div>
    <a href="php/download_pdf.php" class="btn btn-outline btn-sm" target="_blank">
      <svg class="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3v12m0 0-4-4m4 4 4-4M4 21h16"/></svg>
      Baixar lista em PDF
    </a>
  </div>

  <div id="listaUsuarios" style="margin:20px 0 90px;"></div>
</div>

<script src="js/consulta.js"></script>
<?php require __DIR__ . '/php/footer.php'; ?>
