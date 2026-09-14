<?php
require_once __DIR__ . '/php/auth.php';
require_once __DIR__ . '/php/functions.php';
require_once __DIR__ . '/php/config.php';

if (estaAutenticado()) {
    header('Location: index.php');
    exit;
}

if (!isset($_SESSION['pendente_2fa_usuario_id'])) {
    header('Location: login.php');
    exit;
}

$erro = '';
$pdo = getConexao();

$stmt = $pdo->prepare('SELECT * FROM usuarios WHERE id = :id LIMIT 1');
$stmt->execute([':id' => $_SESSION['pendente_2fa_usuario_id']]);
$usuario = $stmt->fetch();

if (!$usuario) {
    session_unset();
    header('Location: login.php');
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $resposta = trim($_POST['resposta'] ?? '');
    $chave = $_SESSION['pendente_2fa_chave'];

    if ($resposta === '') {
        $erro = 'Informe a resposta para continuar.';
    } elseif (conferirResposta2FA($chave, $resposta, $usuario)) {
        // Sucesso: autentica de fato o usuário e registra o log.
        registrarLog($pdo, $usuario, rotulo2FA($chave), true);

        $_SESSION['auth']    = true;
        $_SESSION['usuario_id'] = $usuario['id'];
        $_SESSION['login']   = $usuario['login'];
        $_SESSION['nome']    = $usuario['nome'];
        $_SESSION['perfil']  = $usuario['perfil'];

        unset($_SESSION['pendente_2fa_usuario_id'], $_SESSION['pendente_2fa_chave'],
              $_SESSION['pendente_2fa_pergunta'], $_SESSION['pendente_2fa_tentativas']);

        $_SESSION['flash_msg'] = 'Bem-vindo(a) de volta, ' . $usuario['nome'] . '!';
        $_SESSION['flash_tipo'] = 'success';
        header('Location: index.php');
        exit;
    } else {
        registrarLog($pdo, $usuario, rotulo2FA($chave), false);
        $_SESSION['pendente_2fa_tentativas']++;

        if ($_SESSION['pendente_2fa_tentativas'] >= 3) {
            unset($_SESSION['pendente_2fa_usuario_id'], $_SESSION['pendente_2fa_chave'],
                  $_SESSION['pendente_2fa_pergunta'], $_SESSION['pendente_2fa_tentativas']);
            $_SESSION['erro_mensagem'] = '3 tentativas sem sucesso! Favor realizar Login novamente.';
            $_SESSION['erro_voltar'] = 'login.php';
            header('Location: erro.php');
            exit;
        }

        $erro = 'Resposta incorreta. Tentativa ' . $_SESSION['pendente_2fa_tentativas'] . ' de 3.';
    }
}

$tituloPagina = 'Verificação em duas etapas';
$paginaAtual  = '2fa';
require __DIR__ . '/php/header.php';
?>

<div class="auth-shell">
  <div class="card auth-card">
    <div class="auth-head">
      <div class="icon">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/><circle cx="12" cy="15.5" r="1.4"/></svg>
      </div>
      <h1>Confirme sua identidade</h1>
      <p>Por segurança, responda a pergunta abaixo com os dados informados no seu cadastro.</p>
    </div>

    <?php if ($erro): ?>
      <div class="field invalido" style="padding:12px 14px;background:var(--red-100);border-radius:11px;margin-bottom:18px;">
        <span class="erro-msg" style="display:block;"><?= htmlspecialchars($erro) ?></span>
      </div>
    <?php endif; ?>

    <form id="form2FA" method="POST" action="2fa.php" novalidate>
      <div class="field">
        <label for="resposta"><?= htmlspecialchars($_SESSION['pendente_2fa_pergunta']) ?></label>
        <input id="resposta" name="resposta" placeholder="Sua resposta" autofocus>
        <span class="erro-msg">A resposta é obrigatória.</span>
        <span class="hint">Tentativas restantes: <?= 3 - $_SESSION['pendente_2fa_tentativas'] ?></span>
      </div>

      <div class="form-actions">
        <button type="submit" class="btn btn-primary btn-block">Confirmar e entrar</button>
      </div>
    </form>

    <p class="form-footer-link"><a href="login.php">Cancelar e voltar ao login</a></p>
  </div>
</div>

<?php require __DIR__ . '/php/footer.php'; ?>
