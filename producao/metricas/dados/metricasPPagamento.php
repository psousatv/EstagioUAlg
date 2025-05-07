<?php
//session_start();
include "../../../global/config/dbConn.php";

$anoIndicador = intval($_GET['anoIndicador']);

$sqlPlanoPagamentosAutos = "SELECT
            pp_ano AS ano,
            pp_mes_previsto AS mes_previsto,
            CASE WHEN pp_valor_previsto <> 0 THEN ROUND(SUM(pp_valor_previsto), 2) ELSE 0 END AS valor_previsto,
            CASE WHEN pp_valor_faturado <> 0 THEN ROUND(SUM(pp_valor_faturado), 2) ELSE 0 END AS valor_faturado
            FROM plano_pagamentos
            WHERE  pp_ano = '" .$anoIndicador. "'
            GROUP BY pp_ano, mes_previsto
            ORDER BY pp_ano, mes_previsto";


$stmt = $myConn->query($sqlPlanoPagamentosAutos);
$data = $stmt->fetchAll(PDO::FETCH_ASSOC);

header('Content-Type: application/json');
echo json_encode($data);

