<?php
require_once __DIR__ . '/php/auth.php';

$mensagem = $_SESSION['erro_mensagem'] ?? 'Ocorreu um erro inesperado. Tente novamente.';
$voltarPara = $_SESSION['erro_voltar'] ?? 'index.php';
unset($_SESSION['erro_mensagem'], $_SESSION['erro_voltar']);

$tituloPagina = 'Erro';
require __DIR__ . '/php/header.php';
?>

<div class="error-shell">
  <div class="card error-card">
    <div class="icon">
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 8v5"/><circle cx="12" cy="16.3" r="0.6" fill="currentColor" stroke="none"/></svg>
    </div>
    <h1>Algo não saiu como esperado</h1>
    <p><?= htmlspecialchars($mensagem) ?></p>
    <a href="<?= htmlspecialchars($voltarPara) ?>" class="btn btn-primary">Tentar novamente</a>
  </div>
</div>

<?php require __DIR__ . '/php/footer.php'; ?>
