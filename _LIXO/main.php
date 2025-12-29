<?php
//session_start();
include "../../../global/config/dbConn.php";

$query = 'SELECT
proces_contrato AS contrato,
COALESCE(ROUND(SUM(proces_val_adjudicacoes),2), 0) AS adjudicado,
COALESCE(ROUND(SUM(proces_val_faturacao),2), 0) AS faturado,
COALESCE( ROUND((SUM(proces_val_faturacao) / SUM(proces_val_adjudicacoes))*100, 2)), 0) AS percent
FROM processo
WHERE (proces_cod > 0 AND proces_report_valores = 1) AND proces_estado_nome <> "Qualquer Contrato"  
GROUP BY contrato ';

//IF(SUM(proces_val_faturacao) = 0 OR SUM(proces_val_adjudicacoes) = 0, 0, ROUND((SUM(proces_val_faturacao) / SUM(proces_val_adjudicacoes))*100, 2)) AS percent


$stmt = $myConn->query($query);
$data = $stmt->fetchAll(PDO::FETCH_ASSOC);

// Set the HTTP Content-Type header to indicate that the response is in JSON format
header('Content-Type: application/json');

echo json_encode($data);