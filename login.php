<?php
require_once __DIR__ . '/php/auth.php';
require_once __DIR__ . '/php/functions.php';
require_once __DIR__ . '/php/config.php';

if (estaAutenticado()) {
    header('Location: index.php');
    exit;
}

$erro = '';
$loginValor = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $loginValor = trim($_POST['login'] ?? '');
    $senha = $_POST['senha'] ?? '';

    if ($loginValor === '' || $senha === '') {
        $erro = 'Informe login e senha.';
    } else {
        try {
            $pdo = getConexao();
            $stmt = $pdo->prepare('SELECT * FROM usuarios WHERE login = :login LIMIT 1');
            $stmt->execute([':login' => $loginValor]);
            $usuario = $stmt->fetch();

            if (!$usuario || !password_verify($senha, $usuario['senha_hash'])) {
                $_SESSION['erro_mensagem'] = 'Login ou senha incorretos. Verifique seus dados e tente novamente.';
                $_SESSION['erro_voltar'] = 'login.php';
                header('Location: erro.php');
                exit;
            }

            // Login e senha corretos: aciona o Segundo Fator de Autenticação (2FA).
            $pergunta = sortearPergunta2FA();
            $_SESSION['pendente_2fa_usuario_id'] = $usuario['id'];
            $_SESSION['pendente_2fa_chave']      = $pergunta['chave'];
            $_SESSION['pendente_2fa_pergunta']   = $pergunta['pergunta'];
            $_SESSION['pendente_2fa_tentativas'] = 0;

            header('Location: 2fa.php');
            exit;
        } catch (PDOException $e) {
            error_log('Erro no login: ' . $e->getMessage());
            $_SESSION['erro_mensagem'] = 'Não foi possível efetuar o login agora. Tente novamente mais tarde.';
            header('Location: erro.php');
            exit;
        }
    }
}

$tituloPagina = 'Login';
$paginaAtual  = 'login';
require __DIR__ . '/php/header.php';
?>

<div class="auth-shell">
  <div class="card auth-card">
    <div class="auth-head">
      <div class="icon">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="10" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
      </div>
      <h1>Entrar na sua conta</h1>
      <p>Use seu login e senha cadastrados. Em seguida, confirmaremos sua identidade com um segundo fator.</p>
    </div>

    <?php if ($erro): ?>
      <div class="field invalido" style="padding:12px 14px;background:var(--red-100);border-radius:11px;margin-bottom:18px;">
        <span class="erro-msg" style="display:block;"><?= htmlspecialchars($erro) ?></span>
      </div>
    <?php endif; ?>

    <form id="formLogin" method="POST" action="login.php" novalidate>
      <div class="field">
        <label for="login">Login</label>
        <input id="login" name="login" placeholder="Seu login" maxlength="6" value="<?= htmlspecialchars($loginValor) ?>" autofocus>
        <span class="erro-msg">Informe o login.</span>
      </div>
      <div class="field">
        <label for="senha">Senha</label>
        <input type="password" id="senha" name="senha" placeholder="Sua senha" maxlength="8">
        <span class="erro-msg">Informe a senha.</span>
      </div>

      <div class="form-actions">
        <button type="button" id="btnLimparLogin" class="btn btn-outline">Limpar</button>
        <button type="submit" class="btn btn-primary">Entrar</button>
      </div>
    </form>

    <p class="form-footer-link">Ainda não tem uma conta? <a href="cadastro.php">Cadastre-se</a></p>
  </div>
</div>

<?php require __DIR__ . '/php/footer.php'; ?>
