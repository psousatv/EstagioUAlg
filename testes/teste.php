<?php
header('Content-Type: application/json'); // Define o tipo de retorno como JSON

include "../global/config/dbConn.php";

//$codigoProcesso = isset($_GET['codigoProcesso']) ? intval($_GET['codigoProcesso']) : 0;
$codigoProcesso = 28177;

// Queries
$qryProcesso = '
  SELECT
  proces_nome As nome
  FROM processo
  WHERE proces_check = ?';

$qryHistorico = '
  SELECT
  d.descr_fase AS fase, 
  historico_dataemissao AS data,
  historico_datamov AS aprovado,
  d.descr_nome AS assunto,
  historico_num AS documento,
  historico_doc AS expediente,
  historico_valor AS valor,
  historico_obs AS observacoes
  FROM historico
  RIGHT JOIN descritivos d ON descr_cod = historico_descr_cod
  WHERE historico_proces_check = ?
  ORDER BY historico_dataemissao ASC';

$qryFaturacao = '
  SELECT
  fact_auto_num AS auto,
  fact_auto_data AS auto_data,
  fact_num AS fatura_num,
  fact_data AS fatura_data,
  fact_valor AS fatura_valor,
  fact_duovalor AS retencoes_duodecimo,
  fact_duopaga AS retencoes_duodecimo_devolvido,
  fact_garban AS retencoes_garantia,
  fact_garbanpaga AS retencoes_garantia_devolvido
  FROM factura
  WHERE fact_proces_check = ?
  ORDER BY fact_auto_num ASC';

  $qryPlanoFaturas = '
  SELECT
  pp_ano AS ano,
  pp_mes_previsto AS mes,
  pp_auto_num AS auto,
  pp_valor_previsto AS previsto,
  pp_valor_faturado AS realizado,
  CASE WHEN pp_valor_faturado > 0 
  THEN ROUND(pp_valor_faturado - pp_valor_previsto, 2) 
  ELSE 0 END AS desvio
  FROM plano_pagamentos
  WHERE pp_proces_check = ?
  ORDER BY pp_ano, pp_mes_previsto ASC';

// Preparação e Execução das Queries
// Processo
$stmtProcesso = $myConn->prepare($qryProcesso);
$stmtProcesso->execute([$codigoProcesso]);
$processo = $stmtProcesso->fetchAll(PDO::FETCH_ASSOC);
// Histórico
$stmtHistorico = $myConn->prepare($qryHistorico);
$stmtHistorico->execute([$codigoProcesso]);
$historico = $stmtHistorico->fetchAll(PDO::FETCH_ASSOC);
// Facturação
$stmtFaturas = $myConn->prepare($qryFaturacao);
$stmtFaturas->execute([$codigoProcesso]);
$faturas = $stmtFaturas->fetchAll(PDO::FETCH_ASSOC);
// Plano de Facturação
$stmtPlanoFaturas = $myConn->prepare($qryPlanoFaturas);
$stmtPlanoFaturas->execute([$codigoProcesso]);
$plano = $stmtPlanoFaturas->fetchAll(PDO::FETCH_ASSOC);


// Tratamento dos dados
// Agrupar por fase
$agrupadoPorFase = [];

foreach ($historico as $registo) {
    $fase = $registo['fase'] ?? 'Sem Fase';

    // Remove o campo "fase" do movimento individual
    $movimento = $registo;
    unset($movimento['fase']);

    // Agrupa os movimentos pela fase
    $agrupadoPorFase[$fase][] = $movimento;
}

$resposta = [
    "status" => "Successo",
    "dados" => [
      "processo" => $processo,
      "historico" => $agrupadoPorFase,
      "faturas" => $faturas,
      "plano" => $plano
      ]
    ];

    echo json_encode($resposta, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
