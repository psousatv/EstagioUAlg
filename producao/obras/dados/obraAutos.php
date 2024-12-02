<?php
//session_start();
include "../../../global/config/dbConn.php";

$codigoProcesso = intval($_GET['codigoProcesso']);

//Totais de Auto
$sqlAutos = "SELECT
             CASE WHEN fact_auto_num IS NULL THEN 0 ELSE fact_auto_num END AS auto_num,
             CASE WHEN fact_num IS NULL THEN DATE(NOW()) ELSE CONCAT(fact_tipo, '_', fact_num) END AS auto_fatura,
             CASE WHEN fact_auto_data IS NULL THEN DATE(NOW()) ELSE fact_auto_data END AS auto_data,
             CASE WHEN fact_valor IS NULL THEN 0 ELSE fact_valor END AS fact_valor_realizado,
             (SELECT
             CASE WHEN pp_valor_previsto IS NULL THEN 0 ELSE pp_valor_previsto END
             FROM plano_pagamentos pp
             WHERE pp.pp_proces_check = fact_proces_check
             AND pp.pp_auto_previsto = fact_auto_num) AS auto_valor_previsto,
             proces_val_adjudicacoes AS valor_adjudicado
             FROM factura
             LEFT JOIN processo ON proces_check = fact_proces_check
             WHERE fact_tipo = 'FTN' 
             AND fact_proces_check = '" .$codigoProcesso. "'";

$sqlAutosPrevistos = "SELECT
                    pp_auto_previsto AS auto_num,
                    pp_valor_previsto AS auto_previsto,
                    (SELECT 
                    CASE WHEN fact_num IS NULL THEN DATE(NOW()) ELSE CONCAT(fact_tipo, '_', fact_num) END 
                    FROM factura
                    WHERE fact_proces_check = pp_proces_check LIMIT 1) AS auto_fatura,
                    (SELECT
                    CASE WHEN fact_auto_data IS NULL THEN DATE(NOW()) ELSE fact_auto_data END
                    FROM factura 
                    WHERE fact_proces_check = pp_proces_check LIMIT 1) AS auto_data,
                    (SELECT
                    CASE WHEN fact_valor IS NULL THEN 0 ELSE fact_valor END
                    FROM factura 
                    WHERE fact_proces_check = pp_proces_check LIMIT 1) AS fact_valor_realizado,
                    (SELECT
                    CASE WHEN proces_val_adjudicacoes IS NULL THEN 0 ELSE proces_val_adjudicacoes END
                    FROM processo 
                    WHERE proces_check = pp_proces_check LIMIT 1) AS processo_valor_adjudicado
                    FROM plano_pagamentos
                    WHERE  pp_proces_check = '" .$codigoProcesso. "'";


$stmt = $myConn->query($sqlAutos);
$autos = $stmt->fetchAll(PDO::FETCH_ASSOC);

header('Content-Type: application/json');
echo json_encode($autos);