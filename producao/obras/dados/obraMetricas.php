<?php

include "../../../global/config/dbConn.php";
$codigoProcesso = intval($_GET['codigoProcesso']);

$qryMetricas = "SELECT
        mt.mt_check AS obra,
        mt.mt_componente_intervencao AS intervencao,
        mt.mt_objecto AS trabalho,
        COALESCE(ROUND(SUM(mt.mt_val_obra), 2), 0) AS valor_proposto,
        COALESCE((
                SELECT ROUND(SUM(auto_valor), 2)
                FROM obra_autos oa
                WHERE oa.auto_check = mt.mt_check
                AND oa.auto_objecto = mt.mt_objecto), 0) 
                AS valor_trabalhos,
        CASE 
                WHEN SUM(mt.mt_val_obra) > 0 THEN
                ROUND((
                        (SELECT COALESCE(SUM(auto_valor), 0)
                        FROM obra_autos oa
                        WHERE oa.auto_check = mt.mt_check
                        AND oa.auto_objecto = mt.mt_objecto) / 
                        SUM(mt.mt_val_obra) * 100), 2) ELSE 0 END 
                        AS percentagem
        FROM mapa_trabalhos mt
        WHERE mt.mt_check = :codigoProcesso
        AND mt.mt_componente_intervencao NOT LIKE '%Civil%'
        AND mt.mt_objecto_cod > 0
        GROUP BY mt.mt_objecto
        ORDER BY mt.mt_objecto
        ";

$stmt = $myConn->prepare($qryMetricas);
$stmt->execute([':codigoProcesso' => $codigoProcesso]);
$metricas = $stmt->fetchAll(PDO::FETCH_ASSOC);

// Verifique se a consulta retornou dados
if ($metricas) {
        header('Content-Type: application/json');
        echo json_encode($metricas);
    } else {
        // Se não houver dados, envie uma resposta de erro ou dados vazios
        header('Content-Type: application/json');
        echo json_encode(['error' => 'Nenhuma métrica encontrada para o processo.']);
    }
