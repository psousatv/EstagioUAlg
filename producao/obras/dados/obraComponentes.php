<?php

include "../../../global/config/dbConn.php";

$codigoProcesso = $_GET['codigoProcesso'];

//$sqlComponentes = "SELECT 
//                   mt_check, 
//                   mt_plano_inv, 
//                   mt_componente_area, 
//                   mt_componente_infraestrutura, 
//                   mt_componente_intervencao, 
//                   mt_objecto, 
//                   SUM(mt_qt),
//                   SUM(mt_val_obra),
//                   mt_entidade, 
//                   mt_componente_cod, 
//                   mt_objecto_cod, 
//                   mt_conta
//                   FROM mapa_trabalhos
//                   WHERE mt_conta = 'M' AND 
//                         mt_check = '" . $codigoProcesso . "'
//                   GROUP BY 
//                   mt_check, 
//                   mt_plano_inv, 
//                   mt_componente_area, 
//                   mt_componente_infraestrutura, 
//                   mt_componente_intervencao, 
//                   mt_objecto, 
//                   mt_entidade,
//                   mt_componente_cod, 
//                   mt_objecto_cod, 
//                  mt_conta";

$sqlComponentes = "SELECT * FROM 
                  mapa_trabalhos
                  WHERE mt_conta = 'M' AND 
                        mt_check = '" . $codigoProcesso . "'";

$stmt = $myConn->query($sqlComponentes);
$data = $stmt->fetchAll(PDO::FETCH_ASSOC);

header('Content-Type: application/json');
echo json_encode($data);

