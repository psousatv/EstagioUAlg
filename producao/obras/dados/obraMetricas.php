<?php

include "../../../global/config/dbConn.php";
$codigoProcesso = intval($_GET['codigoProcesso']);

$qryMetricas = "SELECT
                    mt.mt_check AS obra,
                    mt.objecto_grupo AS metrica,
                    ROUND(SUM(mt.mt_val_obra),2) AS valor_proposto,
                    COALESCE(ROUND(SUM(oa.auto_valor),2), 0) AS valor_trabalhos,
                    CASE WHEN SUM(mt.mt_val_obra) > 0 THEN
                              ROUND(SUM(oa.auto_valor) / SUM(mt.mt_val_obra) * 100, 2)
                              ELSE 0 END AS percentagem
                FROM (
                    -- 🔹 agrega trabalhos por grupo
                    SELECT
                        mt_check,
                        mt_objecto,
                        ob.objecto_grupo,
                        SUM(mt_val_obra) AS mt_val_obra
                    FROM mapa_trabalhos mt
                    INNER JOIN projecto_objectos ob ON ob.objecto_cod = mt.mt_objecto_cod
                    WHERE mt.mt_check = :codigoProcesso
                    AND mt.mt_objecto_cod > 0
                    GROUP BY mt_check, mt_objecto, ob.objecto_grupo
                    ) mt
                    LEFT JOIN (
                        -- 🔹 agrega autos por objeto
                        SELECT
                            auto_check,
                            auto_objecto,
                            SUM(auto_valor) AS auto_valor
                        FROM obra_autos
                        WHERE auto_num < 90
                        GROUP BY auto_check, auto_objecto
                    ) oa ON oa.auto_check = mt.mt_check AND oa.auto_objecto = mt.mt_objecto
                GROUP BY mt.objecto_grupo
                ORDER BY mt.objecto_grupo";

$qryMetricasOLD = "SELECT
        mt.mt_check AS obra,
        mt.mt_componente_intervencao AS intervencao,
        mt.mt_objecto AS trabalho,
        ob.objecto_grupo AS metrica,
        COALESCE(ROUND(SUM(mt.mt_val_obra), 2), 0) AS valor_proposto,
        COALESCE((
                SELECT ROUND(SUM(auto_valor), 2)
                FROM obra_autos oa
                WHERE oa.auto_check = mt.mt_check
                AND oa.auto_num < 90
                AND oa.auto_objecto = mt.mt_objecto)
        		, 0) AS valor_trabalhos,
        CASE WHEN SUM(mt.mt_val_obra) > 0 THEN
			ROUND((
				(SELECT COALESCE(SUM(auto_valor), 0)
                 FROM obra_autos oa
                 WHERE oa.auto_check = mt.mt_check
                 AND oa.auto_num < 90
                 AND oa.auto_objecto = mt.mt_objecto
                 ) / SUM(mt.mt_val_obra) * 100), 2) ELSE 0 END 
                 AS percentagem
        FROM mapa_trabalhos mt
        INNER JOIN projecto_objectos ob ON ob.objecto_cod = mt.mt_objecto_cod
        WHERE mt.mt_check = :codigoProcesso
        AND mt.mt_objecto_cod > 0
        GROUP BY ob.objecto_grupo
        ORDER BY ob.objecto_grupo
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
