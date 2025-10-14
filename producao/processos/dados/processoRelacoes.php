<?php
include "../../../global/config/dbConn.php";

$codigoProcesso = isset($_GET['codigoProcesso']) ? intval($_GET['codigoProcesso']) : 0;
$descritivos = [1, 4, 5, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 26, 27, 28, 29, 30];

// Placeholders dinâmicos
$placeholders = implode(',', array_fill(0, count($descritivos), '?'));

// Processos
$sqlProcessos = 'SELECT d.dep_sigla, proces_orc_actividade, 
                 proces_orc_rubrica, proces_linha_orc, 
                 proces_linha_se, proces_data_pub_se,
                 proces_cand, proces_cand_cnt
                 FROM processo
                 JOIN departamento d ON d.dep_cod = proces_departamento
                 WHERE proces_check = :codigoProcesso';
$stmt = $myConn->prepare($sqlProcessos);
$stmt->execute(['codigoProcesso' => $codigoProcesso]);
$processos = $stmt->fetchAll(PDO::FETCH_ASSOC);

// Histórico
$estadiosProcesso = "SELECT
                        historico_dataemissao AS data_registo,
                        historico_descr_nome AS registo,
                        historico_num AS documento,
                        historico_doc AS pormenor
                     FROM historico
                     WHERE historico_descr_cod IN ($placeholders)
                     AND historico_proces_check = ?
                     ORDER BY historico_dataemissao DESC
                     LIMIT 3";
$stmt = $myConn->prepare($estadiosProcesso);
$params = array_merge($descritivos, [$codigoProcesso]);
$stmt->execute($params);
$estados = $stmt->fetchAll(PDO::FETCH_ASSOC);

// Processos Relacionados
$processosRelacionados = 'SELECT proces_rel_sec, proces_estado_nome, proces_padm, proces_nome
                          FROM processo_relacoes
                          INNER JOIN processo ON proces_check = proces_rel_sec
                          WHERE proces_rel_prin = :codigoProcesso
                          ORDER BY proces_cod, proces_sub';
$stmt = $myConn->prepare($processosRelacionados);
$stmt->execute(['codigoProcesso' => $codigoProcesso]);
$relacoes = $stmt->fetchAll(PDO::FETCH_ASSOC);
$registos = count($relacoes);

// Renderização HTML segura
?>

<div class="card col-md-12">
  <div class="card-header bg-danger text-white">Validação de Faturas</div>
  <div class="card-body">
    <ul class="list-group small">
      <?php foreach ($processos as $processo): ?>
        <li>
          <span>Departamento que orçamentou a compra:</span>
          <?= htmlspecialchars($processo['dep_sigla']) ?>
        </li>
        <li>
          <span>Atividade:</span>
          <?= htmlspecialchars($processo['proces_orc_actividade']) ?>
        </li>
        <li>
          <span>Orçamento na Rubrica:</span>
          <?= htmlspecialchars($processo['proces_linha_orc']) ?>,
          <?= htmlspecialchars($processo['proces_orc_rubrica']) ?>
        </li>
        <li>
          <span>Setores Especiais:</span>
          <?= htmlspecialchars($processo['proces_linha_se']) ?> 
          <?php if ($processo['proces_data_pub_se']): ?>
              <a>Publicado no sítio da Taviraverde a</a>
              <?= htmlspecialchars($processo['proces_data_pub_se']) ?>
          <?php endif; ?>
        </li>
        <li>
          <b>Recepção/Execução: Em Curso / Encerrada / Terminada, a aguardar fatura final.</b>
        </li>
        <li>
          <b>Documento em condições de liquidar: A indicar superiormente / Em condições de liquidar.</b>
        </li>
        <li>
          <span>Fundos Comunitários:</span>
          <?= htmlspecialchars($processo['proces_cand']) ?>
          <?= htmlspecialchars($processo['proces_cand_cnt']) ?>
        </li>
      <?php endforeach; ?>
    </ul>
  </div>
</div>

<h1 class="mt-4"></h1>

<div class="card col-md-12">
  <div class="card-header bg-info text-white">Últimos movimentos do processo</div>
  <div class="card-body">
    <ul class="list-group">
      <?php foreach ($estados as $estado): ?>
        <li class="list-group-item">
          <span class="badge bg-info text-white"><?= htmlspecialchars($estado['data_registo']) ?></span>
          <?= htmlspecialchars($estado['registo']) ?> -
          <?= htmlspecialchars($estado['documento']) ?> -
          <?= htmlspecialchars($estado['pormenor']) ?>
        </li>
      <?php endforeach; ?>
    </ul>
  </div>
</div>

<h1 class="mt-4"></h1>

<div class="card col-md-12">
  <div class="card-header bg-warning">Processos Relacionados (<?= $registos ?>)</div>
  <div class="card-body">
    <ul class="list-group">
      <?php foreach ($relacoes as $relacao): ?>
        <li class="list-group-item" onclick="redirectProcesso(<?= (int)$relacao['proces_rel_sec'] ?>)">
          <span class="badge bg-info text-white"><?= htmlspecialchars($relacao['proces_estado_nome']) ?></span>
          <?= htmlspecialchars($relacao['proces_nome']) ?>
        </li>
      <?php endforeach; ?>
    </ul>
  </div>
</div>
