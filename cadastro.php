<?php
require_once __DIR__ . '/php/auth.php';
require_once __DIR__ . '/php/functions.php';
require_once __DIR__ . '/php/config.php';

// Usuário já autenticado não precisa se cadastrar de novo.
if (estaAutenticado()) {
    header('Location: index.php');
    exit;
}

$erros = [];
$valores = [
    'nome' => '', 'data_nascimento' => '', 'sexo' => '', 'nome_materno' => '', 'cpf' => '',
    'email' => '', 'telefone_celular' => '', 'telefone_fixo' => '', 'cep' => '', 'logradouro' => '',
    'numero' => '', 'complemento' => '', 'bairro' => '', 'cidade' => '', 'uf' => '', 'login' => '',
];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    foreach ($valores as $campo => $_) {
        $valores[$campo] = trim($_POST[$campo] ?? '');
    }
    $senha = $_POST['senha'] ?? '';
    $confirmaSenha = $_POST['confirma_senha'] ?? '';

    // 1. Campos obrigatórios
    $obrigatorios = ['nome', 'data_nascimento', 'sexo', 'nome_materno', 'cpf', 'email',
        'telefone_celular', 'telefone_fixo', 'cep', 'numero', 'login'];
    foreach ($obrigatorios as $campo) {
        if ($valores[$campo] === '') {
            $erros[] = 'Preencha todos os campos obrigatórios.';
            break;
        }
    }
    if ($senha === '' || $confirmaSenha === '') {
        $erros[] = 'Preencha a senha e a confirmação de senha.';
    }

    // 2. Nome: 15 a 80 caracteres alfabéticos
    if (!validarNome($valores['nome'])) {
        $erros[] = 'O nome deve conter entre 15 e 80 caracteres, apenas letras e espaços.';
    }

    // 3. CPF: dígito verificador
    if (!validarCPF($valores['cpf'])) {
        $erros[] = 'CPF inválido.';
    }

    // e-mail
    if (!validarEmail($valores['email'])) {
        $erros[] = 'Informe um e-mail válido.';
    }

    // 5. Telefones no formato (+55)XX-XXXXXXXX
    if (!validarTelefone($valores['telefone_celular'])) {
        $erros[] = 'Telefone celular fora do formato esperado: (+55)XX-XXXXXXXXX';
    }
    if (!validarTelefone($valores['telefone_fixo'])) {
        $erros[] = 'Telefone fixo fora do formato esperado: (+55)XX-XXXXXXXX';
    }

    // 4. CEP
    if (!validarCEP($valores['cep'])) {
        $erros[] = 'CEP inválido.';
    }

    // 6. Login: exatamente 6 letras
    if (!validarLogin($valores['login'])) {
        $erros[] = 'O login deve conter exatamente 6 caracteres alfabéticos.';
    }

    // 7. Senha: exatamente 8 letras
    if (!validarSenha($senha)) {
        $erros[] = 'A senha deve conter exatamente 8 caracteres alfabéticos.';
    }

    // 8. Confirmação
    if ($senha !== $confirmaSenha) {
        $erros[] = 'A senha e a confirmação de senha não coincidem.';
    }

    if (empty($erros)) {
        try {
            $pdo = getConexao();

            $stmt = $pdo->prepare('SELECT id FROM usuarios WHERE cpf = :cpf OR login = :login OR email = :email');
            $stmt->execute([
                ':cpf' => somenteNumeros($valores['cpf']),
                ':login' => $valores['login'],
                ':email' => $valores['email'],
            ]);
            if ($stmt->fetch()) {
                $erros[] = 'Já existe um usuário cadastrado com este CPF, login ou e-mail.';
            } else {
                $stmt = $pdo->prepare(
                    'INSERT INTO usuarios (nome, data_nascimento, sexo, nome_materno, cpf, email,
                        telefone_celular, telefone_fixo, cep, logradouro, numero, complemento, bairro,
                        cidade, uf, login, senha_hash, perfil)
                     VALUES (:nome, :data_nascimento, :sexo, :nome_materno, :cpf, :email,
                        :telefone_celular, :telefone_fixo, :cep, :logradouro, :numero, :complemento, :bairro,
                        :cidade, :uf, :login, :senha_hash, "comum")'
                );
                $stmt->execute([
                    ':nome' => $valores['nome'],
                    ':data_nascimento' => $valores['data_nascimento'],
                    ':sexo' => $valores['sexo'],
                    ':nome_materno' => $valores['nome_materno'],
                    ':cpf' => somenteNumeros($valores['cpf']),
                    ':email' => $valores['email'],
                    ':telefone_celular' => $valores['telefone_celular'],
                    ':telefone_fixo' => $valores['telefone_fixo'],
                    ':cep' => somenteNumeros($valores['cep']),
                    ':logradouro' => $valores['logradouro'],
                    ':numero' => $valores['numero'],
                    ':complemento' => $valores['complemento'],
                    ':bairro' => $valores['bairro'],
                    ':cidade' => $valores['cidade'],
                    ':uf' => $valores['uf'],
                    ':login' => $valores['login'],
                    ':senha_hash' => password_hash($senha, PASSWORD_BCRYPT),
                ]);

                $_SESSION['flash_msg'] = 'Cadastro realizado com sucesso! Faça login para continuar.';
                $_SESSION['flash_tipo'] = 'success';
                header('Location: login.php');
                exit;
            }
        } catch (PDOException $e) {
            error_log('Erro ao cadastrar usuário: ' . $e->getMessage());
            $_SESSION['erro_mensagem'] = 'Não foi possível concluir o cadastro. Tente novamente mais tarde.';
            header('Location: erro.php');
            exit;
        }
    }
}

