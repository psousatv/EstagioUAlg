<?php
//session_start();
include "../../../global/config/dbConn.php";


// dados para dashCandidaturas sem interações - Search ou outras
$orcamento = "SELECT orc_ano AS ano, r1.rub_tipo AS tipo, r1.rub_rubrica AS rubrica, r1.rub_item AS item,
             (SELECT DISTINCT 
              ROUND(proces_val_adjudicacoes), 2)
              FROM processo
              LEFT JOIN rubricas r3 ON r3.rub_cod = proces_rub_cod
              WHERE
              r3.rub_tipo = r1.rub_tipo AND
              r3.rub_rubrica = r1.rub_rubrica AND
              r3.rub_item = r1.rub_item) AS adjudicado,
             (SELECT DISTINCT 
              ROUND(SUM(fact_valor), 2)
              FROM factura
              LEFT JOIN processo ON proces_check = fact_proces_check
              LEFT JOIN rubricas r2 ON r2.rub_cod = proces_rub_cod
              WHERE
              YEAR(fact_auto_data) = YEAR(NOW()) AND
              r2.rub_tipo = r1.rub_tipo AND
              r2.rub_rubrica = r1.rub_rubrica AND
              r2.rub_item = r1.rub_item) AS faturado,
            ROUND(SUM(orc_valor_previsto), 2) AS orcamento
            FROM orcamento        
            LEFT JOIN rubricas r1 ON r1.rub_cod = orc_rub_cod            
            WHERE orc_ano = YEAR(NOW()) 
						 AND orc_rub_cod <> 100 
						 AND orc_rub_cod <> 999 
            GROUP BY ano, tipo, rubrica, item
            ORDER BY tipo DESC, rubrica ASC, item ASC ";

$stmt = $myConn->query($orcamento);
$orcamentoAnual = $stmt->fetchAll(PDO::FETCH_ASSOC);

// Set the HTTP Content-Type header to indicate that the response is in JSON format
header('Content-Type: application/json');
echo json_encode($orcamentoAnual);