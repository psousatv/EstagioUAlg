<?php
//session_start();
include "../../../global/config/dbConn.php";

$logo = "../../../global/imagens/LogotipoTVerde.jpg";

$anoCorrente = $_GET['anoCorrente'] ?? date('Y');

$orcamento = "SELECT
              orc_ano AS ano,
              rub_cod AS cod,
              rub_tipo AS tipo,
              rub_rubrica AS rubrica,
              rub_item AS item,
              SUM(COALESCE(orc_valor_previsto, 0)) AS valor_previsto
              FROM orcamento
              LEFT JOIN rubricas ON rub_cod = orc_rub_cod
              WHERE orc_ano = :anoCorrente
              AND orc_rub_cod <> 100
              AND orc_rub_cod <> 999
              GROUP BY orc_ano, rub_tipo, rub_rubrica";

$stmt = $myConn->prepare($orcamento);
$stmt->bindParam(':anoCorrente', $anoCorrente);
$stmt->execute();
$orcamentoAnual = $stmt->fetchAll(PDO::FETCH_ASSOC);

//Número de processos - Orçamento' na Rúbrica
//$rows = count($orcamentoAnual);

// Totais
$totalPrevisto = array_sum(array_column($orcamentoAnual, "valor_previsto"));

$resposta = [
    "status" => "Successo",
    "dados" => [
      "orcamento" => $orcamentoAnual
      ]
    ];

echo json_encode($resposta, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
