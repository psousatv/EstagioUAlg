<?php
//session_start();
include "../../../global/config/dbConn.php";


// dados para dashCandidaturas sem interações - Search ou outras
$query = "SELECT
          proces_check,
          proces_estado_nome AS estado,
          CONCAT(proces_padm, '_', proces_nome) AS nome,
          proces_val_max AS valor_maximo,
          proces_orc_ano AS ano,
          proces_orc_actividade AS sector_actividade,
          proces_orc_rubrica AS tipo_rubrica,
          ru.rub_nome AS rubrica,
          proced_escolha AS procedimento,
          proced_regime AS regime,
          proced_contrato AS contrato,
          IF(LENGTH(proces_data_pub_se) >= 2, 'Sim', 'Não') AS lista_se
          FROM processo
          INNER JOIN procedimento ON proced_cod = proces_proced_cod
          INNER JOIN rubricas ru ON rub_cod = proces_rub_cod
          WHERE proces_orc_ano >= YEAR(NOW())-2 AND proces_proced_cod <> 100 AND proces_estado_nome <> 'Anulado' 
          ORDER BY proces_orc_ano DESC, proces_estado_nome ASC, contrato ";

$stmt = $myConn->query($query);
$data = $stmt->fetchAll(PDO::FETCH_ASSOC);

// Set the HTTP Content-Type header to indicate that the response is in JSON format
header('Content-Type: application/json');

echo json_encode($data);