$tituloPagina = 'Cadastro de Usuário';
$paginaAtual  = 'cadastro';
require __DIR__ . '/php/header.php';
?>

<div class="auth-shell">
  <div class="card auth-card wide">
    <div class="auth-head">
      <div class="icon">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>
      </div>
      <h1>Criar sua identidade digital</h1>
      <p>Leva poucos minutos. Seus dados ficam protegidos e o CEP preenche o endereço automaticamente.</p>
    </div>

    <?php if (!empty($erros)): ?>
      <div class="field invalido" style="padding:14px 16px;background:var(--red-100);border-radius:11px;margin-bottom:20px;">
        <span class="erro-msg" style="display:block;font-size:13px;">
          <?php foreach ($erros as $e): ?>
            • <?= htmlspecialchars($e) ?><br>
          <?php endforeach; ?>
        </span>
      </div>
    <?php endif; ?>

    <form id="formCadastro" method="POST" action="cadastro.php" novalidate>

      <div class="form-section-title">Dados pessoais</div>
      <div class="form-row full">
        <div class="field">
          <label for="nome">Nome completo</label>
          <input id="nome" name="nome" placeholder="Seu nome completo" value="<?= htmlspecialchars($valores['nome']) ?>">
          <span class="erro-msg">Entre 15 e 80 caracteres, apenas letras.</span>
        </div>
      </div>
      <div class="form-row">
        <div class="field">
          <label for="data_nascimento">Data de nascimento</label>
          <input type="date" id="data_nascimento" name="data_nascimento" value="<?= htmlspecialchars($valores['data_nascimento']) ?>">
          <span class="erro-msg">Campo obrigatório.</span>
        </div>
        <div class="field">
          <label for="sexo">Sexo</label>
          <select id="sexo" name="sexo">
            <option value="">Selecione</option>
            <option value="Feminino" <?= $valores['sexo'] === 'Feminino' ? 'selected' : '' ?>>Feminino</option>
            <option value="Masculino" <?= $valores['sexo'] === 'Masculino' ? 'selected' : '' ?>>Masculino</option>
            <option value="Outro" <?= $valores['sexo'] === 'Outro' ? 'selected' : '' ?>>Outro</option>
          </select>
          <span class="erro-msg">Campo obrigatório.</span>
        </div>
      </div>
      <div class="form-row">
        <div class="field">
          <label for="nome_materno">Nome da mãe</label>
          <input id="nome_materno" name="nome_materno" placeholder="Nome completo da sua mãe" value="<?= htmlspecialchars($valores['nome_materno']) ?>">
          <span class="hint">Também será usado como uma das perguntas do 2FA.</span>
          <span class="erro-msg">Campo obrigatório.</span>
        </div>
        <div class="field">
          <label for="cpf">CPF</label>
          <input id="cpf" name="cpf" placeholder="000.000.000-00" value="<?= htmlspecialchars($valores['cpf']) ?>">
          <span class="erro-msg">CPF inválido.</span>
        </div>
      </div>

      <div class="form-section-title">Contato</div>
      <div class="form-row">
        <div class="field">
          <label for="email">E-mail</label>
          <input type="email" id="email" name="email" placeholder="voce@email.com" value="<?= htmlspecialchars($valores['email']) ?>">
          <span class="erro-msg">Informe um e-mail válido.</span>
        </div>
        <div class="field">
          <label for="telefone_celular">Telefone celular</label>
          <input id="telefone_celular" name="telefone_celular" placeholder="(+55)XX-XXXXXXXXX" value="<?= htmlspecialchars($valores['telefone_celular']) ?>">
          <span class="erro-msg">Formato esperado: (+55)XX-XXXXXXXXX</span>
        </div>
      </div>
      <div class="form-row">
        <div class="field">
          <label for="telefone_fixo">Telefone fixo</label>
          <input id="telefone_fixo" name="telefone_fixo" placeholder="(+55)XX-XXXXXXXX" value="<?= htmlspecialchars($valores['telefone_fixo']) ?>">
          <span class="erro-msg">Formato esperado: (+55)XX-XXXXXXXX</span>
        </div>
        <div class="field">
          <label for="cep">CEP</label>
          <input id="cep" name="cep" placeholder="00000-000" value="<?= htmlspecialchars($valores['cep']) ?>">
          <span class="hint" id="cepStatus">Preenchemos o endereço automaticamente.</span>
          <span class="erro-msg">CEP inválido.</span>
        </div>
      </div>

      <div class="form-section-title">Endereço completo</div>
      <div class="form-row">
        <div class="field">
          <label for="logradouro">Logradouro</label>
          <input id="logradouro" name="logradouro" placeholder="Rua, avenida..." value="<?= htmlspecialchars($valores['logradouro']) ?>">
        </div>
        <div class="field">
          <label for="numero">Número</label>
          <input id="numero" name="numero" placeholder="Nº" value="<?= htmlspecialchars($valores['numero']) ?>">
          <span class="erro-msg">Campo obrigatório.</span>
        </div>
      </div>
      <div class="form-row">
        <div class="field">
          <label for="complemento">Complemento</label>
          <input id="complemento" name="complemento" placeholder="Apto, bloco... (opcional)" value="<?= htmlspecialchars($valores['complemento']) ?>">
        </div>
        <div class="field">
          <label for="bairro">Bairro</label>
          <input id="bairro" name="bairro" placeholder="Bairro" value="<?= htmlspecialchars($valores['bairro']) ?>">
        </div>
      </div>
      <div class="form-row">
        <div class="field">
          <label for="cidade">Cidade</label>
          <input id="cidade" name="cidade" placeholder="Cidade" value="<?= htmlspecialchars($valores['cidade']) ?>">
        </div>
        <div class="field">
          <label for="uf">UF</label>
          <input id="uf" name="uf" placeholder="UF" maxlength="2" value="<?= htmlspecialchars($valores['uf']) ?>">
        </div>
      </div>

      <div class="form-section-title">Acesso</div>
      <div class="form-row">
        <div class="field">
          <label for="login">Login</label>
          <input id="login" name="login" placeholder="6 letras" maxlength="6" value="<?= htmlspecialchars($valores['login']) ?>">
          <span class="hint">Exatamente 6 caracteres alfabéticos.</span>
          <span class="erro-msg">O login deve ter exatamente 6 letras.</span>
        </div>
        <div></div>
      </div>
      <div class="form-row">
        <div class="field">
          <label for="senha">Senha</label>
          <input type="password" id="senha" name="senha" placeholder="8 letras" maxlength="8">
          <span class="hint">Exatamente 8 caracteres alfabéticos.</span>
          <span class="erro-msg">A senha deve ter exatamente 8 letras.</span>
        </div>
        <div class="field">
          <label for="confirma_senha">Confirmação da senha</label>
          <input type="password" id="confirma_senha" name="confirma_senha" placeholder="Repita a senha" maxlength="8">
          <span class="erro-msg">As senhas não coincidem.</span>
        </div>
      </div>

      <div class="form-actions" style="margin-top:10px;">
        <button type="button" id="btnLimparCadastro" class="btn btn-outline">Limpar tela</button>
        <button type="submit" class="btn btn-primary">Criar identidade do usuário</button>
      </div>
    </form>

    <p class="form-footer-link">Já tem uma conta? <a href="login.php">Fazer login</a></p>
  </div>
</div>

<?php require __DIR__ . '/php/footer.php'; ?>
