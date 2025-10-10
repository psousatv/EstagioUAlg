<?php
//session_start();
include "../../../global/config/dbConn.php";

if(isset($_GET['anoCorrente'])){
      $anoCorrente = intval($_GET['anoCorrente']);
} else {
      $anoCorrente = date('Y') -1 ;
};

$orcamento = "SELECT
              orc_ano AS ano,
              orc_rubrica AS cod,
              r.rub_tipo AS tipo,
              r.rub_rubrica AS rubrica,
              r.rub_item AS item,
              COALESCE(SUM(orc_valor_previsto), 1) AS previsto,
              
              (SELECT 
              COALESCE(SUM(proces_val_adjudicacoes), 1) 
              FROM processo
              LEFT JOIN rubricas r1 ON r1.rub_cod = proces_rub_cod
              WHERE proces_orc_ano = '".$anoCorrente."' AND r1.rub_tipo = r.rub_tipo 
              AND r1.rub_cod = r.rub_cod 
              AND r1.rub_item = r.rub_item) AS adjudicado
              
              FROM orcamento
              LEFT JOIN rubricas r ON r.rub_cod = orc_rubrica
              WHERE orc_ano = '".$anoCorrente."'
              AND orc_rubrica <> 100
              AND orc_rubrica <> 999
              GROUP BY orc_ano, r.rub_cod
              ORDER BY r.rub_cod, r.rub_tipo DESC, r.rub_rubrica ASC, r.rub_item ASC";

$stmt = $myConn->query($orcamento);
$orcamentoAnual = $stmt->fetchAll(PDO::FETCH_ASSOC);

// Set the HTTP Content-Type header to indicate that the response is in JSON format
header('Content-Type: application/json');
echo json_encode($orcamentoAnual);