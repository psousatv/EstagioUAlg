<?php
//session_start();
include "../../../global/config/dbConn.php";

$processo = "SELECT * FROM processo WHERE proces_contrato <> 'Qualquer Contrato' AND proces_estado_nome = 'Em Curso'";

$faturado = "SELECT
          proces_contrato AS contrato,
          proces_estado_nome AS estado,
          YEAR(fact_auto_data) AS ano,
          ROUND(SUM(IF(MONTH(fact_auto_data) = 1, fact_valor, 0)), 2) AS '1',
          ROUND(SUM(IF(MONTH(fact_auto_data) = 2, fact_valor, 0)), 2) AS '2',
          ROUND(SUM(IF(MONTH(fact_auto_data) = 3, fact_valor, 0)), 2) AS '3',
          ROUND(SUM(IF(MONTH(fact_auto_data) = 4, fact_valor, 0)), 2) AS '4',
          ROUND(SUM(IF(MONTH(fact_auto_data) = 5, fact_valor, 0)), 2) AS '5',
          ROUND(SUM(IF(MONTH(fact_auto_data) = 6, fact_valor, 0)), 2) AS '6',
          ROUND(SUM(IF(MONTH(fact_auto_data) = 7, fact_valor, 0)), 2) AS '7',
          ROUND(SUM(IF(MONTH(fact_auto_data) = 8, fact_valor, 0)), 2) AS '8',
          ROUND(SUM(IF(MONTH(fact_auto_data) = 9, fact_valor, 0)), 2) AS '9',
          ROUND(SUM(IF(MONTH(fact_auto_data) = 10, fact_valor, 0)), 2) AS '10',
          ROUND(SUM(IF(MONTH(fact_auto_data) = 11, fact_valor, 0)), 2) AS '11',
          ROUND(SUM(IF(MONTH(fact_auto_data) = 12, fact_valor, 0)), 2) AS '12',
          ROUND(SUM(fact_valor), 2) AS realizado,
          ROUND(proces_val_adjudicacoes, 2) AS previsto,

          ROUND((SUM(fact_valor) / proces_val_adjudicacoes) * 100, 2) AS taxa_realizacao

          FROM processo 
          INNER JOIN factura ON fact_proces_check = proces_check

          WHERE proces_contrato <> 'Qualquer Contrato'
          AND (proces_estado_nome = 'Em Curso' OR proces_estado_nome = 'Finalizado' OR proces_estado_nome = 'Encerrada')
          AND YEAR(proces_data_adjudicacao) >= YEAR(NOW()) -1
          GROUP BY proces_check, proces_contrato, YEAR(fact_auto_data)
          ORDER BY proces_contrato, YEAR(fact_auto_data) DESC ";

//ROUND(SUM(IF(fact_proces_check = fact_proces_check, fact_valor, 0)), 2) AS realizado,
//ROUND(SUM(IF(p.proces_check = fact_proces_check, p.proces_val_adjudicacoes, 0)), 2) AS previsto,

//$previsto = "SELECT 
//            ROUND(IF(p.proces_check = fact_proces_check, SUM(p.proces_val_adjudicacoes), 0), 2) AS previsto,
//            ROUND((SUM(fact_valor) / SUM(p.proces_val_adjudicacoes)) * 100, 2) AS taxa_realizacao
//            FROM processo;"

$stmt = $myConn->query($faturado);
$data = $stmt->fetchAll(PDO::FETCH_ASSOC);

$stmt2 = $myConn->query($processo);
$processos = $stmt2->fetchAll(PDO::FETCH_ASSOC);

//$stmt = $myConn->query($previsto);
//$data2 = $stmt->fetchAll(PDO::FETCH_ASSOC);

// Set the HTTP Content-Type header to indicate that the response is in JSON format
header('Content-Type: application/json');

//echo json_encode($data);
echo json_encode($processos);





