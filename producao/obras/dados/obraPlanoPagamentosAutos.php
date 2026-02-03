<?php
//session_start();
include "../../../global/config/dbConn.php";

$codigoProcesso = intval($_GET['codigoProcesso']);

$sqlPlanoPagamentosAutos = "SELECT
            pp_ano AS ano,
            pp_mes_previsto AS mes_previsto,
            pp_auto_num AS auto_num,
            pp_valor_previsto AS valor_previsto,
            pp_mes_realizado AS mes_realizado,
            pp_valor_auto AS valor_auto,
            pp_valor_faturado AS valor_faturado,
            pp_doc_gerado AS documento
            FROM plano_pagamentos
            WHERE pp_proces_check = '" .$codigoProcesso. "'";


$stmt = $myConn->query($sqlPlanoPagamentosAutos);
$data = $stmt->fetchAll(PDO::FETCH_ASSOC);

header('Content-Type: application/json');
echo json_encode($data);