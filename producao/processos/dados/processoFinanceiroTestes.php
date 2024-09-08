<?php
//session_start();
include "../../../global/config/dbConn.php";

$codigoProcesso = intval($_GET['codigoProcesso']);
//$q = $_GET['q'];

//Histórico Processos
$processoFaturacao = "SELECT
                    fact_proces_check,
                    year(fact_auto_data) AS ano,
                    month(fact_auto_data) AS mes,
                    round(fact_valor, 2) AS faturado,
                    (SELECT
                        round(sum(CASE WHEN pp_ano = ano AND pp_mes = mes THEN pp_valor ELSE 0 END),2) AS valor
                        FROM plano_pagamento) AS ppgamentos
                    FROM factura
                    INNER JOIN plano_pagamento on pp_proces_check = fact_proces_check
                    WHERE fact_proces_check = '" .$codigoProcesso. "'
                    GROUP BY fact_proces_check, month(fact_auto_data), year(fact_auto_data)
                    ORDER BY fact_auto_num ASC" ;

$stmt = $myConn->query($processoFaturacao);
$data = $stmt->fetchAll(PDO::FETCH_ASSOC);


echo json_encode($data);