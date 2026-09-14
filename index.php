<?php
require_once __DIR__ . '/php/auth.php';
// A Tela Principal é pública — login só é exigido para criar a identidade
// do pet (cadastro/login) ou acessar as áreas internas (consulta, log, senha).

$tituloPagina = 'Início';
$paginaAtual  = 'inicio';
$logadoNaHome = estaAutenticado();

require __DIR__ . '/php/header.php';
?>

<section class="hero">
  <div class="wrap hero-grid">
    <div>
      <span class="eyebrow"><span class="dot"></span>Identidade digital para pets</span>
      <h1>Uma identidade para quem faz parte da <span class="accent">sua família.</span></h1>
      <p class="sub">Crie a identidade digital do seu pet e aumente as chances de encontrá-lo caso ele se perca — com QR Code, perfil público e alerta de emergência.</p>
      <div class="hero-ctas">
        <a href="#como-funciona" class="btn btn-primary">Como funciona</a>
        <?php if (!$logadoNaHome): ?>
          <a href="login.php" class="btn btn-outline">Entrar</a>
        <?php elseif (perfilAtual() === 'comum'): ?>
          <a href="alterar_senha.php" class="btn btn-outline">Minha conta</a>
        <?php else: ?>
          <a href="consulta_usuario.php" class="btn btn-outline">Painel administrativo</a>
        <?php endif; ?>
      </div>
    </div>
    <div class="hero-visual">
      <div class="blob-photo blob-dog"><img src="https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=500&q=80" alt="Cachorro golden retriever feliz"></div>
      <div class="blob-photo blob-cat"><img src="https://images.unsplash.com/photo-1533738363-b7f9aef128ce?auto=format&fit=crop&w=400&q=80" alt="Gato feliz"></div>
      <div class="id-card">
        <div class="id-card-top">
          <img src="https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=200&q=80" alt="Luna">
          <div><b>Luna</b><span>Cachorra · Golden Retriever</span></div>
        </div>
        <div class="id-card-divider"></div>
        <div class="id-card-rows">
          <div><span>ID do pet</span><b>PET-84921</b></div>
          <div><span>Idade</span><b>3 anos</b></div>
          <div><span>Cor</span><b>Dourado</b></div>
          <div><span>Cidade</span><b>Rio de Janeiro</b></div>
        </div>
        <div class="id-card-qr">
          <img src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=petid.app/pet/luna" alt="QR Code de Luna">
          <span>Escaneie para conhecer a Luna</span>
        </div>
      </div>
      <div class="float-chip c1">🟢 Perfil ativo</div>
      <div class="float-chip c2">📍 Copacabana, RJ</div>
    </div>
  </div>
</section>

<section class="section" id="como-funciona">
  <div class="wrap">
    <div class="section-head">
      <span class="eyebrow"><span class="dot"></span>Como funciona</span>
      <h2 style="margin-top:14px">Do cadastro à coleira em três passos</h2>
      <p>Um fluxo simples, pensado para funcionar mesmo no momento de mais aflição — quando o seu pet mais precisa.</p>
    </div>
    <div class="stats-strip">
      <div class="card" style="text-align:left;padding:24px 22px;">
        <span class="eyebrow" style="margin-bottom:12px;">01</span>
        <h3 style="font-size:17px;margin:6px 0 6px;">Cadastre seu pet</h3>
        <p style="font-size:13.5px;color:var(--ink-soft);">Crie o perfil com fotos, características e informações importantes.</p>
      </div>
      <div class="card" style="text-align:left;padding:24px 22px;">
        <span class="eyebrow" style="margin-bottom:12px;">02</span>
        <h3 style="font-size:17px;margin:6px 0 6px;">Identifique</h3>
        <p style="font-size:13.5px;color:var(--ink-soft);">Tenha uma identidade digital exclusiva e um QR Code para facilitar o reconhecimento.</p>
      </div>
      <div class="card" style="text-align:left;padding:24px 22px;">
        <span class="eyebrow" style="margin-bottom:12px;">03</span>
        <h3 style="font-size:17px;margin:6px 0 6px;">Encontre</h3>
        <p style="font-size:13.5px;color:var(--ink-soft);">Se seu pet desaparecer, ative o alerta de pet perdido e aumente o alcance da busca.</p>
      </div>
      <div class="card" style="text-align:left;padding:24px 22px;">
        <span class="eyebrow" style="margin-bottom:12px;">+</span>
        <h3 style="font-size:17px;margin:6px 0 6px;">Comunidade</h3>
        <p style="font-size:13.5px;color:var(--ink-soft);">Cada perfil compartilhado é um vizinho a mais ajudando a procurar.</p>
      </div>
    </div>
  </div>
</section>

<section class="section" style="padding-top:10px;">
  <div class="identity-section">
    <div class="identity-grid">
      <div class="identity-copy">
        <span class="eyebrow"><span class="dot"></span>Identidade do pet</span>
        <h2>Uma carteirinha digital, feita para ser encontrada.</h2>
        <p>Cada pet ganha um perfil próprio, com QR Code exclusivo e um link direto — pronto para colocar na coleira.</p>
        <p class="link-line">petid.app/pet/luna</p>
      </div>
      <div class="wallet-card">
        <div class="wallet-top">
          <img src="https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=200&q=80" alt="Luna">
          <div><b>Luna 🐶</b><span>Cachorra · Golden Retriever</span></div>
        </div>
        <div class="wallet-divider"></div>
        <div class="wallet-rows">
          <div><span>ID do pet</span><b>PET-84921</b></div>
          <div><span>Idade</span><b>3 anos</b></div>
          <div><span>Cor</span><b>Dourado</b></div>
          <div><span>Cidade</span><b>Rio de Janeiro - RJ</b></div>
        </div>
        <div class="wallet-qr">
          <img src="https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=petid.app/pet/luna" alt="QR code">
          <p>Escaneie para conhecer a Luna<small>petid.app/pet/luna</small></p>
        </div>
      </div>
    </div>
  </div>
</section>

<div class="wrap">
  <div class="cta-band">
    <div>
      <h3>Seu pet merece ser encontrado.</h3>
      <p>Cadastre seu pet gratuitamente e receba o QR Code em minutos.</p>
    </div>
    <?php if (!$logadoNaHome): ?>
      <a href="cadastro.php" class="btn btn-gold">Criar identidade do meu pet</a>
    <?php elseif (perfilAtual() === 'comum'): ?>
      <a href="alterar_senha.php" class="btn btn-gold">Gerenciar minha conta</a>
    <?php else: ?>
      <a href="consulta_usuario.php" class="btn btn-gold">Ver usuários cadastrados</a>
    <?php endif; ?>
  </div>
</div>

<?php require __DIR__ . '/php/footer.php'; ?>
