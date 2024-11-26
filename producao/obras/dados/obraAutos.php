<?php
//session_start();
include "../../../global/config/dbConn.php";

$codigoProcesso = intval($_GET['codigoProcesso']);

//Totais de Auto
$sqlAutos = "SELECT
             fact_auto_num AS auto_num,
             CONCAT(fact_tipo, '_', fact_num) AS auto_fatura,
             fact_auto_data AS auto_data,
             fact_valor AS auto_realizado,
             (SELECT 
             pp_valor
             FROM plano_pagamento pp
             WHERE pp.pp_proces_check = fact_proces_check
             AND pp.pp_auto_num = fact_auto_num) AS auto_previsto
             FROM factura
             WHERE fact_tipo = 'FTN' 
             AND fact_proces_check = '" .$codigoProcesso. "'";

$stmt = $myConn->query($sqlAutos);
$autos = $stmt->fetchAll(PDO::FETCH_ASSOC);

header('Content-Type: application/json');
echo json_encode($autos);