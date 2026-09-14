<?php
/**
 * Cabeçalho compartilhado por todas as telas.
 * Espera (opcionalmente) que a página defina antes do include:
 *   $tituloPagina  (string) — título da aba do navegador
 *   $paginaAtual   (string) — chave do menu ativo: inicio|consulta|log|senha|bd
 * E que auth.php já tenha sido incluído.
 */
$tituloPagina = $tituloPagina ?? 'PetID';
$paginaAtual  = $paginaAtual ?? '';
$logado       = function_exists('estaAutenticado') && estaAutenticado();
$perfil       = $logado ? perfilAtual() : null;

$flashMsg  = $_SESSION['flash_msg']  ?? '';
$flashTipo = $_SESSION['flash_tipo'] ?? 'success';
unset($_SESSION['flash_msg'], $_SESSION['flash_tipo']);
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title><?= htmlspecialchars($tituloPagina) ?> — PetID</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=IBM+Plex+Mono:wght@400;500;600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="css/styles.css">
</head>
<body data-flash-msg="<?= htmlspecialchars($flashMsg) ?>" data-flash-tipo="<?= htmlspecialchars($flashTipo) ?>">

<!-- ============ BARRA DE ACESSIBILIDADE (Desafio Plus) ============ -->
<div class="a11y-bar">
  <div class="a11y-inner">
    <div class="a11y-group">
      <span class="a11y-label">Fonte</span>
      <button class="a11y-btn" id="a11y-fonte-menos" title="Diminuir fonte" aria-label="Diminuir fonte">A-</button>
      <button class="a11y-btn" id="a11y-fonte-mais" title="Aumentar fonte" aria-label="Aumentar fonte">A+</button>
    </div>
    <div class="a11y-group">
      <button class="a11y-btn" id="a11y-contraste" title="Alternar contraste" aria-label="Alternar alto contraste">◐</button>
      <span class="a11y-label">Contraste</span>
    </div>
  </div>
</div>

<!-- ============ TOPBAR ============ -->
<header class="topbar">
  <div class="topbar-inner">
    <a href="index.php" class="brand">
      <span class="brand-mark">
        <svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2 4 6v6c0 5 3.4 8.4 8 10 4.6-1.6 8-5 8-10V6l-8-4Z"/><circle cx="9.5" cy="10.5" r="1"/><circle cx="14.5" cy="10.5" r="1"/><path d="M9 14.5c.8.7 1.9.7 3 0"/></svg>
      </span>
      PetID
    </a>

    <?php if ($logado): ?>
    <nav class="menu">
      <a href="index.php" class="<?= $paginaAtual === 'inicio' ? 'active' : '' ?>">Início</a>
      <a href="modelo_bd.php" class="<?= $paginaAtual === 'bd' ? 'active' : '' ?>">Modelo do BD</a>
      <?php if ($perfil === 'master'): ?>
        <a href="consulta_usuario.php" class="<?= $paginaAtual === 'consulta' ? 'active' : '' ?>">Consulta de Usuários</a>
        <a href="log.php" class="<?= $paginaAtual === 'log' ? 'active' : '' ?>">Log</a>
      <?php else: ?>
        <a href="alterar_senha.php" class="<?= $paginaAtual === 'senha' ? 'active' : '' ?>">Alterar Senha</a>
      <?php endif; ?>
    </nav>
    <?php else: ?>
    <nav class="menu">
      <a href="index.php">Início</a>
    </nav>
    <?php endif; ?>

    <div class="topbar-actions">
      <?php if ($logado): ?>
        <div class="user-chip">
          <span class="avatar"><?= strtoupper(substr($_SESSION['login'] ?? '?', 0, 1)) ?></span>
          <span><?= htmlspecialchars($_SESSION['login'] ?? '') ?><br><span class="perfil-tag"><?= htmlspecialchars($perfil) ?></span></span>
        </div>
        <a href="logout.php" class="btn btn-outline btn-sm">Sair</a>
      <?php else: ?>
        <a href="login.php" class="btn btn-outline btn-sm">Entrar</a>
        <a href="cadastro.php" class="btn btn-primary btn-sm">Cadastre-se</a>
      <?php endif; ?>
      <button class="hamburger" onclick="toggleMobileMenu()" aria-label="Menu"><span></span></button>
    </div>
  </div>

  <div class="mobile-menu" id="mobileMenu">
    <a href="index.php">Início</a>
    <?php if ($logado): ?>
      <a href="modelo_bd.php">Modelo do BD</a>
      <?php if ($perfil === 'master'): ?>
        <a href="consulta_usuario.php">Consulta de Usuários</a>
        <a href="log.php">Log</a>
      <?php else: ?>
        <a href="alterar_senha.php">Alterar Senha</a>
      <?php endif; ?>
      <a href="logout.php">Sair (<?= htmlspecialchars($_SESSION['login'] ?? '') ?>)</a>
    <?php else: ?>
      <a href="login.php">Entrar</a>
      <a href="cadastro.php">Cadastre-se</a>
    <?php endif; ?>
  </div>
</header>

<main>
