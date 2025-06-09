<?php

include "../../../global/config/dbConn.php";
$codigoProcesso = intval($_GET['codigoProcesso']);

//$data = [];

$sql = "SELECT
        mt_check AS obra,
        mt_componente_area AS area,
        mt_componente_infraestrutura AS infraestrutura,
        mt_componente_intervencao AS intervencao,
        mt_objecto AS objeto,
        ROUND(SUM(mt_val_obra),2) AS valor_proposto,
        (SELECT 
            COALESCE(ROUND(SUM(auto_valor),2),1)
            FROM obra_autos WHERE auto_check = mt_check AND auto_objecto= mt_objecto) AS valor_trabalhos,
        ROUND(((SELECT 
                COALESCE(ROUND(SUM(auto_valor),2),1)
                FROM obra_autos WHERE auto_check = mt_check AND auto_objecto= mt_objecto) /
                ROUND(SUM(mt_val_obra),2) * 100),2) AS percentagem
        
        FROM mapa_trabalhos
        WHERE mt_check = '".$codigoProcesso."' AND length(mt_objecto) > 0
        GROUP BY mt_check, 
        mt_componente_area, mt_componente_infraestrutura, mt_componente_intervencao, mt_objecto";

$stmt = $myConn->query($sql);
$dadosEnviar = $stmt->fetchAll(PDO::FETCH_ASSOC);

//$stmt2 = $myConn->query($sqlComponentesValores);
//$dados2 = $stmt2->fetchAll(PDO::FETCH_ASSOC);

//$dadosEnviar = array_merge($dados1, $dados2)

header('Content-Type: application/json');
echo json_encode($dadosEnviar);
