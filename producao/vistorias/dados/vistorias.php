<?php
//session_start();
include "../../../global/config/dbConn.php";

$sqlVistorias = "SELECT
				ent_nome AS entidade,
				proces_check AS processo,
				proces_nome AS designacao,
				historico_datamov AS data_registo,
				YEAR(historico_datamov) AS ano, 
				MONTH(historico_datamov) AS mes,
				historico_descr_nome AS tipo,
				proces_orc_actividade AS actividade,
				(SELECT historico_datamov fROM historico
				WHERE historico_proces_check = proces_check AND historico_descr_cod = 25 
				ORDER BY historico_datamov DESC LIMIT 1) AS vistoria,
				(SELECT historico_datamov FROM historico
				WHERE historico_proces_check = proces_check AND historico_descr_cod = 26 
				ORDER BY historico_datamov DESC LIMIT 1) AS provisoria,
				(SELECT historico_datamov FROM historico
				WHERE historico_proces_check = proces_check AND historico_descr_cod = 30 
				ORDER BY historico_datamov DESC LIMIT 1) AS definitiva,
				historico_valor AS valor,
				historico_doc AS doc,
				historico_num AS doc_num,
				historico_obs AS obs
				FROM historico
				INNER JOIN processo ON proces_check = historico_proces_check
				INNER JOIN entidade ON ent_cod = proces_ent_cod
				WHERE YEAR(historico_dataemissao) <= YEAR(NOW())
				AND historico_obs LIKE '%Programado%'
				OR historico_obs LIKE '%Agendado%'
				ORDER BY ent_nome, historico_datamov";

$stmt = $myConn->query($sqlVistorias);
$resultados = $stmt->fetchAll(PDO::FETCH_ASSOC);


header('Content-Type: application/json');
echo json_encode($resultados);
