<?php
//session_start();
include "../../../global/config/dbConn.php";

if(isset($_GET['anoCorrente'])){
      $anoCorrente = intval($_GET['anoCorrente']);
} else {
      $anoCorrente = date('Y') -1 ;
};

//$anoCorrente = intval($_GET['anoCorrente']);

// dados para dashCandidaturas sem interações - Search ou outras
$orcamento = "SELECT
              orc_ano AS ano,
              r.rub_cod AS cod,
              r.rub_tipo AS tipo,
              r.rub_rubrica AS rubrica,
              r.rub_item AS item,
              (SELECT COALESCE(SUM(proces_val_adjudicacoes), 0) FROM processo
              LEFT JOIN rubricas r1 ON r1.rub_cod = proces_rub_cod
              WHERE proces_orc_ano = '".$anoCorrente."' AND r1.rub_tipo = r.rub_tipo 
              AND r1.rub_rubrica = r.rub_rubrica 
              AND r1.rub_item = r.rub_item) AS adjudicado,
              COALESCE(SUM(orc_valor_previsto), 0) AS previsto 
              
              FROM orcamento
              LEFT JOIN rubricas r ON r.rub_cod = orc_rub_cod
              WHERE orc_ano = '".$anoCorrente."'
              AND orc_rub_cod <> 100
              AND orc_rub_cod <> 999
              GROUP BY orc_ano, r.rub_cod
              ORDER BY r.rub_cod, r.rub_tipo DESC, r.rub_rubrica ASC, r.rub_item ASC";

$stmt = $myConn->query($orcamento);
$orcamentoAnual = $stmt->fetchAll(PDO::FETCH_ASSOC);

// Set the HTTP Content-Type header to indicate that the response is in JSON format
header('Content-Type: application/json');
echo json_encode($orcamentoAnual);