<?php
//session_start();
include "../../../global/config/dbConn.php";


// dados para dashCandidaturas sem interações - Search ou outras
$query = "SELECT
          proces_cand AS candidatura,
          cs.candsub_estado AS estado,
          cs.candsub_programa AS programa,
          cs.candsub_fundo * 100 AS percent,
          YEAR(cs.candsub_dt_inicio) AS inicio,
          ROUND(SUM(proces_val_adjudicacoes), 2) AS adjudicado,
          ROUND(SUM(proces_cand_elegivel), 2) AS elegivel,
          ROUND(SUM(proces_val_faturacao), 2) AS faturado,
          ROUND(SUM(proces_cand_recebido), 2) AS recebido,
          IF(SUM(proces_val_faturacao) = 0 OR SUM(proces_cand_recebido) = 0, 0,
          ROUND((SUM(proces_cand_recebido) / SUM(proces_val_faturacao))*100, 2)) AS faturado_recebido_percent,
          IF(SUM(proces_cand_elegivel) = 0 OR SUM(proces_cand_recebido) = 0, 0,
          ROUND((SUM(proces_cand_recebido) / SUM(proces_cand_elegivel))*100, 2)) AS elegivel_recebido_percent
          FROM processo
          INNER JOIN candidaturas_submetidas cs ON cs.candsub_codigo = proces_cand
          WHERE proces_cand <> 'n.a.' AND proces_report_valores = 1
          GROUP BY proces_cand
          ORDER BY YEAR(cs.candsub_dt_inicio) DESC ";

$stmt = $myConn->query($query);
$data = $stmt->fetchAll(PDO::FETCH_ASSOC);

// Set the HTTP Content-Type header to indicate that the response is in JSON format
header('Content-Type: application/json');

echo json_encode($data);

