<?php
//session_start();
include "../../../global/config/dbConn.php";

$query = 'SELECT
            proces_orc_ano AS ano,
            r.rub_tipo AS tipo,
            r.rub_rubrica AS rubrica,
            r.rub_item AS item,
            ROUND(SUM(proces_val_base), 2) AS orcamento,
            ROUND(SUM(proces_val_adjudicacoes) - SUM(proces_val_faturacao_menos), 2) AS adjudicado,
            IF(SUM(proces_val_base) = 0 OR (SUM(proces_val_adjudicacoes) - SUM(proces_val_faturacao_menos)) = 0, 0, 
            ROUND(((SUM(proces_val_adjudicacoes) - SUM(proces_val_faturacao_menos)) / SUM(proces_val_base)) * 100, 2)) AS percent,
            ROUND(SUM(proces_val_faturacao), 2) AS faturado
            FROM processo
            JOIN rubricas r ON r.rub_cod = proces_rub_cod
            WHERE proces_orc_ano = YEAR(NOW())
            GROUP BY ano, tipo, rubrica, item ';

$stmt = $myConn->query($query);
$data = $stmt->fetchAll(PDO::FETCH_ASSOC);

// Set the HTTP Content-Type header to indicate that the response is in JSON format
header('Content-Type: application/json');

echo json_encode($data);