<?php
require_once __DIR__ . '/php/auth.php';
require_once __DIR__ . '/php/functions.php';
require_once __DIR__ . '/php/config.php';
exigirPerfil('comum');

$erros = [];
$pdo = getConexao();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $senhaAtual = $_POST['senha_atual'] ?? '';
    $novaSenha = $_POST['nova_senha'] ?? '';
    $confirmaNovaSenha = $_POST['confirma_nova_senha'] ?? '';

    $stmt = $pdo->prepare('SELECT * FROM usuarios WHERE id = :id');
    $stmt->execute([':id' => $_SESSION['usuario_id']]);
    $usuario = $stmt->fetch();

    if (!$usuario || !password_verify($senhaAtual, $usuario['senha_hash'])) {
        $erros[] = 'A senha atual informada está incorreta.';
    }
    if (!validarSenha($novaSenha)) {
        $erros[] = 'A nova senha deve conter exatamente 8 caracteres alfabéticos.';
    }
    if ($novaSenha !== $confirmaNovaSenha) {
        $erros[] = 'A nova senha e a confirmação não coincidem.';
    }

    if (empty($erros)) {
        $stmt = $pdo->prepare('UPDATE usuarios SET senha_hash = :hash WHERE id = :id');
        $stmt->execute([
            ':hash' => password_hash($novaSenha, PASSWORD_BCRYPT),
            ':id' => $_SESSION['usuario_id'],
        ]);

        $_SESSION['flash_msg'] = 'Senha alterada com sucesso!';
        $_SESSION['flash_tipo'] = 'success';
        header('Location: alterar_senha.php');
        exit;
    }
}

$tituloPagina = 'Alterar Senha';
$paginaAtual  = 'senha';
require __DIR__ . '/php/header.php';
?>

<div class="wrap">
  <div class="page-hero">
    <span class="eyebrow"><span class="dot"></span>Minha conta</span>
    <h1>Alterar senha</h1>
    <p>Somente você pode alterar a sua própria senha. Ela deve conter exatamente 8 caracteres alfabéticos.</p>
  </div>

  <div class="auth-shell" style="min-height:auto;padding:20px 0 90px;justify-content:flex-start;">
    <div class="card auth-card" style="margin:0;">

      <?php if (!empty($erros)): ?>
        <div class="field invalido" style="padding:12px 14px;background:var(--red-100);border-radius:11px;margin-bottom:18px;">
          <span class="erro-msg" style="display:block;">
            <?php foreach ($erros as $e): ?>
              • <?= htmlspecialchars($e) ?><br>
            <?php endforeach; ?>
          </span>
        </div>
      <?php endif; ?>

      <form id="formAlterarSenha" method="POST" action="alterar_senha.php" novalidate>
        <div class="field">
          <label for="senha_atual">Senha atual</label>
          <input type="password" id="senha_atual" name="senha_atual" maxlength="8" placeholder="Sua senha atual">
        </div>
        <div class="field">
          <label for="nova_senha">Nova senha</label>
          <input type="password" id="nova_senha" name="nova_senha" maxlength="8" placeholder="8 letras">
          <span class="hint">Exatamente 8 caracteres alfabéticos.</span>
          <span class="erro-msg">A senha deve ter exatamente 8 letras.</span>
        </div>
        <div class="field">
          <label for="confirma_nova_senha">Confirmar nova senha</label>
          <input type="password" id="confirma_nova_senha" name="confirma_nova_senha" maxlength="8" placeholder="Repita a nova senha">
          <span class="erro-msg">As senhas não coincidem.</span>
        </div>
        <div class="form-actions">
          <button type="submit" class="btn btn-primary btn-block">Salvar nova senha</button>
        </div>
      </form>
    </div>
  </div>
</div>

<?php require __DIR__ . '/php/footer.php'; ?>
