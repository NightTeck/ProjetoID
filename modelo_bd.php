<?php
require_once __DIR__ . '/php/auth.php';
exigirLogin();

$tituloPagina = 'Modelo do Banco de Dados';
$paginaAtual  = 'bd';
require __DIR__ . '/php/header.php';
?>

<div class="wrap">
  <div class="page-hero">
    <span class="eyebrow"><span class="dot"></span>Documentação técnica</span>
    <h1>Modelo do banco de dados</h1>
    <p>Modelagem Entidade-Relacionamento (DER) utilizada pelo sistema — tabelas <code>usuarios</code> e <code>logs_autenticacao</code>.</p>
  </div>

  <div class="card der-frame" style="margin:26px 0 90px;">
    <img src="assets/images/der-diagram.png" alt="Diagrama Entidade-Relacionamento do banco de dados petid_db">
  </div>
</div>

<?php require __DIR__ . '/php/footer.php'; ?>
