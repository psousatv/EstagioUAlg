<?php
//session_start();
include "../../../global/config/dbConn.php";

$sqlVistorias = "SELECT
				ent_nome AS entidade,
				proces_check AS processo,
				proces_nome AS designacao,
				historico_datamov AS data_registo,
				MONTH(historico_datamov) AS mes,
				historico_descr_nome AS tipo,
				proces_orc_actividade AS actividade,
				(SELECT historico_datamov FROM historico
				WHERE historico_proces_check = proces_check AND historico_descr_cod = 26 LIMIT 1) as recepcao,
				(SELECT historico_datamov FROM historico
				WHERE historico_proces_check = proces_check AND historico_descr_cod = 25 LIMIT 1) as vistoria,
				historico_valor AS valor,
				historico_doc AS doc,
				historico_num AS doc_num,
				historico_obs AS obs
				FROM historico
				INNER JOIN processo ON proces_check = historico_proces_check
				INNER JOIN entidade ON ent_cod = proces_ent_cod
				WHERE YEAR(historico_datamov) = YEAR(NOW())
				AND historico_obs = 'Programado'
				OR historico_obs = 'Agendado'
				ORDER BY historico_datamov, ent_nome";

$stmt = $myConn->query($sqlVistorias);
$resultados = $stmt->fetchAll(PDO::FETCH_ASSOC);


header('Content-Type: application/json');
echo json_encode($resultados);
