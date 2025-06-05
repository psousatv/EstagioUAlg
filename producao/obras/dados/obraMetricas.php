<?php

include "../../../global/config/dbConn.php";

$codigoProcesso = $_GET['codigoProcesso'];

$sqlComponentes = "SELECT * FROM 
                  mapa_trabalhos
                  WHERE mt_conta = 'R' AND 
                        mt_check = '" . $codigoProcesso . "'";

$stmt = $myConn->query($sqlComponentes);
$data = $stmt->fetchAll(PDO::FETCH_ASSOC);

header('Content-Type: application/json');
echo json_encode($data);

printf($data);