<?php
//session_start();
include "../../../global/config/dbConn.php";

$query = 'SELECT
				proces_cod AS codigo,
				proces_estado_nome AS estado,
				proces_contrato AS contrato,
				proces_padm AS padm,
				proces_nome AS designacao,
				proces_orc_ano AS ano,
				proces_orc_actividade AS actividade,
				r.rub_tipo AS tipo,
				r.rub_rubrica AS rubrica,
				r.rub_item AS item,
				ROUND((proces_val_base), 2) AS orcamento,
				ROUND((proces_val_adjudicacoes), 2) AS adjudicado,
				ROUND(((proces_val_adjudicacoes)  / (proces_val_base)) * 100, 2) AS orcamento_percent,
				ROUND((proces_val_faturacao), 2) AS faturado,
				ROUND(((proces_val_faturacao)  / (proces_val_adjudicacoes)) * 100, 2) AS faturado_percent
				FROM processo
				INNER JOIN rubricas r ON r.rub_cod = proces_rub_cod
				WHERE proces_report_valores = 1
				ORDER BY proces_estado ASC, proces_cpv_sigla ASC  ';

$stmt = $myConn->query($query);
$data = $stmt->fetchAll(PDO::FETCH_ASSOC);

// Set the HTTP Content-Type header to indicate that the response is in JSON format
header('Content-Type: application/json');

echo json_encode($data);