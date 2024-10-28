<?php
//session_start();
include "../../../global/config/dbConn.php";


// dados para dashCandidaturas sem interações - Search ou outras
$orcamento = "SELECT
              orc_ano AS ano,
              r1.rub_cod AS cod,
              r1.rub_tipo AS tipo,
              r1.rub_rubrica AS rubrica,
              r1.rub_item AS item,
              (SELECT DISTINCT
              ROUND(SUM(fact_valor), 2)
              FROM factura
              LEFT JOIN processo ON proces_check = fact_proces_check
              LEFT JOIN rubricas r2 ON r2.rub_cod = proces_rub_cod
              WHERE YEAR(fact_auto_data) = YEAR(NOW()) 
              AND r2.rub_tipo = r1.rub_tipo 
              AND r2.rub_rubrica = r1.rub_rubrica 
              AND r2.rub_item = r1.rub_item) AS faturado,
              ROUND(SUM(orc_valor_previsto), 2) AS previsto,
              ROUND((
                    (SELECT DISTINCT
              ROUND(SUM(fact_valor), 2)
              FROM factura
              LEFT JOIN processo ON proces_check = fact_proces_check
              LEFT JOIN rubricas r2 ON r2.rub_cod = proces_rub_cod
              WHERE YEAR(fact_auto_data) = YEAR(NOW()) 
              AND r2.rub_tipo = r1.rub_tipo 
              AND r2.rub_rubrica = r1.rub_rubrica 
              AND r2.rub_item = r1.rub_item) / ROUND(SUM(orc_valor_previsto), 2)*100),2) AS realizado
              FROM orcamento
              LEFT JOIN rubricas r1 ON r1.rub_cod = orc_rub_cod
              WHERE orc_ano = YEAR(NOW())
              AND orc_rub_cod <> 100
              AND orc_rub_cod <> 999
              GROUP BY orc_ano, r1.rub_tipo, r1.rub_rubrica, r1.rub_item
              ORDER BY r1.rub_tipo DESC, r1.rub_rubrica ASC, r1.rub_item ASC";

$stmt = $myConn->query($orcamento);
$orcamentoAnual = $stmt->fetchAll(PDO::FETCH_ASSOC);

// Set the HTTP Content-Type header to indicate that the response is in JSON format
header('Content-Type: application/json');
echo json_encode($orcamentoAnual);