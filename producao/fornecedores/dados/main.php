<?php
//session_start();
include "../../../global/config/dbConn.php";

$sqlVistorias = "SELECT
				historico_datamov AS data,
				(SELECT historico_datamov FROM historico
				WHERE historico_proces_check = proces_check AND historico_descr_cod = 25 LIMIT 1) as vistoria,
				(SELECT historico_datamov FROM historico
				WHERE historico_proces_check = proces_check AND historico_descr_cod = 26 LIMIT 1) as recepcao,
				historico_valor AS valor,
				proces_nome AS processo,
				ent_nome AS entidade
				FROM historico
				INNER JOIN processo ON proces_check = historico_proces_check
				INNER JOIN entidade ON ent_cod = proces_ent_cod
				WHERE historico_obs = 'Agendada'
				ORDER BY historico_datamov, ent_nome";

$stmt = $myConn->query($sqlVistorias);
$resultados = $stmt->fetchAll(PDO::FETCH_ASSOC);


header('Content-Type: application/json');
echo json_encode($resultados);
