<?php
//session_start();
include "../../../global/config/dbConn.php";

$anoIndicador = intval($_GET['anoIndicador']);
$contrato = $_GET['contrato'];

if($contrato == 'SF'){
    $sql = "SELECT
            pp_ano AS ano,
            pp_mes_previsto AS mes_previsto,
            pp_contrato AS contrato,
            CASE WHEN pp_valor_previsto <> 0 THEN ROUND(SUM(pp_valor_previsto), 2) ELSE 0 END AS valor_previsto,
            CASE WHEN pp_valor_faturado <> 0 THEN ROUND(SUM(pp_valor_faturado), 2) ELSE 0 END AS valor_faturado
            FROM plano_pagamentos
            WHERE  pp_ano = '" .$anoIndicador. "' AND pp_contrato = '" .$contrato. "'
            GROUP BY ano, mes_previsto
            ORDER BY ano, mes_previsto";
    }  elseif($contrato == 'EMP') {
        $sql = "SELECT
        pp_ano AS ano,
        pp_mes_previsto AS mes_previsto,
        pp_contrato AS contrato,
        CASE WHEN pp_valor_previsto <> 0 THEN ROUND(SUM(pp_valor_previsto), 2) ELSE 0 END AS valor_previsto,
        CASE WHEN pp_valor_faturado <> 0 THEN ROUND(SUM(pp_valor_faturado), 2) ELSE 0 END AS valor_faturado
        FROM plano_pagamentos
        WHERE  pp_ano = '" .$anoIndicador. "' AND pp_contrato = '" .$contrato. "'
        GROUP BY ano, mes_previsto
        ORDER BY ano, mes_previsto";
    } else {
        $sql = "SELECT
        pp_ano AS ano,
        pp_mes_previsto AS mes_previsto,
        pp_contrato AS contrato,
        CASE WHEN pp_valor_previsto <> 0 THEN ROUND(SUM(pp_valor_previsto), 2) ELSE 0 END AS valor_previsto,
        CASE WHEN pp_valor_faturado <> 0 THEN ROUND(SUM(pp_valor_faturado), 2) ELSE 0 END AS valor_faturado
        FROM plano_pagamentos
        WHERE  pp_ano = '" .$anoIndicador. "'
        GROUP BY ano, mes_previsto
        ORDER BY ano, mes_previsto";
    };

$stmt = $myConn->query($sql);
$data = $stmt->fetchAll(PDO::FETCH_ASSOC);

header('Content-Type: application/json');
echo json_encode($data);

