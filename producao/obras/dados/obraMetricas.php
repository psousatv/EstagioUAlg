<?php

include "../../../global/config/dbConn.php";
$codigoProcesso = intval($_GET['codigoProcesso']);

//$data = [];

$sql = "SELECT
        mt_check AS obra,
        mt_componente_intervencao AS intervencao,
        ROUND(SUM(mt_val_obra),2) AS valor_proposto,
        (SELECT 
            COALESCE(ROUND(SUM(auto_valor),2),1)
            FROM obra_autos WHERE auto_check = mt_check AND auto_componente_intervencao = mt_componente_intervencao) AS valor_trabalhos,
        ROUND(((SELECT 
                COALESCE(ROUND(SUM(auto_valor),2),1)
                FROM obra_autos WHERE auto_check = mt_check AND auto_componente_intervencao = mt_componente_intervencao) /
                ROUND(SUM(mt_val_obra),2) * 100),2) AS percentagem
        
        FROM mapa_trabalhos
        
        WHERE mt_check = '".$codigoProcesso."' AND mt_componente_intervencao NOT LIKE ''
        GROUP BY mt_componente_intervencao
        ORDER BY mt_componente_intervencao";

$stmt = $myConn->query($sql);
$dadosEnviar = $stmt->fetchAll(PDO::FETCH_ASSOC);

//$stmt2 = $myConn->query($sqlComponentesValores);
//$dados2 = $stmt2->fetchAll(PDO::FETCH_ASSOC);

//$dadosEnviar = array_merge($dados1, $dados2)

header('Content-Type: application/json');
echo json_encode($dadosEnviar);
